import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { buildExtractorPrompt } from '../prompts/extractor.js';
import { maskPii } from '../utils/maskPii.js';

export const parseRoute = express.Router();

let _anthropic = null;
function getClient() {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in your .env file.');
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

parseRoute.post('/', async (req, res) => {
  try {
    const { segments, travelerType = 'mid-range' } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({ error: 'No segments provided.' });
    }

    const nonEmpty = segments.filter((s) => {
      if (typeof s === 'string') return s.trim().length > 0;
      if (s?.type === 'text') return typeof s.content === 'string' && s.content.trim().length > 0;
      if (s?.type === 'image' || s?.type === 'pdf') return typeof s.data === 'string' && s.data.length > 0;
      return false;
    });
    if (nonEmpty.length === 0) {
      return res.status(400).json({ error: 'All segments are empty.' });
    }

    // Mask PII in text segments before forwarding to the LLM.
    // Binary segments (image/pdf) pass through unmodified.
    const sanitised = nonEmpty.map((s) => {
      if (typeof s === 'string') return maskPii(s);
      if (s?.type === 'text') return { ...s, content: maskPii(s.content) };
      return s;
    });

    const { system, userContent } = buildExtractorPrompt(sanitised, travelerType);

    const hasPdf = nonEmpty.some((s) => s?.type === 'pdf');
    const requestOptions = hasPdf
      ? { headers: { 'anthropic-beta': 'pdfs-2024-09-25' } }
      : {};

    const msg = await getClient().messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 8192,
      temperature: 0,
      system,
      messages: [{ role: 'user', content: userContent }],
    }, requestOptions);

    const raw = msg.content[0].text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(raw);

    if (parsed.events) {
      // If the model wrote a corrected price in the notes but a different value in
      // price.amount, the notes are usually right (model caught its own misread).
      // Extract "original price X" or "correct price X" patterns from notes and
      // override price.amount when they disagree.
      const PRICE_IN_NOTES = /original\s+price\s+[€$£¥₹]?([\d,]+(?:\.\d+)?)/i;
      parsed.events = parsed.events.map((ev) => {
        if (ev.notes && ev.price?.amount > 0) {
          const m = ev.notes.match(PRICE_IN_NOTES);
          if (m) {
            const notePrice = parseFloat(m[1].replace(/,/g, ''));
            if (!isNaN(notePrice) && Math.abs(notePrice - ev.price.amount) > 0.5) {
              ev.price = { ...ev.price, amount: notePrice };
            }
          }
        }
        return ev;
      });

      parsed.events.sort((a, b) => {
        const da = a.departure ? new Date(a.departure).getTime() : 0;
        const db = b.departure ? new Date(b.departure).getTime() : 0;
        return da - db;
      });
    }

    // Recompute total_cost_extracted_usd from corrected event prices
    if (parsed.trip_summary && parsed.events) {
      const eventsTotal = parsed.events.reduce((sum, ev) => sum + (ev.price?.amount || 0), 0);
      if (eventsTotal > 0) {
        parsed.trip_summary.total_cost_extracted_usd = eventsTotal;
      }
    }

    const HONORIFICS = /^(mr\.?|mrs\.?|ms\.?|miss\.?|dr\.?|prof\.?)\s+/i;
    if (parsed.passengers) {
      parsed.passengers = parsed.passengers.map((p) => ({
        ...p,
        name: p.name ? p.name.replace(HONORIFICS, '').trim() : p.name,
      }));
    }
    if (parsed.trip_summary?.traveler_name) {
      parsed.trip_summary.traveler_name = parsed.trip_summary.traveler_name
        .replace(HONORIFICS, '').trim();
    }

    return res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('[parse] Error:', err);

    if (err?.status === 401) {
      return res.status(401).json({ error: 'Invalid Anthropic API key.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again shortly.' });
    }
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Model returned malformed JSON. Please try again.' });
    }

    return res.status(500).json({ error: err.message || 'Failed to parse documents.' });
  }
});

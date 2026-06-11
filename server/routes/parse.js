import express from 'express';
import OpenAI from 'openai';
import { buildExtractorPrompt } from '../prompts/extractor.js';

export const parseRoute = express.Router();

// Lazily instantiated so a missing key only errors on actual requests
let _openai = null;
function getClient() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in your .env file.');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

parseRoute.post('/', async (req, res) => {
  try {
    const { segments, travelerType = 'mid-range' } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({ error: 'No segments provided.' });
    }

    const nonEmpty = segments.filter((s) => typeof s === 'string' && s.trim().length > 0);
    if (nonEmpty.length === 0) {
      return res.status(400).json({ error: 'All segments are empty.' });
    }

    const { system, user } = buildExtractorPrompt(nonEmpty, travelerType);

    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    // Sort events chronologically by departure date
    if (parsed.events) {
      parsed.events.sort((a, b) => {
        const da = a.departure ? new Date(a.departure).getTime() : 0;
        const db = b.departure ? new Date(b.departure).getTime() : 0;
        return da - db;
      });
    }

    return res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('[parse] Error:', err);

    if (err?.status === 401) {
      return res.status(401).json({ error: 'Invalid OpenAI API key.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: 'OpenAI rate limit exceeded. Please try again shortly.' });
    }

    return res.status(500).json({ error: err.message || 'Failed to parse documents.' });
  }
});

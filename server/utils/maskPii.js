/**
 * Masks sensitive PII from text before it is forwarded to the LLM.
 * Only text segments are masked; binary (image/PDF) content passes through unmodified.
 *
 * Patterns covered:
 *   [EMAIL]    — email addresses
 *   [PHONE]    — international and NANP phone numbers
 *   [CARD]     — credit/debit card numbers (4×4 digit groups)
 *   [SSN]      — US social security numbers (XXX-XX-XXXX)
 *   [PASSPORT] — passport numbers when preceded by a "passport" label
 *
 * None of these fields appear in the extraction schema, so masking does not
 * affect trip parsing accuracy.
 */
export function maskPii(text) {
  if (typeof text !== 'string') return text;

  let out = text;

  // Email addresses
  out = out.replace(
    /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g,
    '[EMAIL]',
  );

  // Credit/debit card — 4 groups of 4 digits separated by space or dash
  out = out.replace(/\b\d{4}[ \-]\d{4}[ \-]\d{4}[ \-]\d{1,4}\b/g, '[CARD]');

  // US Social Security Number — XXX-XX-XXXX or XXX XX XXXX
  out = out.replace(/\b\d{3}[- ]\d{2}[- ]\d{4}\b/g, '[SSN]');

  // International phone — +CC followed by 7–12 digits with common separators
  out = out.replace(
    /\+\d{1,3}[\s.\-]?\(?\d{1,4}\)?(?:[\s.\-]?\d{2,4}){2,4}/g,
    '[PHONE]',
  );

  // NANP phone without country code — (XXX) XXX-XXXX / XXX-XXX-XXXX / XXX.XXX.XXXX
  out = out.replace(/\b(?:\(\d{3}\)|\d{3})[.\- ]\d{3}[.\- ]\d{4}\b/g, '[PHONE]');

  // Passport number when explicitly labeled (keeps the label, masks the value)
  out = out.replace(
    /\b(passport\s*(?:no\.?|number|num\.?|#)?\s*[:=]?\s*)([A-Z]{1,2}\d{6,9}|\d{9})\b/gi,
    (_, label, _num) => `${label}[PASSPORT]`,
  );

  return out;
}

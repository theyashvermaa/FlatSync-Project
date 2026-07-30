const { GoogleGenAI } = require('@google/genai');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Strip sensitive fields and return only what Gemini needs.
 */
const sanitize = (user) => ({
  name: user.name,
  age: user.age,
  aboutMe: user.aboutMe,
  preferences: user.preferences || {},
});

/**
 * Build the Gemini prompt for a match score.
 */
const buildPrompt = (p1, p2) => `You are a flatmate compatibility expert. Compare these two user profiles and determine how compatible they are as flatmates.

Profile A (the person looking for a flat):
${JSON.stringify(p1, null, 2)}

Profile B (the flat owner/lister):
${JSON.stringify(p2, null, 2)}

Analyse their lifestyle preferences including food habits, smoking, alcohol, cleanliness, sleep schedule, work routine, guest frequency, noise tolerance, expense sharing, and personality type.

Respond ONLY with valid JSON — no markdown, no code fences, no preamble, no trailing text. The JSON must have exactly these three keys:
- "matchPercentage": an integer from 0 to 100
- "summary": a string of no more than 20 words explaining the top compatibility reason
- "highlights": an array of 2 to 4 short strings, each at most 4 words, naming specific shared traits

Example:
{"matchPercentage": 74, "summary": "Both prefer quiet environments and share similar sleep schedules.", "highlights": ["Quiet lifestyle", "Early risers", "No smoking"]}`;

/**
 * Returns true when a user profile has fewer than 3 preference fields filled.
 */
const isProfileSparse = (user) => {
  const prefs = user.preferences || {};
  const filled = Object.values(prefs).filter((v) => v && v !== '').length;
  return filled < 3;
};

/**
 * Initialize Google Gen AI client using GEMINI_API_KEY from server/.env
 */
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    throw new Error('GEMINI_API_KEY is not configured in server/.env');
  }
  return new GoogleGenAI({ apiKey });
};

// ─────────────────────────────────────────────
// Non-streaming (cache-hit path)
// ─────────────────────────────────────────────

/**
 * Calls Gemini SDK and returns { matchPercentage, summary, highlights }.
 */
const getMatchScore = async (profile1, profile2) => {
  const ai = getAIClient();
  const p1 = sanitize(profile1);
  const p2 = sanitize(profile2);
  const prompt = buildPrompt(p1, p2);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text;
  return parseRawText(text, profile1, profile2);
};

// ─────────────────────────────────────────────
// Streaming path (SSE)
// ─────────────────────────────────────────────

/**
 * Streams the Gemini response directly to `res` as Server-Sent Events.
 */
const streamMatchScore = async (profile1, profile2, res, signal) => {
  const ai = getAIClient();
  const p1 = sanitize(profile1);
  const p2 = sanitize(profile2);
  const prompt = buildPrompt(p1, p2);

  let rawText = '';
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (signal?.aborted) break;
      const text = chunk.text;
      if (text) {
        rawText += text;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
      }
    }

    const finalResult = parseRawText(rawText, profile1, profile2);
    res.write(`data: ${JSON.stringify({ type: 'result', ...finalResult })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return finalResult;
  } catch (err) {
    console.error('Gemini API Error:', err.message || err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message || 'Gemini API Error' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    throw err;
  }
};

// ─────────────────────────────────────────────
// Response parsing
// ─────────────────────────────────────────────

const parseRawText = (rawText, profile1, profile2) => {
  const sparse = isProfileSparse(profile1) || isProfileSparse(profile2);
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return buildResult(parsed, sparse);
};

const buildResult = (parsed, sparse) => {
  const matchPercentage =
    typeof parsed.matchPercentage === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.matchPercentage)))
      : 50;

  let summary =
    typeof parsed.summary === 'string' && parsed.summary.length > 0
      ? parsed.summary.slice(0, 150)
      : 'Compatibility analysis unavailable.';

  if (sparse) {
    summary = 'Add more preferences to your profile for a better score.';
  }

  const highlights = Array.isArray(parsed.highlights)
    ? parsed.highlights
        .filter((h) => typeof h === 'string' && h.length > 0)
        .slice(0, 4)
        .map((h) => h.slice(0, 30))
    : [];

  return { matchPercentage, summary, highlights };
};

module.exports = { getMatchScore, streamMatchScore };

import { VercelRequest, VercelResponse } from '@vercel/node';
import { ClerkAuth } from '../src/features/recommendation/api/auth';

const auth = new ClerkAuth();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Only POST method is allowed' });
  }

  // Authentication is optional for demo users, but if they provide a token, verify it.
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const authResult = await auth.verifyToken(authHeader);
    if (!authResult.authenticated) {
      return res.status(401).json({ success: false, error: authResult.error || 'Unauthorized' });
    }
  }

  const { query, userCards } = req.body;
  
  if (!query) {
    return res.status(400).json({ success: false, error: 'Missing query' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY is not configured on the server.');
    return res.status(503).json({ success: false, error: 'AI Backend offline due to missing configuration' });
  }

  try {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
    const prompt = `You are Taqdeer, an expert AI credit card & wealth advisor for the Indian market at RenoCred.
User query:"${query}"
User's wallet cards: ${JSON.stringify((userCards || []).map((c: any) => c.label || c.id))}

Provide a short, direct, highly actionable response in 2-4 bullet points or paragraphs. Use emojis and markdown.`;

    const errors: string[] = [];

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            return res.status(200).json({ success: true, content });
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          errors.push(`${model}: HTTP ${response.status} ${JSON.stringify(errData)}`);
        }
      } catch (err: any) {
        errors.push(`${model}: Network Error (${err.message})`);
      }
    }

    console.error('All Gemini models failed:', errors);
    return res.status(502).json({ success: false, error: 'AI Backend failed to generate a response', details: errors });
  } catch (err: any) {
    console.error('Taqdeer API Error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

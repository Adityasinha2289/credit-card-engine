import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const version = process.env.VERCEL_GIT_COMMIT_SHA || 'current build';

  return res.status(200).json({
    status: 'ok',
    version: version,
    timestamp: new Date().toISOString()
  });
}

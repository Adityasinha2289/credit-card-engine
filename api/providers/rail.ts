import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_utils/auth';

export default requireAuth(async (req: VercelRequest, res: VercelResponse, userId: string) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.RAIL_PROVIDER_API_KEY;
  if (!apiKey) {
    // Missing credentials -> UNAVAILABLE
    return res.status(503).json({ success: false, status: 'UNAVAILABLE', error: 'Missing provider credentials' });
  }

  try {
    const params = req.body;
    if (!params) {
      return res.status(400).json({ success: false, status: 'ERROR', error: 'Invalid payload' });
    }
    
    return res.status(200).json({ success: true, status: 'EMPTY_RESULT', data: [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, status: 'ERROR', error: error.message || 'Provider failed' });
  }
});

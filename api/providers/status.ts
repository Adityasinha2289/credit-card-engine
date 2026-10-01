import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Authoritative server-side check for provider configuration
  const status = {
    HOTEL: {
      configured: !!process.env.HOTEL_PROVIDER_API_KEY,
      mode: process.env.HOTEL_PROVIDER_API_KEY ? 'LIVE' : 'UNAVAILABLE'
    },
    FLIGHT: {
      configured: !!process.env.FLIGHT_PROVIDER_API_KEY,
      mode: process.env.FLIGHT_PROVIDER_API_KEY ? 'LIVE' : 'UNAVAILABLE'
    },
    RAIL: {
      configured: !!process.env.RAIL_PROVIDER_API_KEY,
      mode: process.env.RAIL_PROVIDER_API_KEY ? 'LIVE' : 'UNAVAILABLE'
    }
  };

  return res.status(200).json({ success: true, data: status });
}

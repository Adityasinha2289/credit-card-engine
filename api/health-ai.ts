// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const aiApiUrl = process.env.VITE_AI_API_URL;

  if (!aiApiUrl) {
    return res.status(503).json({
      status: 'error',
      message: 'AI API URL not configured',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Attempting a simple GET request to verify the AI backend is reachable.
    // Timeout of 5s to ensure the health check doesn't hang indefinitely.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(aiApiUrl, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok || response.status === 404 || response.status === 401 || response.status === 405) {
      // Even if the base URL returns 404/401/405, it means the service is up and responding.
      return res.status(200).json({
        status: 'ok',
        service: 'ai-backend',
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(503).json({
        status: 'error',
        service: 'ai-backend',
        statusCode: response.status,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    return res.status(503).json({
      status: 'error',
      service: 'ai-backend',
      message: error.name === 'AbortError' ? 'Connection timed out' : 'Failed to connect to AI backend',
      timestamp: new Date().toISOString()
    });
  }
}

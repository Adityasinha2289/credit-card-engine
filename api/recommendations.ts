import { VercelRequest, VercelResponse } from '@vercel/node';
import { RecommendationApiController } from '../src/features/recommendation/api/controller';

const controller = new RecommendationApiController();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed for /api/recommendations',
      },
    });
  }

  const authHeader = req.headers.authorization;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';

  const response = await controller.handlePostRequest(req.body, authHeader, clientIp);

  return res.status(response.statusCode).json(response.payload);
}

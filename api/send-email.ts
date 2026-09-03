import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { ClerkAuth } from '../src/features/recommendation/api/auth';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const auth = new ClerkAuth();


const TEMPLATES: Record<string, (data: any) => { subject: string, html: string }> = {
  welcome: (data) => ({
    subject: `Welcome to RenoCred, ${data.name || 'User'}!`,
    html: `<h1>Welcome to RenoCred, ${data.name || 'User'}!</h1><p>We are excited to help you maximize your credit card rewards.</p>`
  }),
  alert: (data) => ({
    subject: `RenoCred Alert: ${data.title || 'Notification'}`,
    html: `<h2>RenoCred Alert</h2><p>${data.message || 'You have a new notification.'}</p>`
  })
};

// Simple rate limiter for authenticated users (1 per minute)
const rateLimiter = new Map<string, number>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing token' });
    }

    const { template, templateData, to } = req.body;

    if (!template || !TEMPLATES[template]) {
      return res.status(400).json({ success: false, error: 'Invalid or missing template' });
    }

    const { subject, html } = TEMPLATES[template](templateData || {});
    let recipient = to;

    // 1. Check Internal System Auth
    const internalApiKey = process.env.INTERNAL_API_KEY;
    const isInternalSystem = internalApiKey && authHeader === `Bearer ${internalApiKey}`;

    if (!isInternalSystem) {
      // 2. Check User Auth
      const authResult = await auth.verifyToken(authHeader);
      if (!authResult.authenticated || !authResult.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
      }

      const userId = authResult.userId;

      // Rate limiting: 1 email per minute per user
      const now = Date.now();
      const lastRequest = rateLimiter.get(userId) || 0;
      if (now - lastRequest < 60000) {
        return res.status(429).json({ success: false, error: 'Rate limit exceeded. Try again later.' });
      }
      rateLimiter.set(userId, now);

      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing database configuration');
      }

      // Resolve user's email server-side, never trust the client's "to" field
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
      const { data: user, error: dbError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (dbError || !user || !user.email) {
        return res.status(400).json({ success: false, error: 'User email not found' });
      }
      recipient = user.email;
    } else {
      // Internal system can specify 'to'
      if (!recipient) {
        return res.status(400).json({ success: false, error: 'Missing required field: to' });
      }
    }

    // Safety check against unconfigured Resend key
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Email service not configured');
    }

    const data = await resend.emails.send({
      from: 'Renocred <onboarding@resend.dev>',
      to: [recipient],
      subject: subject,
      html: html,
    });

    return res.status(200).json({ success: true, id: data.id || data.data?.id });
  } catch (error: any) {
    // Avoid exposing Resend secrets or stack traces
    console.error('[Email Service Error]', error.message);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
}

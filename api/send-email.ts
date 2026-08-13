// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Make sure to add RESEND_API_KEY to your Vercel Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // We only allow POST requests for sending emails
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, or html' });
    }

    const data = await resend.emails.send({
      from: 'Renocred <onboarding@resend.dev>', // Replace with your verified domain in production
      to: [to],
      subject: subject,
      html: html,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

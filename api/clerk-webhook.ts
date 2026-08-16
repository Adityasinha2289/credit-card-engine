import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

// Environment configuration for serverless backend execution
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!webhookSecret) {
    console.error('[Clerk Webhook Error] Missing CLERK_WEBHOOK_SECRET environment variable.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Clerk Webhook Error] Missing Supabase service role credentials.');
    return res.status(500).json({ error: 'Database configuration error' });
  }

  // 1. Extract Svix headers
  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing required Svix signature headers' });
  }

  // 2. Verify Webhook Signature
  let payload: any;
  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const wh = new Webhook(webhookSecret);
    payload = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err: any) {
    console.error('[Clerk Webhook Verification Failed]', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const eventType = payload.type;
  const eventId = svixId || payload.data?.id;

  // Initialize Supabase Admin Client with Service Role Key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    // 3. Idempotency Check: Verify if event has already been processed
    const { data: existingEvent } = await supabaseAdmin
      .from('processed_webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEvent) {
      console.log(`[Clerk Webhook] Event ${eventId} already processed. Skipping.`);
      return res.status(200).json({ status: 'already_processed', event_id: eventId });
    }

    const userData = payload.data;
    const userId = userData.id;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID in payload' });
    }

    const primaryEmailObj = userData.email_addresses?.find(
      (email: any) => email.id === userData.primary_email_address_id
    ) || userData.email_addresses?.[0];
    const primaryEmail = primaryEmailObj?.email_address || '';

    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'User';
    const imageUrl = userData.image_url || '';
    const primaryPhoneObj = userData.phone_numbers?.[0];
    const primaryPhone = primaryPhoneObj?.phone_number || '';

    // 4. Handle Specific Event Types
    if (eventType === 'user.created') {
      await supabaseAdmin.from('users').upsert({
        id: userId,
        email: primaryEmail,
        name: fullName,
        avatar_url: imageUrl,
        phone: primaryPhone,
        updated_at: new Date().toISOString(),
      });
      console.log(`[Clerk Webhook] Created user ${userId} (${primaryEmail})`);
    } else if (eventType === 'user.updated') {
      // ONLY update Clerk-owned identity fields. DO NOT overwrite RenoCred financial profile fields.
      await supabaseAdmin.from('users').update({
        email: primaryEmail,
        name: fullName,
        avatar_url: imageUrl,
        phone: primaryPhone,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      console.log(`[Clerk Webhook] Updated user identity for ${userId}`);
    } else if (eventType === 'user.deleted') {
      // Safe Deactivation Policy: Mark user as deactivated rather than hard cascading financial data deletion
      await supabaseAdmin.from('users').update({
        phone: 'DEACTIVATED',
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      console.log(`[Clerk Webhook] Deactivated user ${userId}`);
    }

    // 5. Mark Event as Processed in Database (Idempotency Record)
    await supabaseAdmin.from('processed_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      status: 'completed',
      processed_at: new Date().toISOString(),
    });

    return res.status(200).json({ status: 'success', event_id: eventId, event_type: eventType });
  } catch (err: any) {
    console.error(`[Clerk Webhook Processing Exception] ${eventType}:`, err);
    return res.status(500).json({ error: 'Internal processing error', message: err.message });
  }
}

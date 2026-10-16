// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin as supabase } from '../admin/_utils/supabaseAdmin';
import { CommissionCalculator } from '../../src/features/commerce/services/CommissionCalculator';
import crypto from 'crypto';

// Minimal payload expected from network postback
interface ConversionPayload {
  click_id: string; // The UUID tracking_event.click_id (or ID)
  transaction_id: string;
  order_value: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'rejected';
  occurred_at: string;
  partner_identity: string; // Used to confirm attribution
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 64 * 1024;

const getRawBody = async (req: VercelRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    let body = Buffer.alloc(0);
    req.on('data', (chunk) => {
      body = Buffer.concat([body, chunk]);
      if (body.length > MAX_BODY_BYTES) reject(new Error('Body too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
};

function verifyWebhookSignature(signature: string | string[] | undefined, rawBody: Buffer): boolean {
  const expectedSecret = process.env.AFFILIATE_WEBHOOK_SECRET;

  if (!expectedSecret || !signature || typeof signature !== 'string') {
    return false;
  }

  const expectedSignature = crypto.createHmac('sha256', expectedSecret).update(rawBody).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  let rawBody: Buffer;
  try {
    rawBody = await getRawBody(req);
  } catch (e) {
    return res.status(400).json({ success: false, error: 'Failed to read request body' });
  }

  // 1. Webhook Authentication
  if (!verifyWebhookSignature(req.headers['x-affiliate-signature'], rawBody)) {
    return res.status(401).json({ success: false, error: 'Unauthorized webhook signature' });
  }

  let payload: ConversionPayload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
  }

  // 2. Payload Validation
  if (!payload || !payload.click_id || !payload.transaction_id || payload.order_value === undefined) {
    return res.status(400).json({ success: false, error: 'Malformed payload' });
  }
  if (typeof payload.order_value !== 'number' || !Number.isFinite(payload.order_value)) {
    return res.status(400).json({ success: false, error: 'order_value must be a number' });
  }
  if (payload.order_value < 0) {
    return res.status(400).json({ success: false, error: 'Negative order value not permitted' });
  }
  const status = payload.status ?? 'pending';
  if (!['pending', 'confirmed', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  if (payload.currency !== undefined && !/^[A-Z]{3}$/.test(payload.currency)) {
    return res.status(400).json({ success: false, error: 'Invalid currency' });
  }
  if (!UUID_RE.test(String(payload.click_id))) {
    return res.status(404).json({ success: false, error: 'Tracking event not found' });
  }
  if (String(payload.transaction_id).length > 255) {
    return res.status(400).json({ success: false, error: 'transaction_id too long' });
  }
  const occurredAt = payload.occurred_at && !Number.isNaN(Date.parse(payload.occurred_at))
    ? new Date(payload.occurred_at).toISOString()
    : new Date().toISOString();

  try {
    // 3. Attribution Resolution (Locate tracking event)
    const { data: trackingEvent, error: trackingError } = await supabase
      .from('tracking_events')
      .select('id, user_id, partner_id, partners(slug)')
      .eq('id', payload.click_id) // ID is the click_id
      .single();

    if (trackingError || !trackingEvent) {
      return res.status(404).json({ success: false, error: 'Tracking event not found' });
    }

    // 4. Partner Attribution Validation
    const partnerSlug = (trackingEvent.partners as any)?.slug;
    if (payload.partner_identity !== trackingEvent.partner_id && payload.partner_identity !== partnerSlug) {
      return res.status(403).json({ success: false, error: 'Partner attribution mismatch' });
    }

    // 5. Check Idempotency (Attempt to find existing conversion)
    const { data: existingConversion, error: existingErr } = await supabase
      .from('conversions')
      .select('id, status, partner_id')
      .eq('external_transaction_id', payload.transaction_id)
      .maybeSingle();

    let conversionId = existingConversion?.id;

    if (existingConversion) {
      // Security: Ensure we aren't modifying another partner's conversion
      if (existingConversion.partner_id !== trackingEvent.partner_id) {
        return res.status(403).json({ success: false, error: 'Transaction belongs to a different partner' });
      }

      // Idempotent Update
      if (existingConversion.status !== status) {
        const { error: updErr } = await supabase
          .from('conversions')
          .update({ status })
          .eq('id', existingConversion.id);
        if (updErr) throw new Error(`update conversion: ${updErr.message}`);

        // A rejected sale voids its commission; a re-confirmed one reinstates it.
        const commissionStatus = status === 'rejected' ? 'voided' : 'pending';
        const { error: comErr } = await supabase
          .from('commissions')
          .update({ status: commissionStatus })
          .eq('conversion_id', existingConversion.id)
          .in('status', status === 'rejected' ? ['pending', 'adjusted'] : ['voided']);
        if (comErr) throw new Error(`update commission: ${comErr.message}`);
      }
      return res.status(200).json({ success: true, message: 'Conversion updated idempotently' });
    }

    // 6. Create New Conversion
    const { data: newConversion, error: conversionError } = await supabase
      .from('conversions')
      .insert({
        tracking_event_id: trackingEvent.id,
        partner_id: trackingEvent.partner_id,
        external_transaction_id: payload.transaction_id,
        order_value: payload.order_value,
        currency: payload.currency || 'INR',
        status,
        converted_at: occurredAt,
      })
      .select('id')
      .single();

    if (conversionError) {
      // If a race condition caused a unique constraint violation on external_transaction_id,
      // it's an idempotent success since the other request handled it.
      if (conversionError.code === '23505') {
        return res.status(200).json({ success: true, message: 'Conversion processed idempotently (race resolved)' });
      }
      throw new Error('Failed to insert conversion');
    }
    conversionId = newConversion?.id;

    // 7. Commission Calculation
    // At most one active relationship per partner (enforced by a unique index).
    const { data: affiliateRel } = await supabase
      .from('affiliate_relationships')
      .select('commission_model, commission_terms')
      .eq('partner_id', trackingEvent.partner_id)
      .eq('status', 'active')
      .maybeSingle();

    if (affiliateRel) {
      const expectedCommission = CommissionCalculator.calculateExpectedCommission(
        payload.order_value,
        affiliateRel.commission_model,
        affiliateRel.commission_terms
      );

      const commissionStatus = status === 'rejected' ? 'voided' : 'pending';

      const { error: commissionError } = await supabase
        .from('commissions')
        .insert({
          conversion_id: conversionId,
          expected_commission: expectedCommission,
          status: commissionStatus
        });
      // The conversion is recorded either way; a missing commission must be visible in logs.
      if (commissionError) console.error('[conversion] commission insert failed:', commissionError.message);
    }

    return res.status(200).json({ success: true, message: 'Conversion processed successfully' });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

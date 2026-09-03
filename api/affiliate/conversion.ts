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

const getRawBody = async (req: VercelRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    let body = Buffer.alloc(0);
    req.on('data', (chunk) => {
      body = Buffer.concat([body, chunk]);
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
  if (!payload.click_id || !payload.transaction_id || payload.order_value === undefined) {
    return res.status(400).json({ success: false, error: 'Malformed payload' });
  }
  if (payload.order_value < 0) {
    return res.status(400).json({ success: false, error: 'Negative order value not permitted' });
  }

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
      if (existingConversion.status !== payload.status) {
        await supabase
          .from('conversions')
          .update({ status: payload.status, updated_at: new Date().toISOString() })
          .eq('id', existingConversion.id);

        // If status changed to rejected, we void the commission
        if (payload.status === 'rejected') {
          await supabase
            .from('commissions')
            .update({ status: 'voided', updated_at: new Date().toISOString() })
            .eq('conversion_id', existingConversion.id);
        }
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
        status: payload.status || 'pending',
        converted_at: payload.occurred_at || new Date().toISOString(),
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
    const { data: affiliateRel } = await supabase
      .from('affiliate_relationships')
      .select('commission_model, commission_terms')
      .eq('partner_id', trackingEvent.partner_id)
      .eq('status', 'active')
      .single();

    if (affiliateRel) {
      const expectedCommission = CommissionCalculator.calculateExpectedCommission(
        payload.order_value,
        affiliateRel.commission_model,
        affiliateRel.commission_terms
      );

      const commissionStatus = payload.status === 'rejected' ? 'voided' : 'pending';

      await supabase
        .from('commissions')
        .insert({
          conversion_id: conversionId,
          expected_commission: expectedCommission,
          status: commissionStatus
        });
    }

    return res.status(200).json({ success: true, message: 'Conversion processed successfully' });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

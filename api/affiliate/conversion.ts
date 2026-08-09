import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../src/lib/supabase';
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

function verifyWebhookSignature(req: VercelRequest): boolean {
  // In a real system, this would be an HMAC verification using a partner-specific secret.
  // For this project, we use a single environment variable to simulate a secure connection.
  const signature = req.headers['x-affiliate-signature'];
  const expectedSecret = process.env.AFFILIATE_WEBHOOK_SECRET || 'test-secret';
  
  if (!signature) return false;

  const bodyString = JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac('sha256', expectedSecret).update(bodyString).digest('hex');

  // Time-safe string comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(signature as string), Buffer.from(expectedSignature));
  } catch {
    return false; // Different lengths or bad format
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Webhook Authentication
  if (!verifyWebhookSignature(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized webhook signature' });
  }

  const payload = req.body as ConversionPayload;

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
    const { data: existingConversion } = await supabase
      .from('conversions')
      .select('id, status')
      .eq('external_transaction_id', payload.transaction_id)
      .single();

    let conversionId = existingConversion?.id;

    if (existingConversion) {
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

    if (conversionError || !newConversion) {
      throw new Error(conversionError?.message || 'Failed to insert conversion');
    }
    conversionId = newConversion.id;

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

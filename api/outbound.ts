/**
 * POST /api/outbound — resolve where a marketplace click should go and record it.
 *
 * Body: { commerceEntityId: uuid, placement?: string }
 *
 * - Destination, in order: the partner's active affiliate template
 *   ({{CLICK_ID}}, {{ENTITY_ID}}), the entity's absolute https destination, or
 *   the partner website + destination path. Only https URLs are ever returned
 *   (no open redirects, no placeholder domains).
 * - Signed-in users get a click id and a tracking_events row (service role —
 *   clients cannot write tracking rows). Signed-out users are redirected but
 *   not tracked, and get no click id.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { ClerkAuth } from '../src/features/recommendation/api/auth';
import { supabaseAdmin } from './admin/_utils/supabaseAdmin';
import { isUuid } from './admin/_utils/auth';

const auth = new ClerkAuth();

function httpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export function resolveDestination(input: {
  clickId: string;
  entityId: string;
  destinationPath?: string | null;
  partnerWebsite?: string | null;
  trackingTemplate?: string | null;
}): string | null {
  if (input.trackingTemplate) {
    const filled = input.trackingTemplate
      .replaceAll('{{CLICK_ID}}', encodeURIComponent(input.clickId))
      .replaceAll('{{ENTITY_ID}}', encodeURIComponent(input.entityId));
    const url = httpsUrl(filled);
    if (url) return url;
  }
  const direct = httpsUrl(input.destinationPath);
  if (direct) return direct;
  if (input.partnerWebsite && input.destinationPath) {
    try {
      return httpsUrl(new URL(input.destinationPath, input.partnerWebsite).toString());
    } catch {
      return null;
    }
  }
  return httpsUrl(input.partnerWebsite);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' } });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { commerceEntityId } = body;
  const placement = typeof body.placement === 'string' ? body.placement.slice(0, 100) : 'unknown';

  if (!commerceEntityId) {
    return res.status(400).json({ success: false, error: 'Missing commerceEntityId' });
  }
  if (!isUuid(commerceEntityId)) {
    return res.status(404).json({ success: false, error: 'Entity not found or inactive' });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    const authResult = req.headers.authorization ? await auth.verifyToken(req.headers.authorization) : { authenticated: false };
    const userId = authResult.authenticated ? (authResult as any).userId as string : null;

    const { data: entity } = await supabaseAdmin
      .from('commerce_entities')
      .select('id, partner_id, destination_path, base_price, status')
      .eq('id', commerceEntityId)
      .eq('status', 'active')
      .maybeSingle();
    if (!entity) {
      return res.status(404).json({ success: false, error: 'Entity not found or inactive' });
    }

    const [{ data: partner }, { data: affiliate }] = await Promise.all([
      supabaseAdmin.from('partners').select('id, slug, website_url, status').eq('id', entity.partner_id).eq('status', 'active').maybeSingle(),
      supabaseAdmin.from('affiliate_relationships').select('tracking_template_url').eq('partner_id', entity.partner_id).eq('status', 'active').maybeSingle(),
    ]);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const clickId = randomUUID();
    const url = resolveDestination({
      clickId,
      entityId: entity.id,
      destinationPath: entity.destination_path,
      partnerWebsite: partner.website_url,
      trackingTemplate: affiliate?.tracking_template_url,
    });
    if (!url) {
      return res.status(422).json({ success: false, error: 'No destination configured for this item' });
    }

    if (userId) {
      const { error } = await supabaseAdmin.from('tracking_events').insert({
        id: clickId,
        user_id: userId,
        partner_id: partner.id,
        commerce_entity_id: entity.id,
        source_placement: placement || 'unknown',
        recommendation_snapshot: { entityId: entity.id, basePrice: entity.base_price, placement, affiliate: !!affiliate },
      });
      // Tracking must never block the user's navigation.
      if (error) console.error('[outbound] tracking insert failed:', error.message);
    }

    return res.status(200).json({ success: true, url, clickId: userId ? clickId : null });
  } catch (err: any) {
    console.error('[outbound] error:', err?.message || err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

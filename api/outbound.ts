// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import { CommerceRepository } from '../src/features/commerce/repositories';
import { CommerceOptimizationService } from '../src/features/commerce';
import { ClerkAuth } from '../src/features/recommendation/api/auth';
import { supabase, isBackendEnabled } from '../src/lib/supabase';
import crypto from 'crypto';

const auth = new ClerkAuth();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' }
    });
  }

  const { commerceEntityId, placement } = req.body;

  if (!commerceEntityId) {
    return res.status(400).json({ success: false, error: 'Missing commerceEntityId' });
  }

  try {
    const authHeader = req.headers.authorization;
    const authResult = await auth.verifyToken(authHeader);

    let userId = 'demo-user-id'; // Default to demo user for unauthenticated requests
    let isDemo = true;

    if (authResult.authenticated && authResult.userId) {
      userId = authResult.userId;
      isDemo = false;
    }

    // Verify entity exists
    const entities = await CommerceRepository.getCommerceEntities();
    const entity = entities.find(e => e.id === commerceEntityId);

    if (!entity) {
      return res.status(404).json({ success: false, error: 'Entity not found or inactive' });
    }

    const partner = await CommerceRepository.getPartnerById(entity.partnerId);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const clickId = crypto.randomUUID();
    let finalUrl = `https://partner-redirect.example.com/${partner.slug || partner.id}?ref=${clickId}`;

    // isDemo is already determined above

    if (!isDemo && isBackendEnabled && supabase) {
      // Look up affiliate relationship
      const { data: affiliateRelData } = await supabase
        .from('affiliate_relationships')
        .select('*')
        .eq('partner_id', partner.id)
        .eq('status', 'active')
        .single();
      const affiliateRel: any = affiliateRelData;

      if (affiliateRel && affiliateRel.tracking_template) {
         finalUrl = affiliateRel.tracking_template.replace('{{CLICK_ID}}', clickId).replace('{{ENTITY_ID}}', entity.id);
      }

      // Derive recommendation snapshot from trusted server-side optimization
      // instead of trusting client input
      const trustedSnapshot = await CommerceOptimizationService.optimizeEntity(entity, userId);

      // Store tracking event
      await supabase.from('tracking_events').insert({
        id: clickId,
        user_id: userId,
        partner_id: partner.id,
        commerce_entity_id: entity.id,
        placement: placement || 'unknown',
        recommendation_snapshot: trustedSnapshot,
        timestamp: new Date().toISOString()
      } as any);
    }

    return res.status(200).json({
      success: true,
      url: finalUrl,
      clickId: isDemo ? null : clickId
    });

  } catch (err: any) {
    console.error('Outbound Error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

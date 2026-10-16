import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin, isUuid, pick } from './_utils/auth';

const AFFILIATE_FIELDS = ['partner_id', 'network', 'tracking_template_url', 'commission_model', 'commission_terms', 'status'] as const;
const COMMISSION_MODELS = ['cpa', 'cps', 'cpl', 'cpc', 'fixed', 'tiered'];
const isHttpsTemplate = (u: unknown) => typeof u === 'string' && /^https:\/\//.test(u) && u.includes('{{CLICK_ID}}');
import { supabaseAdmin } from './_utils/supabaseAdmin';

export default requireAdmin(async (req: VercelRequest, res: VercelResponse) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  if (req.method === 'GET') {
    // Only return to Admin
    const { data, error } = await supabaseAdmin.from('affiliate_relationships').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'POST') {
    const { partner_id, network, tracking_template_url, commission_model } = req.body;

    if (!partner_id || !network || !tracking_template_url || !commission_model) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (!isUuid(partner_id)) return res.status(400).json({ success: false, error: 'Invalid partner_id' });
    if (!COMMISSION_MODELS.includes(commission_model)) return res.status(400).json({ success: false, error: 'Invalid commission_model' });
    // Users are redirected to this URL: https only, and it must carry the click id for attribution.
    if (!isHttpsTemplate(tracking_template_url)) {
      return res.status(400).json({ success: false, error: 'tracking_template_url must be https and contain {{CLICK_ID}}' });
    }

    const { data, error } = await supabaseAdmin
      .from('affiliate_relationships')
      .insert(pick(req.body, AFFILIATE_FIELDS))
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PATCH') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ success: false, error: 'Missing affiliate ID' });
    if (!isUuid(id)) return res.status(400).json({ success: false, error: 'Invalid id' });

    const updates: Record<string, any> = pick(req.body, AFFILIATE_FIELDS);
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, error: 'No updatable fields' });
    if (updates.commission_model && !COMMISSION_MODELS.includes(updates.commission_model)) {
      return res.status(400).json({ success: false, error: 'Invalid commission_model' });
    }
    if (updates.tracking_template_url !== undefined && !isHttpsTemplate(updates.tracking_template_url)) {
      return res.status(400).json({ success: false, error: 'tracking_template_url must be https and contain {{CLICK_ID}}' });
    }

    const { data, error } = await supabaseAdmin
      .from('affiliate_relationships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

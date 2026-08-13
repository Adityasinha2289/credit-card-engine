import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_utils/auth';
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

    const { data, error } = await supabaseAdmin
      .from('affiliate_relationships')
      .insert(req.body)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PATCH') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ success: false, error: 'Missing affiliate ID' });

    const updates = req.body;
    
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

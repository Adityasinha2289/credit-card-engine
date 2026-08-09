import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './utils/auth';
import { supabaseAdmin } from './utils/supabaseAdmin';

export default requireAdmin(async (req: VercelRequest, res: VercelResponse) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('commerce_entities').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'POST') {
    const { partner_id, name, entity_type, base_price, destination_path } = req.body;
    
    if (!partner_id || !name || !entity_type || base_price === undefined || !destination_path) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (base_price < 0) {
       return res.status(400).json({ success: false, error: 'Price cannot be negative' });
    }

    const { data, error } = await supabaseAdmin
      .from('commerce_entities')
      .insert(req.body)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PATCH') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ success: false, error: 'Missing entity ID' });

    const updates = req.body;
    if (updates.base_price !== undefined && updates.base_price < 0) {
      return res.status(400).json({ success: false, error: 'Price cannot be negative' });
    }
    
    const { data, error } = await supabaseAdmin
      .from('commerce_entities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

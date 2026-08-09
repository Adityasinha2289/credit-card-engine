import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './utils/auth';
import { supabaseAdmin } from './utils/supabaseAdmin';

export default requireAdmin(async (req: VercelRequest, res: VercelResponse) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('partners').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'POST') {
    const { name, slug, description, logo_url, is_sponsored, status, primary_category_id } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Name and slug are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('partners')
      .insert({ name, slug, description, logo_url, is_sponsored, status, primary_category_id })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PATCH') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ success: false, error: 'Missing partner ID' });

    const updates = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('partners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

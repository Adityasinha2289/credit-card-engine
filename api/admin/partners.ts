import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './utils/auth';
import { supabaseAdmin } from './utils/supabaseAdmin';

export default requireAdmin(async (req: VercelRequest, res: VercelResponse) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  const id = req.query.id as string;

  if (req.method === 'GET') {
    if (id) {
      const { data, error } = await supabaseAdmin.from('partners').select('*').eq('id', id).single();
      if (error) return res.status(404).json({ success: false, error: 'Partner not found' });
      return res.status(200).json({ success: true, data });
    }
    const { data, error } = await supabaseAdmin.from('partners').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'POST') {
    const { name, slug, description, logo_url, is_sponsored, status, primary_category_id } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Name and slug are required' });
    }

    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const { data, error } = await supabaseAdmin
      .from('partners')
      .insert({ name, slug, description, logo_url, is_sponsored, status, primary_category_id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return res.status(409).json({ success: false, error: 'Partner slug already exists' });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PATCH') {
    if (!id) return res.status(400).json({ success: false, error: 'Missing partner ID' });

    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    if (updates.status && !['active', 'inactive'].includes(updates.status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const { data, error } = await supabaseAdmin
      .from('partners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return res.status(409).json({ success: false, error: 'Partner slug already exists' });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

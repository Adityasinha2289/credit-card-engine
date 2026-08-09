import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './utils/auth';
import { supabaseAdmin } from './utils/supabaseAdmin';

export default requireAdmin(async (req: VercelRequest, res: VercelResponse) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('offers').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'POST') {
    const { title, source, offer_type, value, valid_until, description } = req.body;
    
    if (!title || !source || !offer_type || value === undefined || !valid_until || !description) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (value < 0) {
       return res.status(400).json({ success: false, error: 'Offer value cannot be negative' });
    }
    
    if (req.body.min_spend !== undefined && req.body.min_spend < 0) {
       return res.status(400).json({ success: false, error: 'Min spend cannot be negative' });
    }

    const { data, error } = await supabaseAdmin
      .from('offers')
      .insert(req.body)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PATCH') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ success: false, error: 'Missing offer ID' });

    const updates = req.body;
    
    if (updates.value !== undefined && updates.value < 0) {
       return res.status(400).json({ success: false, error: 'Offer value cannot be negative' });
    }
    
    const { data, error } = await supabaseAdmin
      .from('offers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

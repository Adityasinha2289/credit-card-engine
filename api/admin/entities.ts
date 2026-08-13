import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_utils/auth';
import { supabaseAdmin } from './_utils/supabaseAdmin';

export default requireAdmin(async (req: VercelRequest, res: VercelResponse) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  const id = req.query.id as string;
  const validTypes = ['product', 'service', 'experience', 'subscription', 'booking', 'venue'];
  const validStatuses = ['active', 'inactive', 'out_of_stock'];

  if (req.method === 'GET') {
    if (id) {
       const { data, error } = await supabaseAdmin.from('commerce_entities').select(`*, partners(name), categories(name)`).eq('id', id).single();
       if (error) return res.status(404).json({ success: false, error: 'Entity not found' });
       return res.status(200).json({ success: true, data });
    }

    const { data, error } = await supabaseAdmin.from('commerce_entities')
      .select(`
        *,
        partners:partner_id(name),
        categories:category_id(name)
      `)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'POST') {
    const { partner_id, name, entity_type, base_price, destination_path, status } = req.body;
    
    if (!partner_id || !name || !entity_type || base_price === undefined || !destination_path) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (base_price < 0) {
       return res.status(400).json({ success: false, error: 'Price cannot be negative' });
    }

    if (!validTypes.includes(entity_type)) {
       return res.status(400).json({ success: false, error: 'Invalid entity type' });
    }

    if (status && !validStatuses.includes(status)) {
       return res.status(400).json({ success: false, error: 'Invalid status' });
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
    if (!id) return res.status(400).json({ success: false, error: 'Missing entity ID' });

    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;
    delete updates.last_verified_at;

    if (updates.base_price !== undefined && updates.base_price < 0) {
      return res.status(400).json({ success: false, error: 'Price cannot be negative' });
    }
    
    if (updates.entity_type && !validTypes.includes(updates.entity_type)) {
       return res.status(400).json({ success: false, error: 'Invalid entity type' });
    }

    if (updates.status && !validStatuses.includes(updates.status)) {
       return res.status(400).json({ success: false, error: 'Invalid status' });
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

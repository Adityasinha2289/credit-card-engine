import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_utils/auth';
import { supabaseAdmin } from './_utils/supabaseAdmin';

export default requireAdmin(async (req: VercelRequest, res: VercelResponse) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  const id = req.query.id as string;

  const validSources = ['merchant', 'bank', 'card_network', 'renocred'];
  const validTypes = ['percentage_discount', 'flat_discount', 'cashback', 'points', 'miles'];
  const validStatuses = ['active', 'expired'];

  if (req.method === 'GET') {
    if (id) {
       const { data, error } = await supabaseAdmin.from('offers').select('*').eq('id', id).single();
       if (error) return res.status(404).json({ success: false, error: 'Offer not found' });
       return res.status(200).json({ success: true, data });
    }

    const { data, error } = await supabaseAdmin.from('offers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'POST') {
    const { 
      source, offer_type, value, title, description, 
      min_spend, max_discount, valid_from, valid_until, 
      status, eligibility_rules 
    } = req.body;
    
    if (!source || !offer_type || value === undefined || !title || !valid_from || !valid_until) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (!validSources.includes(source)) return res.status(400).json({ success: false, error: 'Invalid source' });
    if (!validTypes.includes(offer_type)) return res.status(400).json({ success: false, error: 'Invalid offer type' });
    
    if (value < 0) return res.status(400).json({ success: false, error: 'Value cannot be negative' });
    if (offer_type === 'percentage_discount' && value > 100) return res.status(400).json({ success: false, error: 'Percentage cannot exceed 100' });
    
    if (min_spend !== undefined && min_spend < 0) return res.status(400).json({ success: false, error: 'min_spend cannot be negative' });
    if (max_discount !== undefined && max_discount < 0) return res.status(400).json({ success: false, error: 'max_discount cannot be negative' });

    if (new Date(valid_until) <= new Date(valid_from)) return res.status(400).json({ success: false, error: 'valid_until must be after valid_from' });

    if (status && !validStatuses.includes(status)) return res.status(400).json({ success: false, error: 'Invalid status' });

    // Sync redundant constraints directly into eligibility rules JSON blob for OptimizationEngine compatibility
    const safeEligibility = eligibility_rules || {};
    if (min_spend !== undefined && min_spend > 0) safeEligibility.minSpend = min_spend;
    if (max_discount !== undefined && max_discount > 0) safeEligibility.maxDiscount = max_discount;

    const payload = {
      source, offer_type, value, title, description: description || '',
      min_spend: min_spend || 0, max_discount: max_discount || null,
      valid_from, valid_until, status: status || 'active',
      eligibility_rules: safeEligibility
    };

    const { data, error } = await supabaseAdmin
      .from('offers')
      .insert(payload)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PATCH') {
    if (!id) return res.status(400).json({ success: false, error: 'Missing offer ID' });

    const updates = { ...req.body };
    // Prevent overriding system fields
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;
    delete updates.internal_campaign_metadata;

    if (updates.source && !validSources.includes(updates.source)) return res.status(400).json({ success: false, error: 'Invalid source' });
    if (updates.offer_type && !validTypes.includes(updates.offer_type)) return res.status(400).json({ success: false, error: 'Invalid offer type' });
    
    if (updates.value !== undefined && updates.value < 0) return res.status(400).json({ success: false, error: 'Value cannot be negative' });
    if (updates.offer_type === 'percentage_discount' && updates.value > 100) return res.status(400).json({ success: false, error: 'Percentage cannot exceed 100' });
    // Also check if we are updating value without updating offer_type, which might conflict.
    // In a real app we'd fetch the existing to validate cross-field constraints, but here we enforce if explicitly provided.
    
    if (updates.min_spend !== undefined && updates.min_spend < 0) return res.status(400).json({ success: false, error: 'min_spend cannot be negative' });
    if (updates.max_discount !== undefined && updates.max_discount < 0) return res.status(400).json({ success: false, error: 'max_discount cannot be negative' });

    if (updates.status && !validStatuses.includes(updates.status)) return res.status(400).json({ success: false, error: 'Invalid status' });

    if (updates.eligibility_rules) {
      // Sync redundant constraints
      const safeEligibility = updates.eligibility_rules;
      if (updates.min_spend !== undefined && updates.min_spend > 0) safeEligibility.minSpend = updates.min_spend;
      if (updates.max_discount !== undefined && updates.max_discount > 0) safeEligibility.maxDiscount = updates.max_discount;
      updates.eligibility_rules = safeEligibility;
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

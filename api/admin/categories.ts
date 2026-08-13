import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_utils/auth';
import { supabaseAdmin } from './_utils/supabaseAdmin';

export default requireAdmin(async (req: VercelRequest, res: VercelResponse) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Database admin client not configured' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('categories').select('*').order('name', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});

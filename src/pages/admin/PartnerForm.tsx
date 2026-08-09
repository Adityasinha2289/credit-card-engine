import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/shared/PageContainer';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

export default function PartnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const isEditing = id && id !== 'new';
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    primary_category_id: '',
    is_sponsored: false,
    status: 'active'
  });
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const token = await getToken();
        const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
        
        // Fetch categories
        const catRes = await fetch('/api/admin/categories', { headers: { Authorization: authHeader }});
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.data);
        }
        
        // Fetch partner if editing
        if (isEditing) {
          const res = await fetch(`/api/admin/partners?id=${id}`, { headers: { Authorization: authHeader }});
          const data = await res.json();
          if (data.success && data.data) {
            const p = data.data;
            setFormData({
              name: p.name || '',
              slug: p.slug || '',
              description: p.description || '',
              logo_url: p.logo_url || '',
              primary_category_id: p.primary_category_id || '',
              is_sponsored: !!p.is_sponsored,
              status: p.status || 'active'
            });
          } else {
            toast.error('Failed to load partner');
            navigate('/admin/partners');
          }
        }
      } catch (err) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditing, getToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }
    
    setSaving(true);
    try {
      const token = await getToken();
      const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
      
      const payload = {
        ...formData,
        primary_category_id: formData.primary_category_id || null
      };

      const url = isEditing ? `/api/admin/partners?id=${id}` : '/api/admin/partners';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? 'Partner updated' : 'Partner created');
        navigate('/admin/partners');
      } else {
        toast.error(data.error || 'Failed to save partner');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Loading...">
        <div className="p-8 text-center text-white/50">Loading partner data...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={isEditing ? 'Edit Partner' : 'Create Partner'}>
      <form onSubmit={handleSubmit} className="max-w-2xl bg-[#1a1a1a] rounded-xl border border-white/5 p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Slug * (must be unique)</label>
            <input
              type="text"
              required
              pattern="^[a-z0-9-]+$"
              title="Lowercase alphanumeric and hyphens only"
              value={formData.slug}
              onChange={e => setFormData(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Logo URL</label>
          <input
            type="url"
            value={formData.logo_url}
            onChange={e => setFormData(f => ({ ...f, logo_url: e.target.value }))}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Primary Category</label>
            <select
              value={formData.primary_category_id}
              onChange={e => setFormData(f => ({ ...f, primary_category_id: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">-- None --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_sponsored"
            checked={formData.is_sponsored}
            onChange={e => setFormData(f => ({ ...f, is_sponsored: e.target.checked }))}
            className="w-4 h-4 rounded border-white/10 bg-black text-emerald-500 focus:ring-emerald-500/50"
          />
          <label htmlFor="is_sponsored" className="text-sm font-medium text-white/70">
            Is Sponsored Partner
          </label>
        </div>

        <div className="pt-6 flex items-center justify-end gap-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => navigate('/admin/partners')}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Partner'}
          </button>
        </div>

      </form>
    </PageContainer>
  );
}

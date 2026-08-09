import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/shared/PageContainer';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

export default function EntityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const isEditing = id && id !== 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    partner_id: '',
    category_id: '',
    entity_type: 'product',
    name: '',
    description: '',
    sku: '',
    image_url: '',
    base_price: 0,
    currency: 'INR',
    destination_path: '',
    is_sponsored: false,
    status: 'active'
  });
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [partners, setPartners] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const token = await getToken();
        const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
        
        // Fetch categories & partners in parallel
        const [catRes, partRes] = await Promise.all([
          fetch('/api/admin/categories', { headers: { Authorization: authHeader }}),
          fetch('/api/admin/partners', { headers: { Authorization: authHeader }})
        ]);
        
        const catData = await catRes.json();
        const partData = await partRes.json();
        
        if (catData.success) setCategories(catData.data);
        if (partData.success) setPartners(partData.data);
        
        // Fetch entity if editing
        if (isEditing) {
          const res = await fetch(`/api/admin/entities?id=${id}`, { headers: { Authorization: authHeader }});
          const data = await res.json();
          if (data.success && data.data) {
            const e = data.data;
            setFormData({
              partner_id: e.partner_id || '',
              category_id: e.category_id || '',
              entity_type: e.entity_type || 'product',
              name: e.name || '',
              description: e.description || '',
              sku: e.sku || '',
              image_url: e.image_url || '',
              base_price: e.base_price || 0,
              currency: e.currency || 'INR',
              destination_path: e.destination_path || '',
              is_sponsored: !!e.is_sponsored,
              status: e.status || 'active'
            });
          } else {
            toast.error('Failed to load entity');
            navigate('/admin/entities');
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
    if (!formData.partner_id || !formData.name || formData.base_price < 0 || !formData.destination_path) {
      toast.error('Please fill all required fields correctly.');
      return;
    }
    
    setSaving(true);
    try {
      const token = await getToken();
      const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
      
      const payload = {
        ...formData,
        category_id: formData.category_id || null,
        base_price: Number(formData.base_price)
      };

      const url = isEditing ? `/api/admin/entities?id=${id}` : '/api/admin/entities';
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
        toast.success(isEditing ? 'Entity updated' : 'Entity created');
        navigate('/admin/entities');
      } else {
        toast.error(data.error || 'Failed to save entity');
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
        <div className="p-8 text-center text-white/50">Loading entity data...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={isEditing ? 'Edit Commerce Entity' : 'Create Commerce Entity'}>
      <form onSubmit={handleSubmit} className="max-w-3xl bg-[#1a1a1a] rounded-xl border border-white/5 p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Partner *</label>
            <select
              required
              value={formData.partner_id}
              onChange={e => setFormData(f => ({ ...f, partner_id: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">-- Select Partner --</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Category</label>
            <select
              value={formData.category_id}
              onChange={e => setFormData(f => ({ ...f, category_id: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">-- None --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white/70">Entity Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Entity Type *</label>
            <select
              required
              value={formData.entity_type}
              onChange={e => setFormData(f => ({ ...f, entity_type: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="experience">Experience</option>
              <option value="subscription">Subscription</option>
              <option value="booking">Booking</option>
              <option value="venue">Venue</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Base Price *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.base_price}
              onChange={e => setFormData(f => ({ ...f, base_price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Currency</label>
            <input
              type="text"
              value={formData.currency}
              onChange={e => setFormData(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
              maxLength={3}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">SKU (Optional)</label>
            <input
              type="text"
              value={formData.sku}
              onChange={e => setFormData(f => ({ ...f, sku: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Destination Path *</label>
            <input
              type="text"
              required
              placeholder="/product-path or https://..."
              value={formData.destination_path}
              onChange={e => setFormData(f => ({ ...f, destination_path: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.image_url}
              onChange={e => setFormData(f => ({ ...f, image_url: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_sponsored"
                checked={formData.is_sponsored}
                onChange={e => setFormData(f => ({ ...f, is_sponsored: e.target.checked }))}
                className="w-4 h-4 rounded border-white/10 bg-black text-emerald-500 focus:ring-emerald-500/50"
              />
              <label htmlFor="is_sponsored" className="text-sm font-medium text-white/70">
                Sponsored Entity
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white/70">Status:</label>
              <select
                value={formData.status}
                onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                className="px-3 py-1 bg-black border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/entities')}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Entity'}
            </button>
          </div>
        </div>

      </form>
    </PageContainer>
  );
}

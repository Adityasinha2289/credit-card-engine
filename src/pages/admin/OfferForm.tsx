import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/shared/PageContainer';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { EligibilityBuilder, type EligibilityRules } from '../../features/admin/components/EligibilityBuilder';

export default function OfferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const isEditing = id && id !== 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source: 'merchant',
    offer_type: 'percentage_discount',
    value: 0,
    min_spend: 0,
    max_discount: 0,
    valid_from: new Date().toISOString().slice(0, 16),
    valid_until: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 16),
    status: 'active'
  });

  const [eligibilityRules, setEligibilityRules] = useState<EligibilityRules>({});
  
  const [categories, setCategories] = useState<{id: string, slug: string, name: string}[]>([]);
  const [partners, setPartners] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const token = await getToken();
        const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
        
        // Fetch lookup data
        const [catRes, partRes] = await Promise.all([
          fetch('/api/admin/categories', { headers: { Authorization: authHeader }}),
          fetch('/api/admin/partners', { headers: { Authorization: authHeader }})
        ]);
        
        const catData = await catRes.json();
        const partData = await partRes.json();
        
        if (catData.success) setCategories(catData.data);
        if (partData.success) setPartners(partData.data);
        
        // Fetch offer if editing
        if (isEditing) {
          const res = await fetch(`/api/admin/offers?id=${id}`, { headers: { Authorization: authHeader }});
          const data = await res.json();
          if (data.success && data.data) {
            const o = data.data;
            setFormData({
              title: o.title || '',
              description: o.description || '',
              source: o.source || 'merchant',
              offer_type: o.offer_type || 'percentage_discount',
              value: o.value || 0,
              min_spend: o.min_spend || 0,
              max_discount: o.max_discount || 0,
              valid_from: new Date(o.valid_from).toISOString().slice(0, 16),
              valid_until: new Date(o.valid_until).toISOString().slice(0, 16),
              status: o.status || 'active'
            });
            setEligibilityRules(o.eligibility_rules || {});
          } else {
            toast.error('Failed to load offer');
            navigate('/admin/offers');
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
    if (!formData.title || formData.value < 0) {
      toast.error('Please fix validation errors');
      return;
    }
    
    if (new Date(formData.valid_until) <= new Date(formData.valid_from)) {
      toast.error('Valid Until must be after Valid From');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
      
      const payload = {
        ...formData,
        value: Number(formData.value),
        min_spend: Number(formData.min_spend),
        max_discount: Number(formData.max_discount),
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        eligibility_rules: eligibilityRules
      };

      const url = isEditing ? `/api/admin/offers?id=${id}` : '/api/admin/offers';
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
        toast.success(isEditing ? 'Offer updated' : 'Offer created');
        navigate('/admin/offers');
      } else {
        toast.error(data.error || 'Failed to save offer');
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
        <div className="p-8 text-center text-white/50">Loading offer data...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={isEditing ? 'Edit Offer' : 'Create Offer'}>
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        
        {/* Step 1: Basic Info */}
        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">1. Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/70">Offer Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. 20% Off on Nike Shoes"
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/70">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Source *</label>
              <select
                required
                value={formData.source}
                onChange={e => setFormData(f => ({ ...f, source: e.target.value }))}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="merchant">Merchant (Partner)</option>
                <option value="bank">Bank</option>
                <option value="card_network">Card Network (Visa/Mastercard)</option>
                <option value="renocred">RenoCred Exclusive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Benefit */}
        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">2. Benefit Mechanics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Offer Type *</label>
              <select
                required
                value={formData.offer_type}
                onChange={e => setFormData(f => ({ ...f, offer_type: e.target.value }))}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="percentage_discount">Percentage Discount (%)</option>
                <option value="flat_discount">Flat Discount (₹)</option>
                <option value="cashback">Cashback</option>
                <option value="points">Reward Points</option>
                <option value="miles">Miles</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Value *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                max={formData.offer_type === 'percentage_discount' ? 100 : undefined}
                value={formData.value}
                onChange={e => setFormData(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Minimum Spend (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.min_spend}
                onChange={e => setFormData(f => ({ ...f, min_spend: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Maximum Discount Cap (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.max_discount}
                onChange={e => setFormData(f => ({ ...f, max_discount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                disabled={formData.offer_type === 'flat_discount'}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Eligibility */}
        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">3. Eligibility Rules</h3>
          
          <EligibilityBuilder
            rules={eligibilityRules}
            onChange={setEligibilityRules}
            categories={categories}
            partners={partners}
          />
        </div>

        {/* Step 4: Validity */}
        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">4. Validity & Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Valid From *</label>
              <input
                type="datetime-local"
                required
                value={formData.valid_from}
                onChange={e => setFormData(f => ({ ...f, valid_from: e.target.value }))}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Valid Until *</label>
              <input
                type="datetime-local"
                required
                value={formData.valid_until}
                onChange={e => setFormData(f => ({ ...f, valid_until: e.target.value }))}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="active">Active / Scheduled</option>
                <option value="expired">Expired (Inactive)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => navigate('/admin/offers')}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Offer Configuration'}
          </button>
        </div>

      </form>
    </PageContainer>
  );
}

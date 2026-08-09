import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { toast } from 'sonner';

interface Partner {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchPartners() {
      try {
        const token = await getToken();
        // Fallback for local dev/testing
        const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
        const res = await fetch('/api/admin/partners', {
          headers: { Authorization: authHeader }
        });
        const data = await res.json();
        
        if (data.success) {
          setPartners(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load partners');
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, [getToken]);

  const toggleStatus = async (partner: Partner) => {
    if (partner.status === 'active' && !confirm(`Are you sure you want to deactivate ${partner.name}? Active commerce entities mapped to this partner may become unfulfillable.`)) {
      return;
    }
    
    try {
      const token = await getToken();
      const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
      const newStatus = partner.status === 'active' ? 'inactive' : 'active';
      
      const res = await fetch(`/api/admin/partners?id=${partner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        setPartners(partners.map(p => p.id === partner.id ? { ...p, status: newStatus } : p));
        toast.success(`Partner ${newStatus}`);
      } else {
        toast.error(data.error || 'Failed to update partner');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer title="Partner Management">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
          <input
            type="text"
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <button
          onClick={() => navigate('/admin/partners/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Partner
        </button>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Loading Partners...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : partners.length === 0 ? (
          <div className="p-8 text-center text-white/50">No partners found. Create your first partner.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-black/20 text-xs uppercase text-white/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{partner.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{partner.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        partner.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-white/5 text-white/40'
                      }`}>
                        {partner.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(partner.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(partner)}
                          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-white"
                          title={partner.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {partner.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/partners/${partner.id}`)}
                          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

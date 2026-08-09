import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { toast } from 'sonner';

interface Entity {
  id: string;
  name: string;
  entity_type: string;
  base_price: number;
  currency: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  partners: { name: string } | null;
  categories: { name: string } | null;
  updated_at: string;
}

export default function EntityManagement() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchEntities() {
      try {
        const token = await getToken();
        const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
        const res = await fetch('/api/admin/entities', {
          headers: { Authorization: authHeader }
        });
        const data = await res.json();
        
        if (data.success) {
          setEntities(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load entities');
      } finally {
        setLoading(false);
      }
    }
    fetchEntities();
  }, [getToken]);

  const toggleStatus = async (entity: Entity) => {
    if (entity.status === 'active' && !confirm(`Are you sure you want to deactivate ${entity.name}?`)) {
      return;
    }
    
    try {
      const token = await getToken();
      const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
      const newStatus = entity.status === 'active' ? 'inactive' : 'active';
      
      const res = await fetch(`/api/admin/entities?id=${entity.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        setEntities(entities.map(e => e.id === entity.id ? { ...e, status: newStatus } : e));
        toast.success(`Entity ${newStatus}`);
      } else {
        toast.error(data.error || 'Failed to update entity');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.partners?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer title="Commerce Entities">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
          <input
            type="text"
            placeholder="Search by entity or partner name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <button
          onClick={() => navigate('/admin/entities/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Entity
        </button>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Loading Commerce Entities...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : entities.length === 0 ? (
          <div className="p-8 text-center text-white/50">No entities found. Create your first entity.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-black/20 text-xs uppercase text-white/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Entity Name</th>
                  <th className="px-6 py-4 font-medium">Partner</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEntities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      <div>{entity.name}</div>
                      {entity.categories && <div className="text-xs text-white/40">{entity.categories.name}</div>}
                    </td>
                    <td className="px-6 py-4">{entity.partners?.name || '-'}</td>
                    <td className="px-6 py-4 capitalize">{entity.entity_type}</td>
                    <td className="px-6 py-4">{entity.base_price} {entity.currency}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        entity.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : entity.status === 'out_of_stock'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-white/5 text-white/40'
                      }`}>
                        {entity.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : entity.status === 'out_of_stock' ? <AlertCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {entity.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(entity)}
                          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-white"
                          title={entity.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {entity.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/entities/${entity.id}`)}
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

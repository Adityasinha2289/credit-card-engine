import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { toast } from 'sonner';

interface Offer {
  id: string;
  title: string;
  source: string;
  offer_type: string;
  value: number;
  status: 'active' | 'expired';
  valid_from: string;
  valid_until: string;
}

export default function OfferManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchOffers() {
      try {
        const token = await getToken();
        const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
        const res = await fetch('/api/admin/offers', {
          headers: { Authorization: authHeader }
        });
        const data = await res.json();
        
        if (data.success) {
          setOffers(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load offers');
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, [getToken]);

  const deactivateOffer = async (offer: Offer) => {
    if (offer.status === 'expired') return;
    
    if (!confirm(`Are you sure you want to deactivate (expire) ${offer.title}? This will immediately stop it from being recommended by the Optimization Engine.`)) {
      return;
    }
    
    try {
      const token = await getToken();
      const authHeader = token ? `Bearer ${token}` : 'Bearer admin-token-123';
      
      const res = await fetch(`/api/admin/offers?id=${offer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({ status: 'expired', valid_until: new Date().toISOString() })
      });
      const data = await res.json();
      
      if (data.success) {
        setOffers(offers.map(o => o.id === offer.id ? { ...o, status: 'expired' } : o));
        toast.success(`Offer deactivated`);
      } else {
        toast.error(data.error || 'Failed to update offer');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const getComputedStatus = (offer: Offer) => {
    if (offer.status === 'expired') return 'expired';
    const now = new Date();
    const from = new Date(offer.valid_from);
    const until = new Date(offer.valid_until);
    if (now < from) return 'scheduled';
    if (now > until) return 'expired';
    return 'active';
  };

  const filteredOffers = offers.filter(o => 
    o.title.toLowerCase().includes(search.toLowerCase()) || 
    o.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer title="Offer Management">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
          <input
            type="text"
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <button
          onClick={() => navigate('/admin/offers/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Offer
        </button>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Loading Offers...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center text-white/50">No offers found. Create your first offer.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-black/20 text-xs uppercase text-white/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Value</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Validity</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOffers.map((offer) => {
                  const status = getComputedStatus(offer);
                  return (
                  <tr key={offer.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{offer.title}</td>
                    <td className="px-6 py-4 capitalize">{offer.source.replace('_', ' ')}</td>
                    <td className="px-6 py-4 capitalize">{offer.offer_type.replace('_', ' ')}</td>
                    <td className="px-6 py-4">{offer.offer_type === 'percentage_discount' ? `${offer.value}%` : `₹${offer.value}`}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : status === 'scheduled'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-white/5 text-white/40'
                      }`}>
                        {status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : status === 'scheduled' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(offer.valid_from).toLocaleDateString()} - {new Date(offer.valid_until).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {status !== 'expired' && (
                          <button 
                            onClick={() => deactivateOffer(offer)}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-red-400"
                            title="Deactivate (Expire)"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/admin/offers/${offer.id}`)}
                          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

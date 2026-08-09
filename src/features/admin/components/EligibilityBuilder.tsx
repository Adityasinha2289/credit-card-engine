import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface EligibilityRules {
  categories?: string[];
  partnerIds?: string[];
  paymentMethodTypes?: string[];
  [key: string]: any;
}

interface EligibilityBuilderProps {
  rules: EligibilityRules;
  onChange: (rules: EligibilityRules) => void;
  categories: { id: string, slug: string, name: string }[];
  partners: { id: string, name: string }[];
}

export function EligibilityBuilder({ rules, onChange, categories, partners }: EligibilityBuilderProps) {
  const [activeRuleType, setActiveRuleType] = useState<string>('');

  const validPaymentMethodTypes = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'reward_points', label: 'Reward Points' },
    { value: 'miles', label: 'Miles' }
  ];

  const addRuleArrayItem = (key: keyof EligibilityRules, value: string) => {
    if (!value) return;
    const currentArray = rules[key] || [];
    if (!currentArray.includes(value)) {
      onChange({ ...rules, [key]: [...currentArray, value] });
    }
  };

  const removeRuleArrayItem = (key: keyof EligibilityRules, value: string) => {
    const currentArray = rules[key] || [];
    const newArray = currentArray.filter((v: string) => v !== value);
    
    if (newArray.length === 0) {
      const newRules = { ...rules };
      delete newRules[key];
      onChange(newRules);
    } else {
      onChange({ ...rules, [key]: newArray });
    }
  };

  const renderArrayTags = (key: keyof EligibilityRules, lookup: (val: string) => string) => {
    const arr = rules[key] || [];
    if (arr.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {arr.map((val: string) => (
          <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black/50 border border-white/10 text-xs text-emerald-400">
            {lookup(val)}
            <button type="button" onClick={() => removeRuleArrayItem(key, val)} className="text-white/40 hover:text-red-400">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-white/70">Add Eligibility Constraint</label>
          <select
            value={activeRuleType}
            onChange={(e) => setActiveRuleType(e.target.value)}
            className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">-- Select Rule Type --</option>
            <option value="categories">Must match Category</option>
            <option value="partnerIds">Must match Partner</option>
            <option value="paymentMethodTypes">Must match Payment Method Type</option>
          </select>
        </div>
        
        {activeRuleType === 'categories' && (
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-white/70">Select Category</label>
            <select
              onChange={(e) => { addRuleArrayItem('categories', e.target.value); e.target.value = ''; }}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              defaultValue=""
            >
              <option value="" disabled>-- Choose --</option>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        )}

        {activeRuleType === 'partnerIds' && (
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-white/70">Select Partner</label>
            <select
              onChange={(e) => { addRuleArrayItem('partnerIds', e.target.value); e.target.value = ''; }}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              defaultValue=""
            >
              <option value="" disabled>-- Choose --</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        {activeRuleType === 'paymentMethodTypes' && (
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-white/70">Select Payment Type</label>
            <select
              onChange={(e) => { addRuleArrayItem('paymentMethodTypes', e.target.value); e.target.value = ''; }}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              defaultValue=""
            >
              <option value="" disabled>-- Choose --</option>
              {validPaymentMethodTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-sm font-medium text-white">Active Rules</h4>
        
        {(!rules.categories?.length && !rules.partnerIds?.length && !rules.paymentMethodTypes?.length) ? (
          <div className="text-sm text-white/40 italic">No specific eligibility rules. This offer applies universally (subject to minimum spend and date bounds).</div>
        ) : (
          <div className="space-y-4">
            {rules.categories && rules.categories.length > 0 && (
              <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="text-xs font-medium text-white/50 uppercase">Categories</div>
                {renderArrayTags('categories', (val) => categories.find(c => c.slug === val)?.name || val)}
              </div>
            )}
            
            {rules.partnerIds && rules.partnerIds.length > 0 && (
              <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="text-xs font-medium text-white/50 uppercase">Partners</div>
                {renderArrayTags('partnerIds', (val) => partners.find(p => p.id === val)?.name || val)}
              </div>
            )}

            {rules.paymentMethodTypes && rules.paymentMethodTypes.length > 0 && (
              <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="text-xs font-medium text-white/50 uppercase">Payment Method Types</div>
                {renderArrayTags('paymentMethodTypes', (val) => validPaymentMethodTypes.find(p => p.value === val)?.label || val)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

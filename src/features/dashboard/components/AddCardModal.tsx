import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { CARD_DATASET } from '../../finix/data/cardDataset';
import { useDashboardStore } from '../store/dashboardStore';
import { BankLogo } from '../../cards/components/BankLogo';
import { analytics } from '../../../lib/analytics';
import { getCardTheme } from '../../finix/config/cardThemeRegistry';

export default function AddCardModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const addUserCard = useDashboardStore((s) => s.addUserCard);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardNameInput, setCardNameInput] = useState('');
  const [cardExpiryInput, setCardExpiryInput] = useState('');
  const [cardLimitInput, setCardLimitInput] = useState('');
  const [formError, setFormError] = useState('');

  const handleCloseModal = () => {
    setSelectedTemplate(null);
    setCardNumber('');
    setCardNameInput('');
    setCardExpiryInput('');
    setCardLimitInput('');
    setFormError('');
    setSearchQuery('');
    onClose();
  };

  const availableCardsToAdd = CARD_DATASET.filter(
    (mc) => !userCards.some((uc) => uc.id === mc.id)
  );

  const filteredCardsToAdd = availableCardsToAdd.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCloseModal}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      {/* Panel */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-surface-primary  rounded-[2rem] p-6 shadow-[0_0_20px_rgba(4,59,39,0.3)] border border-border-subtle  overflow-hidden flex flex-col max-h-[90vh]"
      >
        {!selectedTemplate ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-text-primary">Add Card to Wallet</h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-secondary dark:hover:bg-white/[0.04]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search cards by bank or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full input-premium pl-10 py-2 text-sm"
              />
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              {filteredCardsToAdd.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">No cards found matching search</p>
              ) : (
                filteredCardsToAdd.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedTemplate(c);
                      setCardNameInput(profile?.name || '');
                      setCardLimitInput(c.minIncome ? String(Math.floor(c.minIncome * 0.5)) : '150000');
                    }}
                    className="w-full p-3 rounded-2xl flex items-center gap-3 border border-border-subtle dark:border-white/[0.03] hover:bg-surface-secondary dark:hover:bg-white/[0.02] text-left transition-all"
                  >
                    <BankLogo bank={c.bank} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{c.name}</p>
                      <p className="text-xs text-text-muted">{c.bank} · {c.network}</p>
                    </div>
                    <span className="text-xs font-bold text-brand-emerald bg-brand-50 dark:bg-brand-emerald-muted px-2.5 py-1 rounded-full">
                      Select
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-display font-bold text-text-primary">Enter Card Details</h3>
                <p className="text-xs text-text-muted">{selectedTemplate.name}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setFormError('');
                }}
                className="text-xs font-bold text-brand-emerald hover:text-brand-600 bg-brand-50 dark:bg-brand-emerald-muted px-3 py-1.5 rounded-full"
              >
                Back
              </button>
            </div>

            {/* Visual Card Preview */}
            <div
              className="h-28 rounded-2xl p-4 flex flex-col justify-between text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${getCardTheme(selectedTemplate.id).gradientFrom}, ${getCardTheme(selectedTemplate.id).gradientTo})` }}
            >
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold uppercase tracking-wider">{selectedTemplate.name}</p>
                <p className="text-[10px] font-semibold opacity-80">{selectedTemplate.network}</p>
              </div>
              <div>
                <p className="font-mono text-xs tracking-widest">
                  {selectedTemplate.first4Digits || '••••'} •••• •••• {cardNumber ? cardNumber : '••••'}
                </p>
                <div className="flex justify-between items-end mt-1 text-[9px] opacity-75">
                  <span className="uppercase truncate max-w-[180px]">{cardNameInput || 'CARDHOLDER NAME'}</span>
                  <span>{cardExpiryInput || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[11px] font-bold text-text-secondary">Card Number (Last 4 Digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  className="input-premium py-2 px-3 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[11px] font-bold text-text-secondary">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Atharva Mishra"
                  value={cardNameInput}
                  onChange={(e) => setCardNameInput(e.target.value)}
                  className="input-premium py-2 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[11px] font-bold text-text-secondary">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="08/30"
                    value={cardExpiryInput}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value.length < cardExpiryInput.length) {
                        setCardExpiryInput(value);
                        return;
                      }
                      let clean = value.replace(/[^0-9]/g, '');
                      if (clean.length > 0) {
                        const firstDigit = parseInt(clean[0], 10);
                        if (firstDigit > 1) {
                          clean = '0' + clean;
                        }
                      }
                      if (clean.length >= 2) {
                        let month = parseInt(clean.slice(0, 2), 10);
                        if (month > 12) {
                          clean = '12' + clean.slice(2);
                        } else if (month === 0) {
                          clean = '01' + clean.slice(2);
                        }
                        clean = clean.slice(0, 2) + '/' + clean.slice(2, 4);
                      }
                      setCardExpiryInput(clean.slice(0, 5));
                    }}
                    className="input-premium py-2 px-3 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[11px] font-bold text-text-secondary">Credit Limit (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 300000"
                      value={cardLimitInput}
                      onChange={(e) => setCardLimitInput(e.target.value)}
                      className="w-full input-premium py-2 pl-7 pr-3 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError && <p className="text-xs font-bold text-loss">{formError}</p>}

            <button
              onClick={() => {
                if (cardNumber.length < 4) {
                  return setFormError('Card number must be exactly 4 digits.');
                }
                if (!cardNameInput.trim()) {
                  return setFormError('Cardholder name is required.');
                }
                const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                if (!expiryRegex.test(cardExpiryInput)) {
                  return setFormError('Expiry must be a valid MM/YY format (months 01-12).');
                }
                const [expMonthStr, expYearStr] = cardExpiryInput.split('/');
                const expMonth = parseInt(expMonthStr, 10);
                const expYear = 2000 + parseInt(expYearStr, 10);
                const now = new Date();
                if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
                  toast.error('Your card is already expired');
                  return;
                }
                const limitNum = parseFloat(cardLimitInput);
                if (isNaN(limitNum) || limitNum <= 0) {
                  return setFormError('Please enter a valid credit limit.');
                }

                addUserCard({
                  id: selectedTemplate.id,
                  pan: cardNumber,
                  cardholderName: cardNameInput.trim(),
                  expiry: cardExpiryInput,
                  network: selectedTemplate.network.toLowerCase() as any,
                  bank: selectedTemplate.bank,
                  status: 'active',
                  availableCredit: limitNum * 100,
                  creditLimit: limitNum * 100,
                  label: selectedTemplate.name,
                  gradientFrom: getCardTheme(selectedTemplate.id).gradientFrom,
                  gradientTo: getCardTheme(selectedTemplate.id).gradientTo,
                });
                analytics.track('Card Added', {
                  bank: selectedTemplate.bank,
                  network: selectedTemplate.network,
                  cardName: selectedTemplate.name
                });
                handleCloseModal();
              }}
              className="w-full mt-2 bg-brand-emerald hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(4,59,39,0.3)] transition-all active:scale-95"
            >
              Confirm & Link Card
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Utensils, Plane, Fuel, ArrowRight } from 'lucide-react';
import { CreditCard as PhysicalCard } from '../../../features/cards/components/CreditCard';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, desc: 'Maximize returns on retail & online spends.' },
  { id: 'dining', label: 'Dining', icon: Utensils, desc: 'Earn more at restaurants and food delivery.' },
  { id: 'travel', label: 'Travel', icon: Plane, desc: 'Lounge access, flights, and zero forex.' },
  { id: 'fuel', label: 'Fuel', icon: Fuel, desc: 'Surcharge waivers and category multipliers.' }
];

const categoryCards: Record<string, any[]> = {
  shopping: [
    {
      id: 'rec-sbi',
      pan: '•••• •••• •••• 1234',
      cardholderName: 'YOUR NAME',
      expiry: '12/28',
      network: 'visa',
      bank: 'SBI Card',
      status: 'active',
      availableCredit: 0,
      creditLimit: 0,
      label: 'Cashback SBI Card',
      gradientFrom: '#1E3C72',
      gradientTo: '#2A5298'
    },
    {
      id: 'rec-hdfc-mill',
      pan: '•••• •••• •••• 5678',
      cardholderName: 'YOUR NAME',
      expiry: '05/27',
      network: 'mastercard',
      bank: 'HDFC Bank',
      status: 'active',
      availableCredit: 0,
      creditLimit: 0,
      label: 'Millennia',
      gradientFrom: '#0A2342',
      gradientTo: '#175676'
    }
  ],
  dining: [
    {
      id: 'rec-swiggy',
      pan: '•••• •••• •••• 9012',
      cardholderName: 'YOUR NAME',
      expiry: '11/26',
      network: 'mastercard',
      bank: 'HDFC Bank',
      status: 'active',
      availableCredit: 0,
      creditLimit: 0,
      label: 'Swiggy HDFC',
      gradientFrom: '#FF5A00',
      gradientTo: '#FF8A00'
    },
    {
      id: 'rec-axis-ace',
      pan: '•••• •••• •••• 3456',
      cardholderName: 'YOUR NAME',
      expiry: '08/29',
      network: 'visa',
      bank: 'Axis Bank',
      status: 'active',
      availableCredit: 0,
      creditLimit: 0,
      label: 'Axis Ace',
      gradientFrom: '#5D26C1',
      gradientTo: '#a17fe0'
    }
  ],
  travel: [
    {
      id: 'rec-amex-plat',
      pan: '•••• •••••• •3456',
      cardholderName: 'YOUR NAME',
      expiry: '09/29',
      network: 'amex',
      bank: 'American Express',
      status: 'active',
      availableCredit: 0,
      creditLimit: 0,
      label: 'Platinum Travel',
      gradientFrom: '#8E9EAB',
      gradientTo: '#EEF2F3'
    },
    {
      id: 'rec-atlas',
      pan: '•••• •••• •••• 7890',
      cardholderName: 'YOUR NAME',
      expiry: '03/28',
      network: 'visa',
      bank: 'Axis Bank',
      status: 'active',
      availableCredit: 0,
      creditLimit: 0,
      label: 'Axis Atlas',
      gradientFrom: '#800000',
      gradientTo: '#4A0000'
    }
  ],
  fuel: [
    {
      id: 'rec-bpcl',
      pan: '•••• •••• •••• 2468',
      cardholderName: 'YOUR NAME',
      expiry: '01/30',
      network: 'visa',
      bank: 'SBI Card',
      status: 'active',
      availableCredit: 0,
      creditLimit: 0,
      label: 'BPCL Octane',
      gradientFrom: '#F2C94C',
      gradientTo: '#F2994A'
    }
  ]
};

export function CardsMegaMenu({ onClose }: { onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-[calc(100%+1rem)] left-1/2 -translate-x-1/2 w-[800px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden flex"
      onMouseLeave={onClose}
    >
      {/* Sidebar Categories */}
      <div className="w-[280px] bg-[#050505] p-4 flex flex-col gap-1 border-r border-white/5">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-3 pt-2">Explore by Category</div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onMouseEnter={() => setActiveCategory(cat.id)}
            onClick={() => {
              window.location.href = `/cards?category=${cat.id}`;
              onClose();
            }}
            className={`w-full text-left px-3 py-3 rounded-xl flex items-start gap-3 transition-colors ${
              activeCategory === cat.id 
                ? 'bg-semantic-brand-strong/10' 
                : 'hover:bg-white/5'
            }`}
          >
            <div className={`mt-0.5 ${activeCategory === cat.id ? 'text-semantic-brand-strong' : 'text-gray-400'}`}>
              <cat.icon size={18} />
            </div>
            <div>
              <div className={`text-sm font-medium mb-0.5 ${activeCategory === cat.id ? 'text-semantic-brand-strong' : 'text-white'}`}>
                {cat.label}
              </div>
              <div className="text-xs text-gray-500 line-clamp-1">{cat.desc}</div>
            </div>
          </button>
        ))}
        
        <div className="mt-auto pt-4 pb-2 px-3">
          <Link 
            to="/cards" 
            onClick={onClose}
            className="text-xs font-semibold text-semantic-brand-strong hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            View all 130+ cards <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-[#0a0a0a] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-semantic-brand-strong/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-medium text-white capitalize flex items-center gap-2">
              Top Picks for {activeCategory}
            </h3>
          </div>

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-8 h-full"
              >
                {categoryCards[activeCategory]?.map((card, idx) => (
                  <div key={card.id} className={`transition-transform hover:scale-105 hover:-translate-y-2 relative group cursor-pointer`}>
                    {/* Shadow/Glow effect on hover */}
                    <div className="absolute -inset-4 bg-semantic-brand-strong/0 group-hover:bg-semantic-brand-strong/10 blur-xl rounded-full transition-colors duration-500 -z-10" />
                    
                    <div className="scale-75 origin-center">
                      <PhysicalCard card={card} variant="compact" />
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

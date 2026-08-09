import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, ShoppingBag, Book, ArrowRight } from 'lucide-react';

export default function LifestyleHub() {
  const navigate = useNavigate();

  const hubs = [
    {
      id: 'plan',
      title: 'Plan',
      description: 'Dates, Travel, and Experiences.',
      icon: Compass,
      color: 'text-text-primary',
      bg: 'bg-surface-elevated border-border-subtle',
      action: 'Plan a Trip',
      path: '/app/lifestyle/plan',
    },
    {
      id: 'invest',
      title: 'Invest in Yourself',
      description: 'Fitness, Hobbies, and Learning.',
      icon: Book,
      color: 'text-text-primary',
      bg: 'bg-surface-elevated border-border-subtle',
      action: 'Start a Hobby',
      path: '/app/lifestyle/invest',
    },
    {
      id: 'shop',
      title: 'Shop',
      description: 'Fashion, Lifestyle, and Electronics.',
      icon: ShoppingBag,
      color: 'text-text-primary',
      bg: 'bg-surface-elevated border-border-subtle',
      action: 'Shop Smarter',
      path: '/app/lifestyle/shop',
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 text-text-primary min-h-screen pt-8">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white mb-4">
          Lifestyle Hub
        </h1>
        <p className="text-lg text-text-muted font-light max-w-2xl">
          INTENT → INTELLIGENCE → SAVINGS. Spend smarter on the life you're building.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hubs.map((hub, idx) => (
          <motion.div
            key={hub.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`surface-card p-8 flex flex-col items-start relative group cursor-pointer hover:border-brand-emerald/40 transition-colors shadow-ag-base hover:shadow-ag-hover`}
            onClick={() => navigate(hub.path)}
          >
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 ${hub.bg}`}>
              <hub.icon size={24} className={hub.color} />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">{hub.title}</h3>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">
              {hub.description}
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              {hub.action} <ArrowRight size={16} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

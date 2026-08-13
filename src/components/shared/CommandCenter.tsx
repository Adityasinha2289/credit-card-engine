import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, MapPin, ShoppingBag, Book, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const TaqdeerIcon = () => <img src="/taqdeer-logo.jpg" alt="Taqdeer AI" className="w-full h-full object-cover rounded-lg" />;

  const suggestions = [
    { icon: Compass, label: 'Plan a Trip', path: '/app/lifestyle/plan', badge: 'Popular' },
    { icon: MapPin, label: 'Plan a Date', path: '/app/lifestyle/plan/date' },
    { icon: ShoppingBag, label: 'Shop Smarter', path: '/app/lifestyle/shop' },
    { icon: Book, label: 'Start a Hobby', path: '/app/lifestyle/invest' },
    { icon: TaqdeerIcon, label: 'Ask Taqdeer', path: '/app/taqdeer' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-xl bg-surface-base border border-border-subtle rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-border-subtle flex items-center gap-3">
              <Search className="text-brand-emerald" size={20} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="flex-1 bg-transparent border-none text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0 text-lg"
              />
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-2">
              <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Suggestions
              </div>
              <div className="flex flex-col gap-1">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.path)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-surface-secondary text-left group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-text-secondary group-hover:text-brand-emerald transition-colors">
                      <item.icon size={16} />
                    </div>
                    <span className="flex-1 font-medium text-text-primary">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold bg-brand-emerald/10 text-brand-emerald px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="px-5 py-3 border-t border-border-subtle bg-surface-secondary/30 flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-surface-elevated px-1.5 py-0.5 rounded border border-border-subtle">↑</kbd>
                <kbd className="font-mono bg-surface-elevated px-1.5 py-0.5 rounded border border-border-subtle">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-surface-elevated px-1.5 py-0.5 rounded border border-border-subtle">↵</kbd>
                to select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

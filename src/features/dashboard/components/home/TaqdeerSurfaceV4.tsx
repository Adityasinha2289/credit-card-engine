import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CornerDownLeft } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const PLACEHOLDERS = [
"What are you buying today?",
"Planning a holiday?",
"Need a new credit card?",
"Book flights",
"Amazon order",
"Fuel",
"Dining"
];

interface TaqdeerSurfaceV4Props {
  onAsk: (query: string) => void;
}

export function TaqdeerSurfaceV4({ onAsk }: TaqdeerSurfaceV4Props) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Rotate placeholders
  useEffect(() => {
    if (isFocused || query.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAsk(query);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mb-24 md:mb-32 px-4 md:px-0"
    >
      <form 
        onSubmit={handleSubmit}
        className={cn(
"relative max-w-4xl transition-all duration-700 ease-out",
          isFocused ?"scale-[1.01]" :"scale-100"
        )}
      >
        <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
          <motion.div
            animate={{ 
              rotate: isFocused ? 180 : 0,
              scale: isFocused ? 1.1 : 1
            }}
            transition={{ duration: 0.7, ease:"easeOut" }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-brand-emerald bg-brand-emerald-muted"
          >
            <Sparkles size={20} />
          </motion.div>
        </div>

        {/* Input Surface */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent border-b border-border-subtle  text-text-primary text-2xl sm:text-3xl md:text-4xl font-display font-medium py-6 pl-14 pr-16 focus:outline-none focus:border-brand-emerald/50 transition-colors placeholder:text-transparent"
        />
        
        {/* Animated Placeholder Layer */}
        {!query && (
          <div className="absolute inset-y-0 left-14 flex items-center pointer-events-none overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={placeholderIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease:"easeOut" }}
                className="text-2xl sm:text-3xl md:text-4xl font-display font-medium text-text-muted"
              >
                {PLACEHOLDERS[placeholderIdx]}
              </motion.span>
            </AnimatePresence>
            {/* Blinking Cursor */}
            <motion.span 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, ease:"steps(2)" }}
              className="ml-[2px] w-[2px] h-8 sm:h-10 bg-brand-emerald rounded-full inline-block"
            />
          </div>
        )}

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <AnimatePresence>
            {query.trim().length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="submit"
                className="w-10 h-10 rounded-full bg-brand-emerald text-gray-900 flex items-center justify-center hover:bg-brand-400 transition-colors"
              >
                <CornerDownLeft size={18} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
}

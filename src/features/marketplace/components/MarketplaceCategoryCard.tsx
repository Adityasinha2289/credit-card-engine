import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plane, Compass, ShoppingBag, Utensils, BookOpen, Receipt, TrendingUp, Heart } from 'lucide-react';
import type { MarketplaceCategory } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  Plane,
  Compass,
  ShoppingBag,
  Utensils,
  BookOpen,
  Receipt,
  TrendingUp,
  Heart,
};

interface MarketplaceCategoryCardProps {
  category: MarketplaceCategory;
  variant?: 'hero' | 'secondary' | 'tertiary';
  className?: string;
}

export function MarketplaceCategoryCard({ category, variant = 'secondary', className }: MarketplaceCategoryCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/app') ? '/app/marketplace' : '/marketplace';
  
  const Icon = ICON_MAP[category.iconName] || Compass;

  const baseClasses = "group relative overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-[2px] cursor-pointer flex flex-col justify-end";
  
  const variants = {
    hero: "h-[380px] md:h-[480px] rounded-[32px] hover:shadow-md hover:shadow-[#2A9D5C]/10 border-gray-100",
    secondary: "h-[280px] rounded-[24px] hover:border-[#2A9D5C]/30 hover:bg-gray-50/50",
    tertiary: "h-[180px] rounded-[24px] hover:border-[#2A9D5C]/30 hover:bg-gray-50/50"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`${basePath}/${category.slug}`)}
      className={cn(baseClasses, variants[variant], className)}
    >
      <div className={cn("absolute inset-x-0 top-0 overflow-hidden transition-opacity", 
        variant === 'hero' ? 'inset-0' : 'h-[60%] opacity-80 group-hover:opacity-100',
        variant === 'tertiary' ? 'opacity-40 group-hover:opacity-80' : ''
      )}>
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          style={{ backgroundImage: `url('${category.image}')` }}
        />
        {variant === 'hero' ? (
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80 transition-opacity duration-300 group-hover:opacity-90" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        )}
      </div>

      <div className={cn("relative z-10 flex flex-col gap-3",
        variant === 'hero' ? 'p-8 md:p-12 gap-4' : variant === 'secondary' ? 'p-6 md:p-8' : 'p-5 gap-2'
      )}>
        <div className={cn("flex items-center", variant === 'hero' ? 'mb-0' : 'gap-3 mb-1')}>
          <div className={cn("rounded-full border flex items-center justify-center transition-colors duration-300",
            variant === 'hero' ? 'w-12 h-12 border-white/30 bg-black/40 backdrop-blur-md group-hover:border-white/50' : 'w-8 h-8 border-gray-100 bg-gray-50'
          )}>
            <Icon className={cn(variant === 'hero' ? 'w-5 h-5 text-white' : 'w-3.5 h-3.5 text-gray-500 group-hover:text-[#2A9D5C] transition-colors')} strokeWidth={1.5} />
          </div>
          {variant !== 'hero' && <h3 className={cn("font-semibold text-gray-900", variant === 'secondary' ? 'text-xl' : 'text-base')}>{category.name}</h3>}
        </div>
        
        {variant === 'hero' && (
          <div>
            <h3 className="text-3xl md:text-4xl font-display font-medium text-white mb-2">{category.name}</h3>
            <p className="text-base md:text-lg text-white/80 max-w-lg">{category.description}</p>
          </div>
        )}

        {variant !== 'hero' && (
          <p className={cn("text-gray-500", variant === 'secondary' ? 'text-sm' : 'text-xs leading-relaxed line-clamp-2')}>{category.description}</p>
        )}

        <div className={cn("flex items-center gap-2 font-medium transition-colors",
          variant === 'hero' ? 'text-sm text-white mt-2 group-hover:text-[#2A9D5C]' : 'text-xs text-gray-400 mt-1 group-hover:text-[#2A9D5C]'
        )}>
          Explore {variant === 'hero' ? category.name : ''} <ArrowRight className={cn("transition-transform group-hover:translate-x-1", variant === 'hero' ? 'w-4 h-4' : 'w-3 h-3')} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}

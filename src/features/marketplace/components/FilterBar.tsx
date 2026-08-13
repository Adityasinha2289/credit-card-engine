import React, { useState } from 'react';
import type { FilterConfig } from '../types';
import { cn } from '../../../lib/utils';
import { Check } from 'lucide-react';

interface FilterBarProps {
  filters: FilterConfig[];
  onFilterChange?: (activeFilters: Record<string, string | boolean>) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | boolean>>({});

  if (!filters || filters.length === 0) return null;

  const toggleFilter = (id: string, type: 'boolean' | 'options', value?: string) => {
    const next = { ...activeFilters };
    if (type === 'boolean') {
      if (next[id]) delete next[id];
      else next[id] = true;
    } else if (type === 'options' && value) {
      if (next[id] === value) delete next[id];
      else next[id] = value;
    }
    setActiveFilters(next);
    onFilterChange?.(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
      {filters.map((filter) => {
        if (filter.type === 'boolean') {
          const isActive = !!activeFilters[filter.id];
          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id, 'boolean')}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap",
                isActive 
                  ? "bg-[#237E45]/10 border-[#237E45]/30 text-[#237E45]" 
                  : "bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white/90 hover:bg-white/[0.04]"
              )}
            >
              {isActive && <Check className="w-3 h-3" />}
              {filter.label}
            </button>
          );
        }
        
        if (filter.type === 'options' && filter.options) {
          return (
            <div key={filter.id} className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] p-1 rounded-full">
              <span className="text-xs text-white/40 px-3 uppercase tracking-wider font-semibold">{filter.label}</span>
              {filter.options.map((opt) => {
                const isActive = activeFilters[filter.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleFilter(filter.id, 'options', opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap",
                      isActive 
                        ? "bg-[#237E45] text-white shadow-sm" 
                        : "text-white/60 hover:text-white/90"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

import React from 'react';
import { cn } from '../../lib/utils';

interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg';
  format?: 'currency' | 'percent' | 'number' | 'none';
  compact?: boolean;
}

export const Metric = React.forwardRef<HTMLDivElement, MetricProps>(
  ({ className, value, label, trend, trendValue, size = 'md', format = 'none', compact = false, ...props }, ref) => {
    const sizes = {
      sm: { value: 'text-lg', label: 'text-[10px]' },
      md: { value: 'text-2xl', label: 'text-xs' },
      lg: { value: 'text-4xl', label: 'text-sm' },
    };

    const formatValue = (val: string | number) => {
      if (typeof val === 'string' && format === 'none') return val;
      
      const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : val;
      if (isNaN(num)) return val;

      if (format === 'currency') {
        if (compact) {
          if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
          if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
          if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
        }
        return `₹${num.toLocaleString('en-IN')}`;
      }
      if (format === 'percent') {
        return `${num}%`;
      }
      if (format === 'number') {
        if (compact) {
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        }
        return num.toLocaleString('en-IN');
      }
      return val;
    };

    const displayValue = formatValue(value);
    
    // Check if value is negative (only if it's a raw number or parseable)
    const isNegative = typeof value === 'number' && value < 0;

    return (
      <div ref={ref} className={cn('flex flex-col', className)} {...props}>
        <span className={cn('font-sans uppercase tracking-widest text-semantic-text-secondary mb-1', sizes[size].label)}>
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className={cn('font-mono font-medium tabular-nums tracking-tight', sizes[size].value, isNegative ? 'text-red-400' : 'text-semantic-text-primary')}>
            {displayValue}
          </span>
          {trendValue && (
            <span className={cn(
              'font-mono text-xs font-medium tabular-nums',
              trend === 'up' ? 'text-semantic-brand' : trend === 'down' ? 'text-red-400' : 'text-semantic-text-muted'
            )}>
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Metric.displayName = 'Metric';

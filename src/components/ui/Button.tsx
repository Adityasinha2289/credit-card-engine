import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'intelligence' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-semantic-surface-elevated text-semantic-text-primary border border-semantic-border-subtle hover:border-semantic-border-strong hover:bg-semantic-surface-card active:scale-[0.98]',
      secondary: 'bg-transparent text-semantic-text-secondary border border-transparent hover:text-semantic-text-primary hover:bg-semantic-surface-elevated active:scale-[0.98]',
      intelligence: 'bg-semantic-surface-intelligence text-semantic-brand border border-semantic-border-intelligence hover:bg-[#0E2C1E] active:scale-[0.98]',
      ghost: 'bg-transparent text-semantic-text-muted hover:text-semantic-text-primary hover:bg-semantic-surface-elevated active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-md min-h-[36px]',
      md: 'px-4 py-2 text-sm rounded-md min-h-[44px]',
      lg: 'px-6 py-3 text-base rounded-lg min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-semantic-brand-strong disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

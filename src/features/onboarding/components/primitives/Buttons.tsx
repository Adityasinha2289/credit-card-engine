import React from 'react';
import { cn } from '../../../../lib/utils';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ContinueButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "w-full sm:w-auto px-10 rounded-full flex items-center justify-center gap-3 font-semibold text-base transition-all duration-300",
          disabled && "opacity-30 pointer-events-none",
          className
        )}
        style={{
          height: 56,
          backgroundColor: '#2A9D5C',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: disabled ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(42,157,92,0.25)',
        }}
        disabled={disabled}
        {...props}
      >
        {children} <ArrowRight size={18} strokeWidth={2} />
      </motion.button>
    );
  }
);
ContinueButton.displayName = "ContinueButton";

export const BackButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "px-6 rounded-full flex items-center justify-center gap-2 font-medium text-sm transition-all duration-300",
          className
        )}
        style={{
          height: 56,
          backgroundColor: 'transparent',
          color: '#4B5563',
          border: '1px solid #E5E7EB',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#D1D5DB';
          e.currentTarget.style.color = '#111827';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.color = '#4B5563';
        }}
        {...props}
      >
        <ArrowLeft size={16} strokeWidth={2} /> {children}
      </motion.button>
    );
  }
);
BackButton.displayName = "BackButton";

export const SkipButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          className
        )}
        style={{ color: '#6B7280' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SkipButton.displayName = "SkipButton";

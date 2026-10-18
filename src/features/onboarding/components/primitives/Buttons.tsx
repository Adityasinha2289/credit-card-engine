import React from 'react';
import { cn } from '../../../../lib/utils';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowChip } from '../../../../public-platform/site/primitives';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/** The website's primary button: an ink pill with a pistachio arrow chip. */
export const ContinueButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-rc-ink pl-8 pr-1.5 text-[15px] font-medium text-rc-cream transition-colors duration-300 hover:bg-rc-moss sm:w-auto',
          disabled && 'pointer-events-none opacity-30',
          className
        )}
        disabled={disabled}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        <span>{children}</span>
        <ArrowChip variant="ink" size="lg" />
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
          'flex h-14 items-center justify-center gap-2 rounded-full border border-rc-ink/15 px-6 text-sm font-medium text-rc-muted transition-colors duration-300 hover:border-rc-ink/40 hover:text-rc-ink',
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
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
        className={cn('rounded-full text-sm font-medium text-rc-muted transition-colors duration-200 hover:text-rc-ink', className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SkipButton.displayName = "SkipButton";

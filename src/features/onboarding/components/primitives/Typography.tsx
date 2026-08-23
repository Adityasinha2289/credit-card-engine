import React from 'react';
import { cn } from '../../../../lib/utils';
import { motion } from 'framer-motion';

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const SectionHeading = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.h2
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "text-3xl md:text-4xl lg:text-[42px] font-display font-bold tracking-tight leading-[1.15] mb-4",
          className
        )}
        style={{ color: '#111827' }}
        {...props}
      >
        {children}
      </motion.h2>
    );
  }
);
SectionHeading.displayName = "SectionHeading";

export const SectionDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.p
        ref={ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "text-base lg:text-lg leading-relaxed max-w-[560px]",
          className
        )}
        style={{ color: '#4B5563' }}
        {...props}
      >
        {children}
      </motion.p>
    );
  }
);
SectionDescription.displayName = "SectionDescription";

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
          "mb-4 font-display text-[clamp(2.1rem,4.4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-rc-ink",
          className
        )}
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
          "max-w-[560px] text-base leading-relaxed text-rc-muted lg:text-lg",
          className
        )}
        {...props}
      >
        {children}
      </motion.p>
    );
  }
);
SectionDescription.displayName = "SectionDescription";

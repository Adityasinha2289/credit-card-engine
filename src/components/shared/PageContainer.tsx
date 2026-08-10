import React from 'react';
import { cn } from '../../lib/utils';

export function PageContainer({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex-1", className)}>
      {(title || subtitle) && (
        <div className="mb-6 lg:mb-8">
          {title && <h1 className="text-2xl lg:text-3xl font-display font-bold text-semantic-text-primary tracking-tight">{title}</h1>}
          {subtitle && <p className="text-sm text-semantic-text-muted mt-1 font-medium tracking-wide">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

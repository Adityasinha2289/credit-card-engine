import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col mb-8 lg:mb-12 w-full max-w-[800px]">
      {eyebrow && (
        <span className="text-[10px] md:text-xs font-bold text-semantic-text-tertiary uppercase tracking-widest mb-3">
          {eyebrow}
        </span>
      )}
      <h1 className="text-4xl md:text-5xl font-display font-medium text-semantic-text-primary tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base md:text-lg text-semantic-text-secondary mt-4 max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="w-full h-px bg-white/[0.04] mt-8" />
    </div>
  );
}

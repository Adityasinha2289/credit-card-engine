interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-10 flex w-full max-w-[820px] flex-col lg:mb-14">
      {eyebrow && (
        <span className="mb-4 flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-semantic-text-muted">
          <span aria-hidden className="h-2 w-2 rounded-full bg-rc-emerald" /> {eyebrow}
        </span>
      )}
      <h1 className="font-display text-[clamp(2.4rem,4.4vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-semantic-text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-semantic-text-secondary md:text-[17px]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

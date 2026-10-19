import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { PageHeader } from './PageHeader';
import type { HeroStat } from './AppHero';

export interface PageContainerProps {
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** key numbers shown in the page's hero panel */
  heroStats?: HeroStat[];
  heroActions?: ReactNode;
  /** a visual on the right of the hero panel (wide screens) */
  heroAside?: ReactNode;
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
  /** render just the content, inside another page (a tab of Money, say) */
  bare?: boolean;
}

export function PageContainer({
  eyebrow,
  title,
  subtitle,
  heroStats,
  heroActions,
  heroAside,
  children,
  className,
  hideHeader = false,
  bare = false,
}: PageContainerProps) {
  if (bare) return <div className={cn('flex w-full flex-col gap-8', className)}>{children}</div>;
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 pb-24 pt-2 md:px-8 lg:px-12">
      {!hideHeader && title && (
        <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} stats={heroStats} actions={heroActions} aside={heroAside} />
      )}

      <div className={cn('flex w-full flex-col gap-8', className)}>
        {children}
      </div>
    </div>
  );
}

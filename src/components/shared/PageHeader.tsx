import type { ReactNode } from 'react';
import { AppHero, type HeroStat } from './AppHero';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  stats?: HeroStat[];
  actions?: ReactNode;
  aside?: ReactNode;
}

/** Every titled app screen opens on the forest hero panel. */
export function PageHeader({ eyebrow, title, subtitle, stats, actions, aside }: PageHeaderProps) {
  return (
    <AppHero
      className="mb-8 lg:mb-10"
      eyebrow={eyebrow}
      title={title}
      lede={subtitle}
      stats={stats}
      actions={actions}
      aside={aside}
    />
  );
}

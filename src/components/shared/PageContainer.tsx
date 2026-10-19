import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { AppBand, AppHero, MyNav, type HeroStat } from './AppHero';
import { Container } from '../../public-platform/site/primitives';

export interface PageContainerProps {
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** key numbers shown in the page's hero band */
  heroStats?: HeroStat[];
  /** controls in the hero band (a form, buttons) */
  heroActions?: ReactNode;
  /** a visual on the right of the hero band (wide screens) */
  heroAside?: ReactNode;
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
  /** render just the content, inside another page (a tab of Money, say) */
  bare?: boolean;
  /** the page's own visual on the dark band; with it, the title is compact */
  band?: ReactNode;
  /** centre the compact title over the band (wide screens) */
  center?: boolean;
}

/**
 * A signed-in page, framed like the website's inner pages: the dark hero band,
 * then a cream body that tucks over it with a rounded top.
 */
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
  band,
  center,
}: PageContainerProps) {
  if (bare) return <div className={cn('flex w-full flex-col gap-8', className)}>{children}</div>;
  const hero = !hideHeader && (title || band);
  return (
    <div className="flex w-full flex-1 flex-col">
      {band !== undefined ? (
        <AppBand eyebrow={eyebrow} title={title} center={center}>{band}</AppBand>
      ) : hero ? (
        <AppHero eyebrow={eyebrow} title={title!} lede={subtitle} stats={heroStats} actions={heroActions} aside={heroAside} />
      ) : (
        <Container className="pt-6"><MyNav /></Container>
      )}
      <div className={cn('relative z-10 flex-1 rounded-t-[32px] bg-rc-cream pb-20 text-rc-ink sm:rounded-t-[40px] md:pb-28 lg:rounded-t-[56px]', hero ? '-mt-10 md:-mt-12 lg:-mt-14' : '')}>
        <Container className={cn('flex flex-col gap-9 pt-7 md:gap-10 md:pt-10 lg:pt-14', className)}>
          {children}
        </Container>
      </div>
    </div>
  );
}

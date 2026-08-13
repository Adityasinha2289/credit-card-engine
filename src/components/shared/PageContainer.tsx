import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { PageHeader } from './PageHeader';

export interface PageContainerProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
}

export function PageContainer({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  hideHeader = false,
}: PageContainerProps) {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 pt-8 lg:pt-12 pb-24 flex flex-col flex-1">
      {!hideHeader && title && (
        <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      )}
      
      <div className={cn("w-full flex flex-col gap-8", className)}>
        {children}
      </div>
    </div>
  );
}

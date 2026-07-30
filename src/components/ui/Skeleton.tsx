import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-surface-secondary/60 dark:bg-surface-elevated/30 overflow-hidden relative',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-ag-shimmer bg-gradient-to-r from-transparent via-white/[0.08] dark:via-white/[0.04] to-transparent" />
    </div>
  );
}

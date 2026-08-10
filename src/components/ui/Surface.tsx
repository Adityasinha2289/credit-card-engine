import React from 'react';
import { cn } from '../../lib/utils';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 0 | 1 | 2 | 3 | 4 | 5;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, level = 2, ...props }, ref) => {
    const levels = {
      0: 'bg-semantic-canvas border-transparent',
      1: 'bg-semantic-shell border-transparent',
      2: 'bg-semantic-surface-primary border-semantic-border-subtle',
      3: 'bg-semantic-surface-card border-semantic-border-subtle',
      4: 'bg-semantic-surface-elevated border-semantic-border-strong shadow-ag-card',
      5: 'bg-semantic-surface-intelligence border-semantic-border-intelligence shadow-ag-glow-primary',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border transition-colors duration-300',
          level > 1 ? 'rounded-2xl' : '',
          levels[level],
          className
        )}
        {...props}
      />
    );
  }
);
Surface.displayName = 'Surface';

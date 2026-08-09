import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-surface-secondary dark:bg-surface-elevated rounded w-24 mb-2" />
        <div className="h-10 bg-surface-secondary dark:bg-surface-elevated rounded-xl w-1/2 md:w-1/3" />
      </div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[220px] bg-surface-secondary dark:bg-surface-elevated rounded-[2rem]" />
        <div className="h-[220px] bg-surface-secondary dark:bg-surface-elevated rounded-[2rem] hidden md:block" />
      </div>
      
      {/* Main Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        <div className="lg:col-span-2 h-[500px] bg-surface-secondary dark:bg-surface-elevated rounded-[2rem]" />
        <div className="h-[500px] bg-surface-secondary dark:bg-surface-elevated rounded-[2rem]" />
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface IPadMockupProps {
  children: ReactNode;
  className?: string;
}

export function IPadMockup({ children, className }: IPadMockupProps) {
  return (
    <div className={cn(
      "relative flex-shrink-0 bg-[#0A0A0A] border-[14px] border-[#222] rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10 aspect-[4/3]",
      "shadow-[0_30px_60px_rgba(0,0,0,0.4)]",
      className
    )}>
      {/* Glossy Edge / Lighting effect */}
      <div className="absolute inset-0 pointer-events-none rounded-[1.5rem] border border-white/20 z-50"></div>
      
      {/* Front camera (Landscape top center) */}
      <div className="absolute top-[-9px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#050505] shadow-[inset_0_1px_2px_rgba(0,0,0,1)] flex items-center justify-center z-50">
         <div className="w-1 h-1 rounded-full bg-[#1a1a1a]"></div>
      </div>

      {/* Screen Container */}
      <div className="relative w-full h-full bg-[#000000] rounded-[1.5rem] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface IPadMockupProps {
  children: ReactNode;
  className?: string;
}

export function IPadMockup({ children, className }: IPadMockupProps) {
  return (
    <div className={cn(
      "relative flex-shrink-0 bg-[#000000] border-[8px] border-[#18181b] rounded-[1.75rem] overflow-hidden ring-[0.5px] ring-white/20 aspect-[1.43/1]",
      className
    )}>
      {/* Glossy Edge / Lighting effect */}
      <div className="absolute inset-0 pointer-events-none rounded-[1.25rem] border border-white/10 z-50"></div>
      
      {/* Front camera (Landscape top center - latest iPad Pro has it on the landscape edge) */}
      <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#050505] shadow-[inset_0_1px_2px_rgba(0,0,0,1)] flex items-center justify-center z-50">
         <div className="w-[3px] h-[3px] rounded-full bg-[#1a1a1a]"></div>
      </div>

      {/* Screen Container */}
      <div className="relative w-full h-full bg-[#000000] rounded-[1.25rem] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

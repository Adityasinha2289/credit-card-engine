import { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface IPhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export function IPhoneMockup({ children, className }: IPhoneMockupProps) {
  return (
    <div className={cn(
      "relative flex-shrink-0 bg-[#0A0A0A] border-[8px] border-[#3a3a3c] rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-white/10",
      "shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
      className
    )}>
      {/* Glossy Edge / Lighting effect */}
      <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] border border-white/20 z-50"></div>
      
      {/* Side buttons (visual only) */}
      <div className="absolute -left-[10px] top-24 w-1 h-8 bg-[#3a3a3c] rounded-l-md"></div>
      <div className="absolute -left-[10px] top-36 w-1 h-12 bg-[#3a3a3c] rounded-l-md"></div>
      <div className="absolute -left-[10px] top-52 w-1 h-12 bg-[#3a3a3c] rounded-l-md"></div>
      <div className="absolute -right-[10px] top-36 w-1 h-16 bg-[#3a3a3c] rounded-r-md"></div>

      {/* Dynamic Island */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-[20px] z-50 flex items-center justify-between px-3">
        {/* Camera / Sensor dots */}
        <div className="w-3 h-3 rounded-full bg-[#111] shadow-inner flex items-center justify-center">
           <div className="w-1.5 h-1.5 rounded-full bg-[#050505]"></div>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#050505]"></div>
      </div>

      {/* Screen Container */}
      <div className="relative w-full h-full bg-[#000000] rounded-[2.5rem] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

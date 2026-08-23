import { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface MacBookMockupProps {
  children: ReactNode;
  className?: string;
}

export function MacBookMockup({ children, className }: MacBookMockupProps) {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Screen part */}
      <div className="relative bg-[#111] p-2 md:p-3 rounded-t-[1.5rem] md:rounded-t-[2rem] border border-[#333] border-b-0 shadow-2xl w-full z-10 flex flex-col">
         {/* Webcam notch / dot */}
         <div className="absolute top-1 md:top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#050505] flex items-center justify-center z-50">
           <div className="w-1 h-1 rounded-full bg-[#222]"></div>
         </div>
         {/* Screen Content */}
         <div className="relative w-full aspect-[16/10] bg-[#000000] rounded-lg md:rounded-xl overflow-hidden mt-1 md:mt-1.5">
           {children}
         </div>
      </div>
      {/* Base part */}
      <div className="relative w-[115%] h-3 md:h-5 bg-gradient-to-b from-[#a3a3b1] to-[#737382] rounded-b-xl md:rounded-b-2xl rounded-t-[2px] shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-20 flex justify-center border-t border-white/40">
         {/* Thumb groove */}
         <div className="absolute top-0 w-[15%] h-1 md:h-1.5 bg-[#5b5b66] rounded-b-full shadow-inner"></div>
      </div>
    </div>
  );
}

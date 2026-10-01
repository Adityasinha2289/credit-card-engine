import { cn } from '../../../../lib/utils';
import { ArrowRight } from 'lucide-react';

export interface OfferData {
  id: string;
  brand: string;
  headline: string;
  supporting: string;
  offer: string;
  direction: 'left' | 'right';
  gradientFrom: string;
  gradientTo: string;
  textColor: 'light' | 'dark';
  logoSrc?: string;
}

export const DEMO_OFFERS: OfferData[] = [
  {
    id: 'greenox',
    brand: 'GREENOX',
    headline: 'FREE COFFEE',
    supporting: 'AT GREENOX',
    offer: '20% OFF WITH RENOCRED →',
    direction: 'left',
    gradientFrom: '#f0f5e6',
    gradientTo: '#d6e8b8',
    textColor: 'dark',
    logoSrc: '/greenox_logo.png'
  },
  {
    id: 'snitch',
    brand: 'SNITCH',
    headline: '20% OFF',
    supporting: 'ON SNITCH',
    offer: 'WITH RENOCRED →',
    direction: 'right',
    gradientFrom: '#1c1c1c',
    gradientTo: '#2a2a2a',
    textColor: 'light',
    logoSrc: '/snitch-logo.png'
  },
  {
    id: 'behrouz',
    brand: 'BEHROUZ',
    headline: '30% OFF',
    supporting: 'AT BEHROUZ',
    offer: 'WITH RENOCRED →',
    direction: 'left',
    gradientFrom: '#241a12',
    gradientTo: '#453222',
    textColor: 'light',
    logoSrc: '/behrouz-logo.png'
  },
  {
    id: 'myntra',
    brand: 'MYNTRA',
    headline: 'EXTRA 5%',
    supporting: 'ON MYNTRA',
    offer: 'WITH RENOCRED →',
    direction: 'right',
    gradientFrom: '#2c1e33',
    gradientTo: '#4a2b54',
    textColor: 'light',
    logoSrc: '/myntra-logo.png'
  }
];

interface OfferCardProps {
  data: OfferData;
  index?: number;
  progress?: any;
  className?: string;
}

export function OfferCard({ data, className }: OfferCardProps) {
  const isDarkText = data.textColor === 'dark';

  return (
    <div 
      className={cn(
        "relative w-[280px] sm:w-[320px] md:w-[340px] aspect-[1.586/1] rounded-2xl md:rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] ring-1 ring-white/20 overflow-hidden flex flex-col justify-between p-5 md:p-6",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${data.gradientFrom}, ${data.gradientTo})`,
        color: isDarkText ? '#1a2e22' : '#ffffff'
      }}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Brand Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border overflow-hidden",
            isDarkText ? "bg-white/90 border-black/10" : "bg-black/90 border-white/10"
          )}>
            {data.logoSrc ? (
              <img src={data.logoSrc} alt={data.brand} className="w-full h-full object-cover" />
            ) : (
              <div className={cn("w-3 h-3 rounded-sm", isDarkText ? "bg-[#1a2e22]" : "bg-white")} />
            )}
          </div>
          <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest">{data.brand}</span>
        </div>
        {/* Deal Tag */}
        <div className={cn(
          "px-2 py-1 rounded-md text-[10px] md:text-[11px] font-bold uppercase tracking-wide shadow-sm",
          isDarkText ? "bg-editorial-forest text-white" : "bg-white/10 text-white border border-white/20 backdrop-blur-md"
        )}>
          {data.headline.includes('OFF') ? data.headline.split(' ')[0] : (data.headline.includes('%') ? data.headline : 'DEAL')}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-end flex-1">
        <h2 className={cn(
          "text-2xl md:text-3xl font-serif font-medium leading-tight",
          isDarkText ? "text-editorial-deep-forest" : "text-white"
        )}>
          {data.headline}
          <br/>
          <span className="text-xl md:text-2xl font-sans font-light opacity-90">{data.supporting}</span>
        </h2>
        
        <div className={cn(
          "mt-4 md:mt-5 pt-3 md:pt-4 border-t",
          isDarkText ? "border-editorial-deep-forest/20" : "border-white/20"
        )}>
          <div className="flex items-center justify-between group">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
              {data.offer.replace('→', '').trim()}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

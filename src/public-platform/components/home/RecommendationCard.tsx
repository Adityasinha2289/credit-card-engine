import { motion } from 'framer-motion';
import { CreditCard, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface RecommendationCardProps {
  cardName: string;
  expectedSavings: string;
  rewards: string;
  reasons: string[];
  confidence: number;
  className?: string;
  delay?: number;
}

export function RecommendationCard({
  cardName,
  expectedSavings,
  rewards,
  reasons,
  confidence,
  className,
  delay = 0,
}: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={cn(
        "w-full max-w-[340px] bg-[#0A0A0A] border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative",
        className
      )}
    >
      {/* Top Banner */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E599]/50 to-transparent" />
      
      <div className="p-6 pb-4 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-[#00E599] text-[10px] font-bold uppercase tracking-wider mb-0.5">Recommended</p>
              <h4 className="text-white font-bold">{cardName}</h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Expected Savings</p>
            <p className="text-[#00E599] text-xl font-bold">{expectedSavings}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Rewards</p>
            <p className="text-white text-lg font-bold">{rewards}</p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4 bg-[#111111]/50 flex-1 flex flex-col justify-between gap-6">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Why</p>
          <ul className="space-y-2">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-[#00E599] shrink-0 mt-0.5" />
                <span className="leading-tight">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-500 uppercase tracking-wider">Confidence</span>
            <span className="text-[#00E599]">{confidence}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#111111] rounded-full overflow-hidden border border-white/[0.04]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
              className="h-full bg-[#00E599] rounded-full shadow-[0_0_10px_rgba(0,229,153,0.5)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

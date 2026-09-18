import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { ShieldCheck, Database, Lock } from 'lucide-react';

export function TrustSection() {
  return (
    <section className="w-full py-16 bg-[#0A0A0A] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        
        <div className="md:col-span-4">
          <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-4">Why RenoCred</div>
          <h2 className="text-2xl md:text-3xl font-display font-medium leading-tight">
            Transparent.<br/>Explainable.<br/>Built around your wallet.
          </h2>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 md:pt-8">
           <div>
             <h4 className="text-sm font-bold text-white mb-2">Card Intelligence</h4>
             <p className="text-xs text-gray-400 leading-relaxed">Rely on verified reward rates, milestone structures, and merchant exclusions without the marketing hype.</p>
           </div>
           <div>
             <h4 className="text-sm font-bold text-white mb-2">Reward Optimization</h4>
             <p className="text-xs text-gray-400 leading-relaxed">Every recommendation includes exactly why it was chosen and how the estimated value was calculated.</p>
           </div>
           <div>
             <h4 className="text-sm font-bold text-white mb-2">Personalized Insights</h4>
             <p className="text-xs text-gray-400 leading-relaxed">Your financial data is used exclusively to power your personal intelligence engine securely.</p>
           </div>
        </div>

      </div>
    </section>
  );
}

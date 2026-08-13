import { ArrowRight } from 'lucide-react';
import { FadeInView, MotionButton } from '../../../motion';

export function CtaSection() {
  return (
    <section className="w-full py-40 bg-[#0A0A0A] text-white relative overflow-hidden flex flex-col items-center justify-center border-t border-white/[0.04]">
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        
        <FadeInView className="text-5xl md:text-7xl font-display font-bold mb-16 tracking-tight leading-[1.1]">
          Ready to stop using <br/>
          <span className="text-gray-500">the wrong card?</span>
        </FadeInView>

        <FadeInView delay={0.2}>
          <MotionButton className="group bg-[#237E45] text-[#0A0A0A] font-bold text-lg md:text-xl px-10 py-5 rounded-xl flex items-center justify-center gap-4 hover:bg-[#00c985] transition-colors">
            Find My Best Card
            <span className="bg-[#0A0A0A] text-[#237E45] p-1.5 rounded-lg group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </span>
          </MotionButton>
        </FadeInView>
        
      </div>
    </section>
  );
}

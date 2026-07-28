import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ShoppingBag, Coffee, Fuel, Plane, Utensils } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';

const scenarios = [
  { id: 'food', title: 'Morning Coffee', amount: '₹400', icon: Coffee, card: 'Swiggy HDFC Bank', save: '₹40', rewards: '10% Cashback', reasons: ['Partner Merchant', 'Monthly Cap Remaining'], confidence: 99 },
  { id: 'shopping', title: 'New AirPods', amount: '₹24,900', icon: ShoppingBag, card: 'SBI Cashback', save: '₹1,245', rewards: '5% Value', reasons: ['Best Online Cashback', 'Valid on Electronics'], confidence: 95 },
  { id: 'fuel', title: 'Full Tank', amount: '₹4,500', icon: Fuel, card: 'BPCL SBI Card', save: '₹326', rewards: '7.25% Value', reasons: ['Surcharge Waiver', 'BPCL Partner Station'], confidence: 98 },
  { id: 'travel', title: 'Flight to Goa', amount: '₹12,000', icon: Plane, card: 'Axis Atlas', save: '₹600', rewards: '5X Edge Miles', reasons: ['Travel Category Multiplier', 'Better than Cash'], confidence: 99 },
  { id: 'dining', title: 'Dinner at Taj', amount: '₹8,500', icon: Utensils, card: 'HDFC Diners Club', save: '₹450', rewards: '2X Reward Points', reasons: ['Weekend Dining', 'Premium Multiplier'], confidence: 92 },
];

export function WrongCardSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <section ref={containerRef} className="relative w-full bg-[#0A0A0A] text-white">
      <div className="h-[500vh] w-full">
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          
          <div className="text-center mb-12 z-20 px-6">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">
              You're probably using the <span className="text-gray-500">wrong card</span>.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The best card isn't the one with the highest fee. It's the one that gives you maximum value for exactly what you're buying right now.
            </p>
          </div>

          <div className="relative w-full max-w-5xl mx-auto px-6 h-[400px] flex items-center justify-center">
            
            {scenarios.map((scenario, index) => {
              const segment = 1 / scenarios.length;
              const start = index * segment;
              const end = start + segment;
              
              const p1 = Math.max(0, start - 0.05);
              const p2 = Math.max(0, start);
              const p3 = Math.min(1, end - 0.05);
              const p4 = Math.min(1, end);
              
              const opacity = useTransform(
                smoothProgress,
                [p1, p2, p3, p4],
                [0, 1, 1, 0]
              );

              const y = useTransform(
                smoothProgress,
                [p1, p2, p3, p4],
                [20, 0, 0, -20]
              );

              const Icon = scenario.icon;

              return (
                <motion.div
                  key={scenario.id}
                  className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-12 w-full h-full pointer-events-none"
                  style={{ opacity, y }}
                >
                  {/* Scenario Details */}
                  <div className="flex flex-col items-center md:items-end text-center md:text-right w-full md:w-1/2">
                    <div className="w-16 h-16 rounded-full bg-[#111111] border border-white/[0.08] flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">Scenario</p>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{scenario.title}</h3>
                    <p className="text-xl font-medium text-gray-500">{scenario.amount}</p>
                  </div>

                  {/* Divider for Desktop */}
                  <div className="hidden md:block w-px h-64 bg-white/[0.08]" />

                  {/* Standardized Recommendation Card */}
                  <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                    <RecommendationCard 
                      cardName={scenario.card}
                      expectedSavings={scenario.save}
                      rewards={scenario.rewards}
                      reasons={scenario.reasons}
                      confidence={scenario.confidence}
                      className="pointer-events-auto shadow-none"
                    />
                  </div>
                </motion.div>
              );
            })}

            {/* Progress indicator */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-48 w-1 bg-[#111111] rounded-full hidden lg:block overflow-hidden">
              <motion.div 
                className="w-full bg-[#00E599] rounded-full origin-top"
                style={{ 
                  height: '100%',
                  scaleY: smoothProgress
                }}
              />
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}

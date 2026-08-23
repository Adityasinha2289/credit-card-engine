import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, Fuel, Plane, Utensils, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const scenarios = [
  { id: 'food', title: 'Food & Dining', desc: 'RenoCred instantly identifies which of your cards offers the highest multiplier for Zomato, Swiggy, and local restaurants.', icon: Utensils, image: '/images/features/food.webp' },
  { id: 'flights', title: 'Travel & Flights', desc: 'Stop wasting points. We calculate the exact redemption value of your air miles vs cash back for any flight booking.', icon: Plane, image: '/images/features/travel.webp' },
  { id: 'fuel', title: 'Fuel Stations', desc: 'Most fuel cards have specific MCC restrictions. RenoCred ensures you actually get your surcharge waiver.', icon: Fuel, image: '/images/features/fuel.webp' },
  { id: 'shopping', title: 'Online Shopping', desc: 'During big sales, we factor in instant bank discounts, affiliate offers, and card-specific limits in real-time.', icon: ShoppingBag, image: '/images/features/shopping.webp' },
];

export function ProductShowcaseSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

  return (
    <section id="product" ref={targetRef} className="relative h-[300vh] bg-[#0A0A0A]">
      <div className="sticky top-0 flex flex-col justify-center h-[100dvh] overflow-hidden py-16 md:py-24">
        
        <div className="w-full max-w-7xl mx-auto px-6 z-10 mb-8 md:mb-12 shrink-0">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-display font-bold text-white mb-4 tracking-tight">
            Engineered for every context.
          </h2>
          <p className="text-[clamp(1rem,2vw,1.125rem)] text-gray-400 max-w-2xl font-light">
            Whether you're booking a flight or buying a coffee, RenoCred adapts its recommendation algorithm instantly based on the merchant category code (MCC).
          </p>
        </div>

        <div className="w-full">
          <motion.div 
            style={{ x, paddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2))', paddingRight: 'max(1.5rem, calc((100vw - 80rem) / 2))' }} 
            className="flex gap-4 md:gap-8 w-max"
          >
            {scenarios.map((scenario) => {
              return (
                <div
                  key={scenario.id}
                  className="group relative h-[350px] md:h-[450px] w-[300px] md:w-[450px] overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#111111] border border-white/[0.08] hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out"
                >
                  {/* Background Image Layer */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={scenario.image} 
                      alt={scenario.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] group-hover:-translate-y-1"
                    />
                    {/* Overlays for Readability */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent opacity-90" />
                  </div>
                  
                  {/* Content Layer */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0A0A0A]/60 backdrop-blur-md border border-white/[0.08] flex items-center justify-center mb-4 md:mb-6">
                      <scenario.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 drop-shadow-md">{scenario.title}</h3>
                    <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 drop-shadow">
                      {scenario.desc}
                    </p>
                    
                    <Link to={`/methodology#${scenario.id}`} className="flex items-center gap-2 text-xs md:text-sm font-semibold text-white group-hover:text-[#2A9D5C] transition-colors w-fit drop-shadow">
                      See how it works <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
        
      </div>
    </section>
  );
}

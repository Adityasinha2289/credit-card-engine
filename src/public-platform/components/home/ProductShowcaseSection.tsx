import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, Fuel, Plane, Utensils, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const scenarios = [
  { id: 'food', title: 'Food & Dining', desc: 'RenoCred instantly identifies which of your cards offers the highest multiplier for Zomato, Swiggy, and local restaurants.', icon: Utensils, image: '/images/features/food.png' },
  { id: 'flights', title: 'Travel & Flights', desc: 'Stop wasting points. We calculate the exact redemption value of your air miles vs cash back for any flight booking.', icon: Plane, image: '/images/features/travel.png' },
  { id: 'fuel', title: 'Fuel Stations', desc: 'Most fuel cards have specific MCC restrictions. RenoCred ensures you actually get your surcharge waiver.', icon: Fuel, image: '/images/features/fuel.png' },
  { id: 'shopping', title: 'Online Shopping', desc: 'During big sales, we factor in instant bank discounts, affiliate offers, and card-specific limits in real-time.', icon: ShoppingBag, image: '/images/features/shopping.png' },
];

export function ProductShowcaseSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

  return (
    <section id="product" ref={targetRef} className="relative h-[300vh] bg-[#0A0A0A]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        <div className="absolute top-24 left-0 w-full px-8 md:px-24 z-10 pointer-events-none">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Engineered for every context.
          </h2>
          <p className="text-gray-400 text-lg max-w-xl">
            Whether you're booking a flight or buying a coffee, RenoCred adapts its recommendation algorithm instantly based on the merchant category code (MCC).
          </p>
        </div>

        <motion.div style={{ x }} className="flex gap-8 px-8 md:px-24 mt-24">
          {scenarios.map((scenario) => {
            return (
              <div
                key={scenario.id}
                className="group relative h-[450px] w-[350px] md:w-[450px] overflow-hidden rounded-[2.5rem] bg-[#111111] border border-white/[0.08] hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out"
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
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                  <div className="w-14 h-14 rounded-full bg-[#0A0A0A]/60 backdrop-blur-md border border-white/[0.08] flex items-center justify-center mb-6">
                    <scenario.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-md">{scenario.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 drop-shadow">
                    {scenario.desc}
                  </p>
                  
                  <Link to={`/methodology#${scenario.id}`} className="flex items-center gap-2 text-sm font-semibold text-white group-hover:text-[#00E599] transition-colors w-fit drop-shadow">
                    See how it works <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </motion.div>
        
      </div>
    </section>
  );
}

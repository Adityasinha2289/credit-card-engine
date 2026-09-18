import { motion } from 'framer-motion';
import { PieChart, ArrowRight, ShieldCheck } from 'lucide-react';

export function MoneyTrackerSection() {
  return (
    <section className="py-24 md:py-32 bg-white text-editorial-deep-forest relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-editorial-soft-sage/20 border border-editorial-soft-sage/30 text-[10px] font-bold tracking-widest uppercase text-editorial-forest mb-6">
              <PieChart className="w-3.5 h-3.5 text-editorial-forest" />
              <span>Smart Tracking</span>
            </div>
            
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-serif font-medium tracking-tight mb-6">
              Here's what RenoCred can help you understand.
            </h2>
            <p className="text-editorial-muted-sage text-lg md:text-xl font-light leading-relaxed mb-8 max-w-md">
              Connect your accounts once. Let RenoCred automatically categorize every transaction and find optimization opportunities.
            </p>
            
            <ul className="space-y-4 mb-10">
              {['Auto-categorization of expenses', 'Real-time sync with bank accounts', 'Identify missed reward opportunities'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-editorial-deep-forest">
                  <ShieldCheck className="w-5 h-5 text-editorial-soft-sage" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <button className="inline-flex items-center gap-2 px-8 py-4 bg-editorial-deep-forest text-white rounded-full font-medium hover:bg-editorial-forest transition-colors shadow-lg">
              Start Tracking <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Visual (Mobile Mockup) */}
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-editorial-soft-sage/20 blur-[100px] rounded-full translate-x-10 translate-y-10" />
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-[320px] h-[640px] bg-white rounded-[40px] border-[8px] border-editorial-light-cream shadow-2xl p-6 flex flex-col"
            >
              {/* Fake status bar */}
              <div className="w-full flex justify-between items-center mb-6">
                <span className="text-[10px] font-medium text-editorial-muted-sage">Demo View</span>
                <div className="w-16 h-4 bg-editorial-light-cream rounded-full" />
              </div>

              <h3 className="text-2xl font-serif font-medium mb-1">This Month</h3>
              <p className="text-3xl font-bold mb-8">₹ 84,500</p>

              {/* Donut Chart representation */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-[16px] border-editorial-forest border-r-editorial-soft-sage border-b-editorial-muted-sage border-l-editorial-deep-forest" />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-editorial-muted-sage">Total</span>
                  <span className="text-lg font-bold">142 Txns</span>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-editorial-forest" />
                    <span className="text-sm font-medium">Dining</span>
                  </div>
                  <span className="text-sm font-bold">₹ 32,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-editorial-deep-forest" />
                    <span className="text-sm font-medium">Travel</span>
                  </div>
                  <span className="text-sm font-bold">₹ 28,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-editorial-soft-sage" />
                    <span className="text-sm font-medium">Shopping</span>
                  </div>
                  <span className="text-sm font-bold">₹ 24,000</span>
                </div>
              </div>

              {/* Floating Tag */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -right-12 bottom-24 bg-editorial-forest text-editorial-light-cream px-4 py-3 rounded-2xl shadow-xl max-w-[200px]"
              >
                <p className="text-xs font-medium leading-relaxed">
                  You could have saved <span className="font-bold text-white">₹4,200</span> this month using Axis Atlas.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

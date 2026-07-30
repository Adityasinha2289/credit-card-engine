import { motion } from 'framer-motion';

export function RealSavingsSection() {
  return (
    <section className="w-full py-32 bg-[#0A0A0A] border-t border-white/[0.04] text-white relative overflow-hidden">
      
      {/* Abstract Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
        <div className="absolute inset-0 bg-brand-emerald/10 rounded-full blur-[140px]" />
        <div className="absolute inset-20 border border-white/[0.02] rounded-full" />
        <div className="absolute inset-40 border border-white/[0.03] rounded-full" />
        <div className="absolute inset-60 border border-white/[0.04] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-brand-emerald font-bold tracking-widest text-sm uppercase mb-8"
        >
          The Real Outcome
        </motion.p>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold mb-10 tracking-tight leading-tight"
        >
          Don't leave <span className="text-gray-500 line-through decoration-brand-emerald/40">money</span> <br/> 
          <span className="italic font-light">memories</span> on the table.
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl leading-relaxed mb-16 font-light"
        >
          An optimized wallet isn't just about spreadsheets and cash back. It's about that extra family vacation. It's the business class upgrade you didn't have to pay for.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          <div className="bg-[#111111] border border-white/[0.04] rounded-3xl p-8 flex flex-col items-center justify-center">
            <h3 className="text-4xl font-bold text-white mb-2">₹42K</h3>
            <p className="text-gray-500 text-sm font-medium">Average Annual Savings</p>
          </div>
          
          <div className="bg-[#111111] border border-white/[0.04] rounded-3xl p-8 flex flex-col items-center justify-center">
            <h3 className="text-4xl font-bold text-white mb-2">2.5X</h3>
            <p className="text-gray-500 text-sm font-medium">More Reward Value</p>
          </div>

          <div className="bg-[#111111] border border-white/[0.04] rounded-3xl p-8 flex flex-col items-center justify-center">
            <h3 className="text-4xl font-bold text-white mb-2">0</h3>
            <p className="text-gray-500 text-sm font-medium">Expired Points</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

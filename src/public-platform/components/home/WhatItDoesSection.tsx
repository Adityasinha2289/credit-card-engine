import { motion } from 'framer-motion';
import { fadeUpVariant, staggerContainer } from '../../../motion';
import { Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { NumberCounter } from './MotionUtils';

export function WhatItDoesSection() {
  return (
    <section id="how-it-works" className="relative w-full py-16 md:py-24 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={fadeUpVariant} className="text-[clamp(2rem,4vw,3.5rem)] font-display font-medium tracking-tight mb-4">
            More than just cards.
          </motion.h2>
          <motion.p variants={fadeUpVariant} className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
            Money, but make it make sense.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Recommendation Visual */}
          <motion.div 
            initial={{ opacity: 0, x: -20, rotate: -5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 hover:bg-[#111111] transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between min-h-[280px]"
          >
            <div className="w-full mb-8 relative h-20 flex items-center">
              <div className="absolute left-0 w-16 h-10 bg-white/10 rounded-md transform -rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-sm opacity-80" />
              <div className="absolute left-6 w-16 h-10 bg-white/20 border border-white/10 rounded-md transform rotate-6 group-hover:-rotate-3 transition-transform duration-500 shadow-md flex items-center justify-center text-white/50">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-display font-medium text-white mb-3">Which card should I use?</h3>
              <p className="text-gray-400 leading-relaxed text-sm font-light">Instantly know the best card for your next purchase, whether it's dining, travel, or shopping.</p>
            </div>
          </motion.div>

          {/* Card 2: Reward Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-semantic-brand-strong/10 border border-semantic-brand/30 rounded-[2rem] p-8 hover:bg-semantic-brand-strong/20 transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between min-h-[280px] text-white"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-semantic-brand/10 rounded-full blur-2xl group-hover:bg-semantic-brand/20 transition-colors duration-500" />
            <div className="w-full mb-8 relative h-20 flex items-center">
              <div className="bg-white/5 border border-semantic-brand/30 px-4 py-2 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform duration-500 backdrop-blur-sm">
                <span className="font-mono text-lg font-bold">₹<NumberCounter from={0} to={1250} delay={0.3} /></span>
                <ArrowUpRight className="w-4 h-4 text-semantic-brand" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-display font-medium text-white mb-3">What reward am I missing?</h3>
              <p className="text-gray-300 leading-relaxed text-sm font-light">Track your milestones and never let a waiver or reward point expire again.</p>
            </div>
          </motion.div>

          {/* Card 3: Offer Visual */}
          <motion.div 
            initial={{ opacity: 0, x: 20, rotate: 5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 hover:bg-[#111111] transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between min-h-[280px]"
          >
            <div className="w-full mb-8 relative h-20 flex items-center">
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.6 }}
                className="bg-white/5 border border-white/20 border-dashed px-4 py-2 rounded-lg flex items-center gap-2 group-hover:-translate-y-1 transition-transform duration-500 backdrop-blur-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Offer Valid</span>
              </motion.div>
            </div>
            <div>
              <h3 className="text-xl font-display font-medium text-white mb-3">Is this offer actually worth it?</h3>
              <p className="text-gray-400 leading-relaxed text-sm font-light">Get data-driven recommendations on cards to add or drop based on your actual spending patterns.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

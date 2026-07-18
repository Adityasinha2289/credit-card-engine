import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Zap, BarChart3, ChevronRight, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function HomePage() {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A] text-white selection:bg-emerald-500/30">
      <SEO 
        title="Renocred | Credit Card Optimizer & Recommendation Engine India"
        description="Renocred helps you understand your cards, compare benefits, and optimize credit card spending in India."
        canonicalUrl="https://www.renocred.com/"
      />
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-emerald-400 text-sm font-medium mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>The smarter way to use credit cards</span>
        </motion.div>
        
        <motion.h1 
          className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight leading-[1.1] max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Make every credit card <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            work harder for you
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Renocred is your intelligent companion for navigating the complex world of credit cards. Optimize spending, maximize rewards, and make smarter financial decisions.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/app" className="group relative inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black text-base font-semibold py-4 px-8 rounded-2xl transition-all overflow-hidden w-full sm:w-auto shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]">
            <span className="relative z-10 flex items-center gap-2">
              Open Renocred <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link to="/methodology" className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-base font-semibold py-4 px-8 rounded-2xl transition-all backdrop-blur-sm w-full sm:w-auto">
            Learn How We Evaluate
          </Link>
        </motion.div>
      </section>

      {/* Core Value */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={fadeIn} className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-[2rem] hover:bg-white/[0.04] transition-colors backdrop-blur-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20">
                <CreditCard className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Understand Your Wallet</h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">See all your cards, limits, rewards, and utilization in one unified, beautiful dashboard.</p>
            </div>
          </motion.div>
          
          <motion.div variants={fadeIn} className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-[2rem] hover:bg-white/[0.04] transition-colors backdrop-blur-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-teal-500/20">
                <Zap className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Optimize Every Spend</h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">Instantly know which card provides the absolute best value for every specific spending category.</p>
            </div>
          </motion.div>
          
          <motion.div variants={fadeIn} className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-[2rem] hover:bg-white/[0.04] transition-colors backdrop-blur-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-500/20">
                <BarChart3 className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Make Better Decisions</h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">Compare cards and evaluate options using highly structured, data-driven financial insights.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-[#111111] border border-white/[0.05] rounded-[3rem] p-12 md:p-20 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          <h2 className="text-3xl md:text-4xl font-bold mb-20 relative z-10">How Renocred Works</h2>
          <div className="flex flex-col md:flex-row items-start justify-center gap-12 md:gap-4 relative z-10">
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-20 h-20 bg-black border border-white/[0.08] rounded-3xl flex items-center justify-center font-display font-bold text-3xl text-emerald-400 mb-6 shadow-[0_0_30px_rgba(52,211,153,0.05)]">
                1
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Add your cards</h4>
              <p className="text-gray-400 max-w-[250px] mx-auto text-sm leading-relaxed">Securely input your current credit cards to build your digital wallet.</p>
            </div>
            
            <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent mt-10"></div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-20 h-20 bg-black border border-white/[0.08] rounded-3xl flex items-center justify-center font-display font-bold text-3xl text-emerald-400 mb-6 shadow-[0_0_30px_rgba(52,211,153,0.05)]">
                2
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Get insights</h4>
              <p className="text-gray-400 max-w-[250px] mx-auto text-sm leading-relaxed">Our engine analyzes your wallet to find optimization opportunities.</p>
            </div>
            
            <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent mt-10"></div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-20 h-20 bg-black border border-white/[0.08] rounded-3xl flex items-center justify-center font-display font-bold text-3xl text-emerald-400 mb-6 shadow-[0_0_30px_rgba(52,211,153,0.05)]">
                3
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Optimize spending</h4>
              <p className="text-gray-400 max-w-[250px] mx-auto text-sm leading-relaxed">Know exactly which card to use for every purchase you make.</p>
            </div>
            
          </div>
        </motion.div>
      </section>

      {/* Responsible Recommendations */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center z-10 border-t border-white/[0.05]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <ShieldCheck className="w-10 h-10 text-white/20 mb-6" />
          <h2 className="text-xl font-semibold mb-4 text-white/80">Responsible Recommendations</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-sm leading-relaxed">
            Renocred provides structured information to help you make informed decisions. We aim to clarify, not replace, your personal financial judgment.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
            <Link to="/methodology" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-medium">
              Evaluation Methodology <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="hidden sm:inline text-white/10">•</span>
            <Link to="/disclaimer" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-medium">
              Disclaimer <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="hidden sm:inline text-white/10">•</span>
            <Link to="/affiliate-disclosure" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-medium">
              Affiliate Disclosure <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

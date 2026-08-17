import { SEO } from '../components/SEO';
import { ContentMeta } from '../components/ContentMeta';
import { motion } from 'framer-motion';

export function AboutPage() {
  return (
    <div className="w-full min-h-[100dvh] relative overflow-hidden bg-[#0A0A0A] text-white selection:bg-brand-emerald-glow">
      <SEO 
        title="About RenoCred | Optimizing Your Credit Card Strategy"
        description="Learn about RenoCred's mission to bring clarity and transparency to the Indian credit card ecosystem."
        canonicalUrl="https://renocred.com/about"
      />
      
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-brand-emerald/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-emerald/3 rounded-full blur-[160px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 text-center z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          {/* RenoCred Logo Badge */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#111] to-[#050505] border border-white/[0.08] rounded-[1.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(0,229,153,0.15)] relative overflow-hidden group">
             <div className="absolute inset-0 bg-brand-emerald/10 blur-2xl group-hover:bg-brand-emerald/20 transition-colors duration-700" />
             <img src="/logo.jpg" alt="RenoCred Logo" className="w-12 h-12 rounded-xl object-cover relative z-10" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-teal-800">RenoCred</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          We built RenoCred to solve a simple problem: maximizing credit card rewards and financial value is entirely too complicated.
        </motion.p>
        <div className="max-w-2xl mx-auto mt-8 flex justify-center">
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[#111111] border border-white/[0.04] rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-p:leading-relaxed prose-p:text-lg space-y-8">
            <p>
              The modern credit card ecosystem in India is filled with hidden benefits, complex reward structures, shifting eligibility rules, and opaque terms. For the average consumer, making a confident decision about which card to use—or which card to apply for next—usually requires building a complex spreadsheet.
            </p>
            <p>
              Our philosophy is built entirely on <strong className="text-white">clarity and transparency</strong>. We aim to structure credit card information logically and provide intelligent AI-driven tools that help you understand your own spending habits instantly.
            </p>
            <div className="p-6 bg-[#0A0A0A] border border-white/[0.04] rounded-2xl my-8">
              <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-gray-400 m-0">
                By evaluating how different cards align with your personal expenses in real-time, we ensure you optimize your wallet and never leave money on the table without the guesswork.
              </p>
            </div>
            <p>
              We are building RenoCred to be your ultimate credit card command center—a beautiful, intelligent hub where you can manage your existing cards, optimize your everyday spending, and make confident, data-driven financial decisions at a glance.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

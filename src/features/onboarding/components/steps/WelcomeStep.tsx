import React, { useEffect } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton } from '../primitives/Buttons';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Plane, Utensils, ShoppingBag, Trophy, CreditCard, ArrowRight } from 'lucide-react';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  // Mouse parallax setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse coordinates
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // Transforms for parallax layers (keep it subtle, 5-10px max)
  const layer1X = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const layer1Y = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);
  
  const layer2X = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const layer2Y = useTransform(smoothY, [-0.5, 0.5], [12, -12]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -0.5 to 0.5
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-center">
      {/* Interactive Visual Scene */}
      <div className="relative w-full max-w-[320px] h-[240px] md:h-[280px] mb-8 flex items-center justify-center">
        
        {/* Floating Icons (Layer 2 - background parallax) */}
        <motion.div style={{ x: layer2X, y: layer2Y }} className="absolute inset-0 z-0">
          <motion.div 
            animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-4 left-4 p-3 bg-white rounded-xl shadow-lg border border-[#F3F4F6]"
          >
            <Plane size={20} className="text-[#2A9D5C]" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-6 left-2 p-3 bg-white rounded-xl shadow-lg border border-[#F3F4F6]"
          >
            <ShoppingBag size={20} className="text-blue-500" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-8 right-2 p-3 bg-white rounded-xl shadow-lg border border-[#F3F4F6]"
          >
            <Utensils size={20} className="text-orange-500" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 8, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-10 right-6 p-3 bg-white rounded-xl shadow-lg border border-[#F3F4F6]"
          >
            <Trophy size={20} className="text-yellow-500" />
          </motion.div>
        </motion.div>

        {/* Central Object (Layer 1 - foreground parallax) */}
        <motion.div 
          style={{ x: layer1X, y: layer1Y }}
          className="relative z-10 w-48 h-32 md:w-56 md:h-36 rounded-2xl shadow-2xl flex flex-col justify-between p-5 overflow-hidden"
          animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Card background styling */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#111827] to-[#374151]" />
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#2A9D5C] rounded-full blur-[40px] opacity-40" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-blue-500 rounded-full blur-[40px] opacity-20" />
          
          <div className="relative z-20 flex justify-between items-center w-full">
            <CreditCard size={24} className="text-white/80" />
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md -mr-2" />
              <div className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-md" />
            </div>
          </div>
          
          <div className="relative z-20 flex flex-col items-start w-full">
            <div className="h-1.5 w-12 bg-white/20 rounded-full mb-2" />
            <div className="h-1.5 w-24 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Copy */}
      <SectionHeading className="text-3xl md:text-5xl font-display uppercase tracking-tight mb-4 text-[#111827]">
        Welcome to Reno Cred
      </SectionHeading>

      <SectionDescription className="mb-10 text-base md:text-lg text-[#6B7280]">
        Your smarter money journey starts here.
      </SectionDescription>

      {/* Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <button
          onClick={onContinue}
          className="flex items-center gap-3 bg-[#111827] text-white px-8 py-4 rounded-full font-bold text-sm md:text-base tracking-wide hover:bg-[#1f2937] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
        >
          LET'S GO <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}

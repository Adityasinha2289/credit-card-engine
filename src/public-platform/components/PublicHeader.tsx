import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import { interactivePrimary, interactiveSecondary } from '../../motion';
import { CardsMegaMenu } from './header/CardsMegaMenu';
import { ChevronDown } from 'lucide-react';

// Wrap Link to allow Framer Motion props
const MotionLink = motion.create ? motion.create(Link as any) : motion(Link as any);
const MotionAnchor = motion.a;

export function PublicHeader() {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [isCardsMenuOpen, setIsCardsMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCardsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCardsMenuOpen(false);
    }, 150); // slight delay to prevent flickering when moving to dropdown
  };

  // Continuous GPU-accelerated interpolation (0px to 50px of scroll)
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.8)']
  );
  
  const borderBottomColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.04)']
  );

  const paddingY = useTransform(
    scrollY,
    [0, 50],
    ['1.5rem', '1rem'] // py-6 to py-4 equivalent
  );

  const backdropBlur = useTransform(
    scrollY,
    [0, 50],
    ['blur(0px)', 'blur(12px)']
  );

  // Fallback physics if reduced motion is enabled
  const hoverPhysicsSecondary = shouldReduceMotion ? undefined : interactiveSecondary.hover;
  const tapPhysicsSecondary = shouldReduceMotion ? undefined : interactiveSecondary.tap;
  
  const hoverPhysicsPrimary = shouldReduceMotion ? undefined : interactivePrimary.hover;
  const tapPhysicsPrimary = shouldReduceMotion ? undefined : interactivePrimary.tap;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        backgroundColor,
        borderBottomColor,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        paddingTop: paddingY,
        paddingBottom: paddingY,
        backdropFilter: backdropBlur,
        WebkitBackdropFilter: backdropBlur,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between relative">
        
        {/* Logo */}
        <MotionLink 
          to="/" 
          whileHover={hoverPhysicsSecondary}
          whileTap={tapPhysicsSecondary}
          className="font-display font-bold text-xl tracking-tight flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md"
        >
          <img src="/logo.jpg" alt="RenoCred Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-white">RenoCred</span>
        </MotionLink>
        
        {/* Links */}
        <nav className="hidden md:flex items-center gap-8">
          <MotionAnchor 
            href="/#product" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            Product
          </MotionAnchor>
          
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <MotionLink 
              to="/cards"
              whileHover={hoverPhysicsSecondary}
              whileTap={tapPhysicsSecondary}
              className={`text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1 flex items-center gap-1 ${isCardsMenuOpen ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Cards <ChevronDown size={14} className={`transition-transform duration-200 ${isCardsMenuOpen ? 'rotate-180 text-semantic-brand-strong' : ''}`} />
            </MotionLink>
            <AnimatePresence>
              {isCardsMenuOpen && (
                <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  <CardsMegaMenu onClose={() => setIsCardsMenuOpen(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>

          <MotionAnchor 
            href="/#how-it-works" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            How It Works
          </MotionAnchor>
          <MotionLink 
            to="/methodology" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            Methodology
          </MotionLink>
        </nav>
        
        {/* CTAs */}
        <div className="flex items-center gap-4">
          <MotionLink 
            to="/app#log-in" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            Log In
          </MotionLink>
          <MotionLink 
            to="/app#sign-up" 
            whileHover={hoverPhysicsPrimary}
            whileTap={tapPhysicsPrimary}
            className="bg-emerald-500 text-[#0A0A0A] text-sm font-semibold py-2.5 px-6 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            Get Started
          </MotionLink>
        </div>

      </div>
    </motion.header>
  );
}

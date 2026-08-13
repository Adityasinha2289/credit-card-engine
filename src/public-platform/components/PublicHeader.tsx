import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { interactivePrimary, interactiveSecondary } from '../../motion';

// Wrap Link to allow Framer Motion props
const MotionLink = motion.create ? motion.create(Link as any) : motion(Link as any);
const MotionAnchor = motion.a;

export function PublicHeader() {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

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
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        
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
          <MotionLink 
            to="/" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            Home
          </MotionLink>
          <MotionAnchor 
            href="#product" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            Product
          </MotionAnchor>
          <MotionAnchor 
            href="#ai" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            Intelligence
          </MotionAnchor>
          <MotionLink 
            to="/methodology" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            Methodology
          </MotionLink>
          <MotionLink 
            to="/about" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1"
          >
            About
          </MotionLink>
        </nav>
        
        {/* CTAs */}
        <div className="flex items-center gap-6">

          <MotionLink 
            to="/app" 
            whileHover={hoverPhysicsPrimary}
            whileTap={tapPhysicsPrimary}
            className="relative overflow-hidden bg-gradient-to-b from-[#2a9652] to-[#1e6e3c] text-white text-sm font-bold py-2 px-6 rounded-full transition-all shadow-[0_8px_24px_-6px_rgba(35,126,69,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] ring-1 ring-white/10 hover:shadow-[0_12px_32px_-8px_rgba(35,126,69,0.7),inset_0_1px_1px_rgba(255,255,255,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#237E45]/50 hover:-translate-y-0.5 hover:brightness-110 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]"
          >
            Open App
          </MotionLink>
        </div>

      </div>
    </motion.header>
  );
}

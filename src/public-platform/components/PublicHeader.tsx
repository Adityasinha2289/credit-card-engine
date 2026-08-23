import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import { interactivePrimary, interactiveSecondary } from '../../motion';
import { CardsMegaMenu } from './header/CardsMegaMenu';
import { ChevronDown, Menu, X } from 'lucide-react';

// Wrap Link to allow Framer Motion props
const MotionLink = motion.create ? motion.create(Link as any) : motion(Link as any);
const MotionAnchor = motion.a;

export function PublicHeader() {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [isCardsMenuOpen, setIsCardsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

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
    ['rgba(250, 251, 249, 0)', 'rgba(10, 10, 10, 0.8)']
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
    <>
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
          className="font-display font-bold text-xl tracking-tight flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md shrink-0"
        >
          <img src="/logo.jpg" alt="RenoCred Logo" className="w-8 h-8 rounded-lg object-cover shrink-0" />
          <span className={`transition-colors duration-200 whitespace-nowrap hidden sm:block ${isScrolled ? 'text-white' : 'text-gray-900'}`}>RenoCred</span>
        </MotionLink>
        
        {/* Links */}
        <nav className="hidden md:flex items-center gap-8">
          <MotionAnchor 
            href="/#how-it-works" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className={`text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1 ${isScrolled ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
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
              className={`text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1 flex items-center gap-1 ${isCardsMenuOpen ? (isScrolled ? 'text-white' : 'text-gray-900') : (isScrolled ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')}`}
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
            className={`text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1 ${isScrolled ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            How It Works
          </MotionAnchor>
          <MotionLink 
            to="/methodology" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className={`text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1 ${isScrolled ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Methodology
          </MotionLink>
        </nav>
        
        {/* CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
          <MotionLink 
            to="/cards"
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className={`hidden sm:block md:hidden text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-1 sm:px-2 py-1 ${isScrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
          >
            Explore Cards
          </MotionLink>
          <MotionLink 
            to="/app#log-in" 
            whileHover={hoverPhysicsSecondary}
            whileTap={tapPhysicsSecondary}
            className={`hidden md:block text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-brand-strong/50 rounded-md px-2 py-1 ${isScrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
          >
            Log In
          </MotionLink>
          <MotionLink 
            to="/app#sign-up" 
            whileHover={hoverPhysicsPrimary}
            whileTap={tapPhysicsPrimary}
            className="bg-[#2A9D5C] text-white text-xs sm:text-sm font-semibold whitespace-nowrap py-1.5 px-3 sm:py-2 sm:px-4 md:py-2.5 md:px-6 rounded-full transition-all shadow-[0_4px_20px_rgba(42,157,92,0.25)] hover:shadow-[0_4px_25px_rgba(42,157,92,0.35)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A9D5C]/50 shrink-0"
          >
            Get Started
          </MotionLink>
          
          <button 
            className={`md:hidden p-2 -mr-2 transition-colors duration-200 ${isScrolled ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
                <img src="/logo.jpg" alt="RenoCred Logo" className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-white">RenoCred</span>
              </div>
              <button 
                className="p-2 -mr-2 text-gray-300 hover:text-white bg-white/5 rounded-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 text-xl font-medium">
              <a href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white pb-4 border-b border-white/10">Product</a>
              <Link to="/cards" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white pb-4 border-b border-white/10 flex justify-between items-center">
                Cards <ChevronDown size={20} className="-rotate-90" />
              </Link>
              <a href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white pb-4 border-b border-white/10">How It Works</a>
              <Link to="/methodology" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white pb-4 border-b border-white/10">Methodology</Link>
              <Link to="/app#log-in" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-white pb-4 border-b border-white/10">Log In</Link>
            </nav>
            
            <div className="mt-auto mb-8">
              <Link 
                to="/app#sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-[#2A9D5C] text-white text-lg font-semibold py-4 rounded-full flex items-center justify-center transition-all shadow-[0_4px_20px_rgba(42,157,92,0.25)] hover:shadow-[0_4px_25px_rgba(42,157,92,0.35)]"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

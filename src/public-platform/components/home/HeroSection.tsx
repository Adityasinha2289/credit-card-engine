import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Smartphone, Tablet, Laptop, Asterisk } from 'lucide-react';
import { IPhoneMockup } from './IPhoneMockup';
import { IPadMockup } from './IPadMockup';
import { MacBookMockup } from './MacBookMockup';
import { HeroIPhoneContent } from './HeroIPhoneContent';
import { HeroIPadContent } from './HeroIPadContent';
import { HeroMacBookContent } from './HeroMacBookContent';
import { cn } from '../../../lib/utils';
import { FloatingObject } from './MotionUtils';
import { HeroOrbit } from './HeroOrbit';

type DeviceType = 'iphone' | 'ipad' | 'macbook';
const DEVICES: DeviceType[] = ['iphone', 'ipad', 'macbook'];

export function HeroSection() {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('ipad');
  const shouldReduceMotion = useReducedMotion();
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const startAutoPlay = () => {
    if (shouldReduceMotion) return;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveDevice(current => {
        const idx = DEVICES.indexOf(current);
        return DEVICES[(idx + 1) % DEVICES.length];
      });
    }, 5000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [shouldReduceMotion]);

  const handleDeviceChange = (device: DeviceType) => {
    setActiveDevice(device);
    startAutoPlay();
  };

  const handlePrev = () => {
    setActiveDevice(current => {
      const idx = DEVICES.indexOf(current);
      return DEVICES[(idx - 1 + DEVICES.length) % DEVICES.length];
    });
    startAutoPlay();
  };

  const handleNext = () => {
    setActiveDevice(current => {
      const idx = DEVICES.indexOf(current);
      return DEVICES[(idx + 1) % DEVICES.length];
    });
    startAutoPlay();
  };

  // Mobile layout stacks correctly with order classes.
  return (
    <section className="relative w-full flex flex-col items-center justify-start overflow-hidden bg-editorial-light-cream text-editorial-deep-forest pt-24 lg:pt-32 pb-16">
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-12 items-center flex-1">
        
        {/* Left Text */}
        <div className="col-span-1 lg:col-span-5 flex flex-col items-start text-left z-20 w-full animate-[fade-in-up_0.8s_ease-out_forwards]">

          <h1 className="text-[clamp(2.5rem,4.5vw,4.5rem)] font-serif font-medium mb-6 tracking-tight leading-[1.05] text-editorial-deep-forest">
            SMART MONEY.<br className="hidden md:block"/>BETTER MOVES.
          </h1>
          
          <p className="text-sm md:text-base text-editorial-muted-sage mb-10 max-w-md leading-relaxed font-light">
            Your cards should work harder for you. Rewards. Offers. Credit health. All in one intelligent wallet.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button onClick={() => window.location.href = '/app/sign-up'} className="w-full sm:w-auto bg-editorial-deep-forest text-editorial-warm-cream font-semibold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:bg-editorial-forest focus:outline-none shadow-md group">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-transparent border border-editorial-soft-sage/40 text-editorial-deep-forest font-medium px-8 py-3.5 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-black/5 focus:outline-none">
              See How It Works →
            </button>
          </div>
          
        </div>

        {/* Right UI Element - 3D Device Showcase */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center relative w-full min-w-0 z-10 pb-8 lg:pb-0 lg:pt-0">
          
          {/* Showcase Stage (Fixed bounds to prevent layout shifting) */}
          <div className="device-showcase relative w-full max-w-[650px] h-[450px] md:h-[550px] flex items-center justify-center perspective-[1200px] z-20">
            
            {/* Gen-Z Playful Elements */}
            <FloatingObject delay={0.2} rotation={-12} yOffset={8} duration={5} className="absolute -left-4 md:-left-12 top-1/4 z-40 hidden md:block">
              <div className="bg-white text-editorial-deep-forest px-3 py-1.5 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] text-[10px] font-bold font-mono flex items-center gap-1 border border-editorial-soft-sage/20 cursor-default hover:scale-110 transition-transform">
                <Asterisk className="w-3 h-3 text-editorial-forest" />
                WORTH IT.
              </div>
            </FloatingObject>

            <FloatingObject delay={0.5} rotation={15} yOffset={10} duration={6} className="absolute right-4 md:-right-8 top-1/3 z-40">
              <div className="bg-editorial-forest text-editorial-warm-cream px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold font-mono flex items-center gap-1 cursor-default hover:scale-110 transition-transform">
                +₹1,250
              </div>
            </FloatingObject>

            {/* Gen-Z Dynamic Orbit Layer */}
            <HeroOrbit />

            {/* Ambient background glow (behind everything) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none z-0">
              <div className="w-[200px] h-[200px] bg-editorial-soft-sage/30 blur-[120px] rounded-full absolute" />
            </div>

            {/* Continuous subtle floating of the entire scene */}
            <motion.div 
              animate={shouldReduceMotion ? {} : { y: [-8, 8, -8] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center transform-style-3d z-10"
            >

              {/* iPhone State */}
              <motion.div
                animate={{
                  x: activeDevice === 'iphone' ? "0%" : (activeDevice === 'ipad' ? "-60%" : "-80%"),
                  z: activeDevice === 'iphone' ? 0 : (activeDevice === 'ipad' ? -100 : -200),
                  rotateY: activeDevice === 'iphone' ? 0 : 15,
                  scale: activeDevice === 'iphone' ? 1 : (activeDevice === 'ipad' ? 0.85 : 0.75),
                  opacity: activeDevice === 'iphone' ? 1 : 0,
                  zIndex: activeDevice === 'iphone' ? 30 : (activeDevice === 'ipad' ? 20 : 10),
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "absolute w-[180px] sm:w-[200px] md:w-[240px]",
                  activeDevice === 'macbook' ? "pointer-events-none" : ""
                )}
              >
                <IPhoneMockup className="w-full">
                  <HeroIPhoneContent />
                </IPhoneMockup>
              </motion.div>

              {/* iPad State */}
              <motion.div
                animate={{
                  x: activeDevice === 'ipad' ? "0%" : (activeDevice === 'iphone' ? "45%" : "-40%"),
                  z: activeDevice === 'ipad' ? 0 : -100,
                  rotateY: activeDevice === 'ipad' ? 0 : (activeDevice === 'iphone' ? -15 : 10),
                  scale: activeDevice === 'ipad' ? 1 : 0.85,
                  opacity: activeDevice === 'ipad' ? 1 : 0,
                  zIndex: activeDevice === 'ipad' ? 30 : 20,
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[260px] sm:w-[320px] md:w-[380px]"
              >
                <IPadMockup className="w-full">
                  <HeroIPadContent />
                </IPadMockup>
              </motion.div>

              {/* MacBook State */}
              <motion.div
                animate={{
                  x: activeDevice === 'macbook' ? "0%" : (activeDevice === 'iphone' ? "75%" : "50%"),
                  z: activeDevice === 'macbook' ? 0 : (activeDevice === 'iphone' ? -200 : -100),
                  rotateY: activeDevice === 'macbook' ? 0 : -15,
                  scale: activeDevice === 'macbook' ? 1 : (activeDevice === 'iphone' ? 0.75 : 0.85),
                  opacity: activeDevice === 'macbook' ? 1 : 0,
                  zIndex: activeDevice === 'macbook' ? 30 : 10,
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "absolute w-[320px] sm:w-[420px] md:w-[520px]",
                  activeDevice === 'iphone' ? "pointer-events-none" : ""
                )}
              >
                <MacBookMockup className="w-full">
                  <HeroMacBookContent />
                </MacBookMockup>
              </motion.div>

            </motion.div>
          </div>

          {/* Device Switcher (Anchored below stage) */}
          <div className="flex items-center gap-2 mt-2 z-40 relative">
            <button onClick={handlePrev} className="p-2 rounded-full border border-editorial-soft-sage/30 hover:bg-white transition-colors text-editorial-muted-sage hover:text-editorial-deep-forest bg-white/50 backdrop-blur-sm shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex bg-white/50 backdrop-blur-sm border border-editorial-soft-sage/30 rounded-full p-1 shadow-sm">
              <button 
                onClick={() => handleDeviceChange('iphone')}
                className={cn("flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors", activeDevice === 'iphone' ? "bg-editorial-soft-sage/20 text-editorial-forest" : "text-editorial-muted-sage hover:text-editorial-deep-forest")}
              >
                <Smartphone className="w-4 h-4" /> <span className="hidden sm:inline">iPhone</span>
              </button>
              <button 
                onClick={() => handleDeviceChange('ipad')}
                className={cn("flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors", activeDevice === 'ipad' ? "bg-editorial-soft-sage/20 text-editorial-forest" : "text-editorial-muted-sage hover:text-editorial-deep-forest")}
              >
                <Tablet className="w-4 h-4" /> <span className="hidden sm:inline">iPad</span>
              </button>
              <button 
                onClick={() => handleDeviceChange('macbook')}
                className={cn("flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors", activeDevice === 'macbook' ? "bg-editorial-soft-sage/20 text-editorial-forest" : "text-editorial-muted-sage hover:text-editorial-deep-forest")}
              >
                <Laptop className="w-4 h-4" /> <span className="hidden sm:inline">MacBook</span>
              </button>
            </div>

            <button onClick={handleNext} className="p-2 rounded-full border border-editorial-soft-sage/30 hover:bg-white transition-colors text-editorial-muted-sage hover:text-editorial-deep-forest bg-white/50 backdrop-blur-sm shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>



    </section>
  );
}

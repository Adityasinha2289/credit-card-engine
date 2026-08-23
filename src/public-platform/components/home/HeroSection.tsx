import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Lock, ChevronLeft, ChevronRight, Smartphone, Tablet, Laptop } from 'lucide-react';
import { IPhoneMockup } from './IPhoneMockup';
import { IPadMockup } from './IPadMockup';
import { MacBookMockup } from './MacBookMockup';
import { HeroIPhoneContent } from './HeroIPhoneContent';
import { HeroIPadContent } from './HeroIPadContent';
import { HeroMacBookContent } from './HeroMacBookContent';
import { cn } from '../../../lib/utils';

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
    }, 1500);
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
    <section className="relative w-full min-h-[100dvh] flex flex-col items-center justify-start overflow-hidden bg-[#FAFBF9] text-gray-900 pt-32 lg:pt-40">
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-12 items-center flex-1">
        
        {/* Left Text */}
        <div className="col-span-1 lg:col-span-5 flex flex-col items-start text-left z-20 w-full animate-[fade-in-up_0.8s_ease-out_forwards]">

          <h1 className="text-[clamp(2.5rem,4.5vw,4.5rem)] font-display font-medium mb-6 tracking-tight leading-[1.05] text-gray-900 break-words w-full">
            Your wallet<br/>has more<br/>potential.<br/>
            <span className="text-semantic-brand-strong">RenoCred</span> helps<br/>you unlock it.
          </h1>
          
          <p className="hidden lg:block text-[clamp(1rem,1.2vw,1.125rem)] text-gray-600 mb-10 max-w-md leading-relaxed font-light">
            RenoCred understands your cards, spending patterns, and financial preferences to provide personalized recommendations.
          </p>
          
          <div className="hidden lg:flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button onClick={() => window.location.href = '/app#sign-up'} className="w-full sm:w-auto bg-[#2A9D5C] text-white font-semibold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(42,157,92,0.25)] hover:shadow-[0_4px_25px_rgba(42,157,92,0.35)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A9D5C]/50">
              Start Optimizing <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-transparent text-gray-900 font-medium px-6 py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-black/5 transition-colors group">
              Explore RenoCred <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </button>
          </div>
          
        </div>

        {/* Right UI Element - 3D Device Showcase */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center relative w-full min-w-0 z-10 pb-8 lg:pb-0 lg:pt-0">
          
          {/* Showcase Stage (Fixed bounds to prevent layout shifting) */}
          <div className="device-showcase relative w-full max-w-[650px] h-[450px] md:h-[550px] flex items-center justify-center perspective-[1200px] z-20">
            
            {/* Ambient Orbit Effect (strictly behind devices, very low opacity) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none z-0">
              <div className="w-[140%] sm:w-[120%] aspect-[2/1] border-[1px] border-semantic-brand-strong/20 rounded-[100%] absolute transform rotate-12" />
              <div className="w-[140%] sm:w-[120%] aspect-[2/1] border-[1px] border-semantic-brand-strong/10 rounded-[100%] absolute transform -rotate-6" />
              <div className="w-[200px] h-[200px] bg-semantic-brand-strong/15 blur-[120px] rounded-full absolute" />
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
            <button onClick={handlePrev} className="p-2 rounded-full border border-gray-200 hover:bg-white transition-colors text-gray-500 hover:text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              <button 
                onClick={() => handleDeviceChange('iphone')}
                className={cn("flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors", activeDevice === 'iphone' ? "bg-semantic-brand-strong/10 text-semantic-brand-strong" : "text-gray-600 hover:text-gray-900")}
              >
                <Smartphone className="w-4 h-4" /> <span className="hidden sm:inline">iPhone</span>
              </button>
              <button 
                onClick={() => handleDeviceChange('ipad')}
                className={cn("flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors", activeDevice === 'ipad' ? "bg-semantic-brand-strong/10 text-semantic-brand-strong" : "text-gray-600 hover:text-gray-900")}
              >
                <Tablet className="w-4 h-4" /> <span className="hidden sm:inline">iPad</span>
              </button>
              <button 
                onClick={() => handleDeviceChange('macbook')}
                className={cn("flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors", activeDevice === 'macbook' ? "bg-semantic-brand-strong/10 text-semantic-brand-strong" : "text-gray-600 hover:text-gray-900")}
              >
                <Laptop className="w-4 h-4" /> <span className="hidden sm:inline">MacBook</span>
              </button>
            </div>

            <button onClick={handleNext} className="p-2 rounded-full border border-gray-200 hover:bg-white transition-colors text-gray-500 hover:text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>



    </section>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

export function PublicHeader() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/[0.04] py-4' 
          : 'bg-transparent border-b-transparent py-6'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="font-display font-bold text-xl tracking-tight flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00E599]/50 rounded-md">
          <img src="/logo.jpg" alt="RenoCred Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-white">RenoCred</span>
        </Link>
        
        {/* Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Home</Link>
          <a href="#product" className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Product</a>
          <a href="#ai" className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Intelligence</a>
          <Link to="/methodology" className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">Methodology</Link>
          <Link to="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus:underline">About</Link>
        </nav>
        
        {/* CTAs */}
        <div className="flex items-center gap-6">
          <button className="text-sm font-medium text-white hover:text-[#00E599] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00E599]/50 rounded-md">
            Sign In
          </button>
          <Link to="/app" className="bg-[#00E599] hover:bg-[#00c985] text-[#0A0A0A] text-sm font-semibold py-2 px-5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#00E599]/50">
            Open App
          </Link>
        </div>

      </div>
    </motion.header>
  );
}

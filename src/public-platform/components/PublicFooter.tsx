import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function PublicFooter() {
  const year = new Date().getFullYear();
  
  const handleProtectedLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast('Sign up or log in to RenoCred to explore this feature and access all tools.', {
      style: {
        background: '#0A0A0A',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)'
      }
    });
  };
  return (
    <footer className="border-t border-white/5 bg-[#0f1115] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight mb-4">renocred</h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">India's #1 AI-powered credit card intelligence platform. Compare, optimize, and maximize your rewards.</p>
            <div className="flex flex-col gap-2 mt-6">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Socials</span>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/social_renocred/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="https://www.linkedin.com/company/renocred" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Company navigation">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link to="/methodology" className="text-sm text-gray-400 hover:text-white transition-colors">Methodology</Link></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </nav>

          {/* Cards & Banks — SEO link structure for future programmatic pages */}
          <nav aria-label="Credit card resources">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Cards</h3>
            <ul className="space-y-4">
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">All Credit Cards</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Best Travel Cards</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Best Cashback Cards</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Best Fuel Cards</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Best Student Cards</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Lifetime Free Cards</a></li>
            </ul>
          </nav>

          {/* Tools */}
          <nav aria-label="Tools and calculators">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Tools</h3>
            <ul className="space-y-4">
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Compare Cards</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Rewards Calculator</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Savings Estimator</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Eligibility Checker</a></li>
              <li><Link to="/app" className="text-sm text-brand-emerald font-semibold hover:text-brand-emerald-hover transition-colors">Open RenoCred App →</Link></li>
            </ul>
          </nav>

          {/* Trust & Legal */}
          <nav aria-label="Legal and trust pages">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Trust & Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Editorial Policy</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Affiliate Disclosure</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" onClick={handleProtectedLink} className="text-sm text-gray-400 hover:text-white transition-colors">Financial Disclaimer</a></li>
            </ul>
          </nav>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p>&copy; {year} RenoCred. All rights reserved.</p>
          <p className="max-w-2xl text-left md:text-right">RenoCred provides informational and analytical tools. We are not acting as a financial advisor. Recommendations and comparisons do not guarantee outcomes. Credit card terms and eligibility can change. Users should verify product details with the official issuer.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';

export function PublicFooter() {
  const year = new Date().getFullYear();
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
              <li><a href="https://careers.renocred.com" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </nav>

          {/* Cards & Banks — SEO link structure for future programmatic pages */}
          <nav aria-label="Credit card resources">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Cards</h3>
            <ul className="space-y-4">
              <li><Link to="/cards" className="text-sm text-gray-400 hover:text-white transition-colors">All Credit Cards</Link></li>
              <li><Link to="/best/travel-cards" className="text-sm text-gray-400 hover:text-white transition-colors">Best Travel Cards</Link></li>
              <li><Link to="/best/cashback-cards" className="text-sm text-gray-400 hover:text-white transition-colors">Best Cashback Cards</Link></li>
              <li><Link to="/best/fuel-cards" className="text-sm text-gray-400 hover:text-white transition-colors">Best Fuel Cards</Link></li>
              <li><Link to="/best/student-cards" className="text-sm text-gray-400 hover:text-white transition-colors">Best Student Cards</Link></li>
              <li><Link to="/best/lifetime-free-cards" className="text-sm text-gray-400 hover:text-white transition-colors">Lifetime Free Cards</Link></li>
            </ul>
          </nav>

          {/* Tools */}
          <nav aria-label="Tools and calculators">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Tools</h3>
            <ul className="space-y-4">
              <li><Link to="/compare" className="text-sm text-gray-400 hover:text-white transition-colors">Compare Cards</Link></li>
              <li><Link to="/calculators/rewards" className="text-sm text-gray-400 hover:text-white transition-colors">Rewards Calculator</Link></li>
              <li><Link to="/calculators/savings" className="text-sm text-gray-400 hover:text-white transition-colors">Savings Estimator</Link></li>
              <li><Link to="/calculators/eligibility" className="text-sm text-gray-400 hover:text-white transition-colors">Eligibility Checker</Link></li>
              <li><Link to="/app" className="text-sm text-[#5da08c] font-semibold hover:text-[#4d8675] transition-colors">Open RenoCred App →</Link></li>
            </ul>
          </nav>

          {/* Trust & Legal */}
          <nav aria-label="Legal and trust pages">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Trust & Legal</h3>
            <ul className="space-y-4">
              <li><Link to="/editorial-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Editorial Policy</Link></li>
              <li><Link to="/affiliate-disclosure" className="text-sm text-gray-400 hover:text-white transition-colors">Affiliate Disclosure</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-gray-400 hover:text-white transition-colors">Financial Disclaimer</Link></li>
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

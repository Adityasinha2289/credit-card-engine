import { Link } from 'react-router-dom';

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/5 bg-[#0f1115] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight mb-4">renocred</h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">Smarter credit card decisions, personalized for the way you spend.</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link to="/methodology" className="text-sm text-gray-400 hover:text-white transition-colors">Methodology</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Trust & Legal</h3>
            <ul className="space-y-4">
              <li><Link to="/editorial-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Editorial Policy</Link></li>
              <li><Link to="/affiliate-disclosure" className="text-sm text-gray-400 hover:text-white transition-colors">Affiliate Disclosure</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-gray-400 hover:text-white transition-colors">Financial Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Product</h3>
            <ul className="space-y-4">
              <li><Link to="/app" className="text-sm text-[#5da08c] font-semibold hover:text-[#4d8675] transition-colors">Open Renocred App</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p>&copy; {year} Renocred. All rights reserved.</p>
          <p className="max-w-2xl text-left md:text-right">Renocred provides informational and analytical tools. We are not acting as a financial advisor. Recommendations and comparisons do not guarantee outcomes. Credit card terms and eligibility can change. Users should verify product details with the official issuer.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center">
      <SEO 
        title="Renocred | Credit Card Optimizer & Recommendation Engine India"
        description="Renocred helps you understand your cards, compare benefits, and optimize credit card spending in India."
        canonicalUrl="https://renocred.com/"
      />
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-5xl font-display font-bold mb-6 tracking-tight">Make every credit card work harder for you.</h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Renocred helps you understand your cards, compare benefits, optimize spending, and make smarter credit decisions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/app" className="bg-[#5da08c] hover:bg-[#4d8675] text-white text-base font-semibold py-3 px-8 rounded-xl transition-all">
            Open Renocred
          </Link>
          <Link to="/methodology" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-base font-semibold py-3 px-8 rounded-xl transition-all">
            Learn How We Evaluate Cards
          </Link>
        </div>
      </section>

      {/* Core Value */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold mb-4">Understand Your Wallet</h3>
            <p className="text-gray-400">See your cards, limits, rewards, and utilization in one place.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Optimize Every Spend</h3>
            <p className="text-gray-400">Understand which card may provide better value for different spending categories.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Make Better Card Decisions</h3>
            <p className="text-gray-400">Compare cards and evaluate options using structured financial information.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 bg-white/[0.02] rounded-3xl mb-20 text-center">
        <h2 className="text-3xl font-bold mb-12">How Renocred Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-3xl mx-auto">
          <div className="flex-1">
            <div className="w-12 h-12 bg-[#5da08c]/20 text-[#5da08c] rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
            <h4 className="font-semibold mb-2">Add your cards</h4>
          </div>
          <div className="w-px h-8 md:w-8 md:h-px bg-white/10 hidden md:block"></div>
          <div className="flex-1">
            <div className="w-12 h-12 bg-[#5da08c]/20 text-[#5da08c] rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
            <h4 className="font-semibold mb-2">Understand your wallet</h4>
          </div>
          <div className="w-px h-8 md:w-8 md:h-px bg-white/10 hidden md:block"></div>
          <div className="flex-1">
            <div className="w-12 h-12 bg-[#5da08c]/20 text-[#5da08c] rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
            <h4 className="font-semibold mb-2">Optimize your decisions</h4>
          </div>
        </div>
      </section>

      {/* Responsible Recommendations */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center mb-20">
        <h2 className="text-2xl font-bold mb-4">Responsible Recommendations</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
          Renocred aims to provide structured information and tools to help you make informed decisions. We do not replace personal financial judgment.
        </p>
        <Link to="/methodology" className="text-[#5da08c] hover:underline font-medium">Read our evaluation methodology &rarr;</Link>
      </section>
    </div>
  );
}

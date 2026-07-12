import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
      <SEO 
        title="Page Not Found | Renocred"
        description="The page you are looking for does not exist."
        canonicalUrl="https://renocred.com/404"
        robotsDirective="noindex, nofollow"
      />
      <h1 className="text-8xl font-display font-bold text-[#5da08c] mb-4">404</h1>
      <h2 className="text-3xl font-bold text-white mb-6">Page Not Found</h2>
      <p className="text-gray-400 mb-10 max-w-md mx-auto">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/" className="bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-xl border border-white/10 transition-all">
          Go Home
        </Link>
        <Link to="/app" className="bg-[#5da08c] hover:bg-[#4d8675] text-white font-semibold py-3 px-8 rounded-xl shadow-ag-glow-primary transition-all">
          Open Renocred App
        </Link>
      </div>
    </div>
  );
}

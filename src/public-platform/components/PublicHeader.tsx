import { Link } from 'react-router-dom';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0f1115]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-display font-bold text-white tracking-tight focus:outline-none focus:ring-2 focus:ring-[#5da08c] rounded-md px-1">
          renocred
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors focus:outline-none focus:underline">Home</Link>
          <Link to="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors focus:outline-none focus:underline">About</Link>
          <Link to="/methodology" className="text-sm font-medium text-gray-300 hover:text-white transition-colors focus:outline-none focus:underline">Methodology</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/app" className="bg-[#5da08c] hover:bg-[#4d8675] text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-white">
            Open App
          </Link>
        </div>
      </div>
    </header>
  );
}

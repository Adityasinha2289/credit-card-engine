import { useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Check if they are signed in and have the admin role in their public metadata
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const isDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true';

  // Demo mode does not grant admin access by default unless explicitly mocking it for development
  const isLocalDevMock = isDemo && localStorage.getItem('MOCK_ADMIN') === 'true';

  if (!isSignedIn || (!isAdmin && !isLocalDevMock)) {
    // Not authorized, redirect to home
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

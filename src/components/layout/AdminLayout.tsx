import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { 
  LayoutDashboard, 
  Store, 
  Tags, 
  Building2, 
  LogOut,
  ShieldCheck,
  Network
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { path: '/admin/partners', label: 'Partners', icon: Building2 },
  { path: '/admin/entities', label: 'Commerce Entities', icon: Store },
  { path: '/admin/offers', label: 'Offers', icon: Tags },
  { path: '/admin/affiliate', label: 'Affiliate Routing', icon: Network },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex h-[100dvh] w-full bg-[#0a0a0a] text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0a0a0a] flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold tracking-wide uppercase text-sm">RenoCred Admin</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-medium">{user?.firstName?.[0] || 'A'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName || 'Admin User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        {/* Mobile Header (minimal) */}
        <header className="md:hidden h-16 border-b border-slate-800 flex items-center px-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold uppercase text-sm">RC Admin</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

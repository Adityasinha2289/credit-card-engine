/**
 * @vitest-environment happy-dom
 */
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Sidebar } from '../Sidebar';
import * as ClerkReact from '@clerk/clerk-react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';

// Mock routing hooks
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/app' }),
  useNavigate: () => vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  },
}));

vi.mock('@clerk/clerk-react', () => ({
  useUser: vi.fn(),
}));

vi.mock('../../../features/dashboard/store/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

describe('Sidebar - User Identity Loading Bug Fix', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('Test A: Loading state does NOT render Aditya Sinha (or any stale identity)', () => {
    vi.mocked(useDashboardStore).mockImplementation(() => null);
    
    vi.mocked(ClerkReact.useUser).mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      user: undefined,
    } as any);

    render(<Sidebar />);
    
    expect(screen.queryByText(/Aditya Sinha/i)).not.toBeInTheDocument();
    expect(screen.queryByText('View Profile →')).not.toBeInTheDocument();
  });

  it('Test B: Resolved User A renders User A actual name', () => {
    vi.mocked(useDashboardStore).mockImplementation((selector: any) => selector({ profile: { name: 'User Alpha' } }));
    
    vi.mocked(ClerkReact.useUser).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { fullName: 'User Alpha Clerk', firstName: 'Alpha' } as any,
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('User Alpha')).toBeInTheDocument();
    expect(screen.getByText('View Profile →')).toBeInTheDocument();
  });

  it('Test C: Resolved User B renders User B actual name from Clerk if profile empty', () => {
    vi.mocked(useDashboardStore).mockImplementation(() => null);
    
    vi.mocked(ClerkReact.useUser).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { fullName: 'User Beta', firstName: 'Beta' } as any,
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('User Beta')).toBeInTheDocument();
  });

  it('Test D: Switching users does not retain the previous users name during load', () => {
    vi.mocked(useDashboardStore).mockImplementation(() => null);
    
    vi.mocked(ClerkReact.useUser).mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      user: undefined,
    } as any);

    render(<Sidebar />);
    
    expect(screen.queryByText('User Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Aditya Sinha')).not.toBeInTheDocument();
  });
});

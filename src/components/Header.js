import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from './auth/LoginButton';
import UserProfile from './auth/UserProfile';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <header className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200 sticky top-0 z-50 dark:supports-[backdrop-filter]:bg-slate-900/70 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-slate-900 dark:text-white">
              <img
                src="/sessionbase-logo.png"
                alt="SessionBase Logo"
                className="w-10 h-10"
              />
              <span>SessionBase</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/discover" className="text-slate-700 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:text-white">
              Discover
            </Link>
            {isAuthenticated && (
              <Link href="/sessions" className="text-slate-700 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:text-white">
                My Sessions
              </Link>
            )}
            <Link href="/teams" className="text-slate-700 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:text-white">
              Teams
            </Link>
            <a href="https://docs.sessionbase.ai" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:text-white">
              Docs
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Authentication */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {loading ? (
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse dark:bg-slate-700"></div>
            ) : isAuthenticated ? (
              <UserProfile />
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

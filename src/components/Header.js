import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from './auth/LoginButton';
import UserProfile from './auth/UserProfile';

export default function Header() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
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
            <Link href="/discover" className="text-gray-700 hover:text-gray-900 font-medium">
              Discover
            </Link>
            {isAuthenticated && (
              <Link href="/sessions" className="text-gray-700 hover:text-gray-900 font-medium">
                My Sessions
              </Link>
            )}
            <Link href="/teams" className="text-gray-500 hover:text-gray-700">
              Teams
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Authentication */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
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

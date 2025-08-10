import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="px-4">
        <div className="flex justify-between items-center h-14">
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo - Centered and Larger */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center">
              <img
                src="/sessionbase-logo.png"
                alt="SessionBase"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Empty div for balance */}
          <div className="w-9"></div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="pb-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link 
                href="/discover" 
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Discover
              </Link>
              <Link 
                href="/sessions" 
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                My Sessions
              </Link>
              <Link 
                href="/teams" 
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Teams
              </Link>
              <a 
                href="https://docs.sessionbase.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
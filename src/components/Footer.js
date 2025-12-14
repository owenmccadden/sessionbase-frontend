export default function Footer() {
  return (
    <footer className="footer-elegant bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-900 py-48 relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0">
        {/* Dot Matrix Pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="dot-matrix"></div>
        </div>
        
        {/* Ambient Glow */}
        <div className="absolute inset-0">
          <div className="ambient-glow"></div>
        </div>


        {/* Subtle CRT Effect */}
        <div className="absolute inset-0 opacity-10 dark:opacity-15">
          <div className="crt-lines"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Logo with breathing glow */}
          <div className="logo-container">
            <img 
              src="/sessionbase-logo.png" 
              alt="SessionBase" 
              className="mx-auto max-w-4xl w-full h-auto"
            />
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 flex justify-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
            <a 
              href="/privacy-policy" 
              className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a 
              href="/terms-of-service" 
              className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Terms of Service
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Built by{' '}
            <a
              href="https://www.owenmc.dev/about"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              Owen McCadden
            </a>{' '}
            with{' '}
            <a
              href="https://www.anuragd.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              Anurag Dhungana
            </a>{' '}
            maintaining.
          </p>
        </div>
      </div>
    </footer>
  );
}

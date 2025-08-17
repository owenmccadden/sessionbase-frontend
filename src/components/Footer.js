export default function Footer() {
  return (
    <footer className="footer-elegant bg-slate-100 dark:bg-slate-800 py-48 relative overflow-hidden">
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
        </div>
      </div>
    </footer>
  );
}
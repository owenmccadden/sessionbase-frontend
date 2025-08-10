export default function Footer() {
  return (
    <footer className="footer-animated bg-slate-100 dark:bg-slate-800 py-48 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-40">
          <div className="grid-animation"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`particle`}
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '0',
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Gradient Waves */}
        <div className="absolute inset-0 opacity-50">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="scanline"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Logo */}
          <div>
            <img 
              src="/sessionbase-logo.png" 
              alt="SessionBase" 
              className="mx-auto max-w-4xl w-full h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
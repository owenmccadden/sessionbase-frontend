import { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

export default function MobileBanner() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Monitor className="h-16 w-16 text-primary" />
              <Smartphone className="h-8 w-8 text-primary/60 absolute -bottom-2 -right-2" />
            </div>
          </div>
          <img
            src="/sessionbase-logo.png"
            alt="SessionBase"
            className="h-12 mx-auto mb-6"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Better on Desktop
        </h1>
        
        <p className="text-slate-300 mb-8 leading-relaxed">
          SessionBase is optimized for desktop browsers to provide the best experience for viewing and managing AI chat sessions. You can also use our CLI tool to push sessions directly from your terminal.
        </p>
        
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-left">
            <h3 className="text-white font-medium mb-2">Please visit us on:</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Desktop computer</li>
              <li>• Laptop</li>
              <li>• Tablet in landscape mode</li>
            </ul>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              📱 <strong>Mobile coming later!</strong> We're focusing on desktop first, but will add mobile support if there's enough interest from the community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
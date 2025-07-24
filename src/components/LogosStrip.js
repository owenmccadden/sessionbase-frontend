import Image from 'next/image';

export default function LogosStrip() {
  const logos = [
    { 
      name: "Q Chat", 
      src: "/q-logo.png",
      width: 140, 
      height: 40,
      description: "Amazon Q",
      status: "Available", 
      gradient: "from-orange-500 to-red-600"
    },
    { 
      name: "Claude Code", 
      src: "/claude-logo.png",
      width: 120, 
      height: 40,
      description: "Anthropic",
      status: "Available",
      gradient: "from-purple-500 to-indigo-600"
    },
    { 
      name: "Gemini CLI", 
      src: "/gemini-cli-logo.png",
      width: 130, 
      height: 40,
      description: "Google",
      status: "Available", 
      gradient: "from-blue-500 to-green-600"
    },
  ];


  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Connect Your Favorite Coding Agents</h2>
        </div>
        
        <div className="flex justify-center items-center space-x-16 lg:space-x-24">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="group flex flex-col items-center space-y-3 transition-all duration-300 hover:scale-105"
            >
              <div className="relative bg-white rounded-xl p-6 shadow-lg border border-slate-100 group-hover:shadow-xl transition-all duration-300">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="object-contain transition-all duration-300"
                />
              </div>
              <div className="text-center">
                <p className="text-slate-700 font-medium text-sm">{logo.name}</p>
                <p className="text-slate-500 text-xs mt-1">{logo.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            More platforms coming soon... or{' '}
            <a 
              href="https://github.com/sessionbase/cli" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              <span>submit a PR!</span>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
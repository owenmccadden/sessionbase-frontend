import Image from 'next/image';

export default function LogosStrip() {
  const logos = [
    { 
      name: "Q Chat", 
      src: "/q-logo.png",
      width: 210, 
      height: 60,
      description: "Amazon Q",
      status: "Available", 
      gradient: "from-orange-500 to-red-600",
      url: "https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html"
    },
    { 
      name: "Claude Code", 
      src: "/claude-logo.png",
      width: 180, 
      height: 60,
      description: "Anthropic",
      status: "Available",
      gradient: "from-purple-500 to-indigo-600",
      url: "https://docs.anthropic.com/en/docs/claude-code/quickstart"
    },
    { 
      name: "Gemini CLI", 
      src: "/gemini-cli-logo.png",
      width: 195, 
      height: 60,
      description: "Google",
      status: "Available", 
      gradient: "from-blue-500 to-green-600",
      url: "https://github.com/google-gemini/gemini-cli"
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
            <a
              key={logo.name}
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
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
            </a>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-4 rounded-2xl border border-blue-100">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-lg font-semibold text-slate-700">
              More platforms coming soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
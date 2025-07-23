import Image from 'next/image';

export default function LogosStrip() {
  const logos = [
    { 
      name: "Claude Code", 
      src: "/claude-logo.png",
      width: 120, 
      height: 40,
      description: "Anthropic"
    },
    { 
      name: "Q Chat", 
      src: "/q-logo.png",
      width: 140, 
      height: 40,
      description: "Amazon Q"
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-slate-600 font-medium text-lg mb-2">Supported AI Platforms</p>
          <p className="text-slate-500 text-sm">Connect and capture sessions from your favorite AI coding assistants</p>
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
          <p className="text-slate-400 text-sm">More platforms coming soon...</p>
        </div>
      </div>
    </section>
  );
}
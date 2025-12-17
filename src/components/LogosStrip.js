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
    { 
      name: "OpenAI Codex", 
      src: "/openai-logo-dark.png",
      srcDark: "/openai-logo-light.png",
      width: 220, 
      height: 80,
      description: "OpenAI",
      status: "Available", 
      gradient: "from-green-500 to-teal-600",
      url: "https://openai.com/codex/"
    },
  ];


  return (
    <section className="py-12 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Connect your favorite coding agents
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {logos.map((logo) => (
            <a
              key={logo.name}
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/80"
            >
              <div className="relative flex h-14 items-center justify-center">
                {logo.srcDark ? (
                  <>
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className="object-contain max-h-12 dark:hidden"
                    />
                    <Image
                      src={logo.srcDark}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className="object-contain max-h-12 hidden dark:block"
                    />
                  </>
                ) : (
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={logo.width}
                    height={logo.height}
                    className="object-contain max-h-12"
                  />
                )}
              </div>
              <div className="text-center">
                <p className="text-slate-800 font-medium text-sm dark:text-slate-100">
                  {logo.name}
                </p>
                <p className="text-slate-500 text-xs dark:text-slate-400">
                  {logo.description}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            More platforms coming soon
          </div>
        </div>
      </div>
    </section>
  );
}
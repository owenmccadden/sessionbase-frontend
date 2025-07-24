export default function HowItWorks() {
  const steps = [
    {
      title: "Capture",
      description: "Use platform-specific commands to save your coding session to a file.",
      command: "/save session.json",
      docsLink: "https://docs.sessionbase.ai",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Upload",
      description: "Upload your session file to the cloud with full-text search and intelligent tagging.",
      command: "sessionbase upload session.json",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      title: "Share",
      description: "Generate shareable links for your sessions to include in documentation, PRs, or team discussions.",
      shareUrl: "sessionbase.ai/sessions/f47ac10b-58cc-4372-a567-0e02b2c3d479",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-slate-900 mb-4">How it works</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Three simple steps to preserve and share your AI coding sessions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:items-stretch">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center relative flex">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group flex flex-col flex-1">
                <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300" style={{color: '#7B5FFF'}}>{step.icon}</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6 flex-1">
                  {step.description}
                  {step.docsLink && (
                    <>
                      {' '}
                      <a 
                        href={step.docsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                        style={{color: '#7B5FFF'}}
                      >
                        See docs
                      </a>
                    </>
                  )}
                </p>
                <div className="mt-auto">
                  {step.command && (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                      <code className="text-slate-100 text-sm block" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                        <span className="text-slate-400 mr-2">{step.command.startsWith('/') ? '>' : '$'}</span>
                        {step.command}
                      </code>
                    </div>
                  )}
                  {step.shareUrl && (
                    <div className="rounded-lg p-3" style={{backgroundColor: '#7B5FFF10', borderColor: '#7B5FFF30', borderWidth: '1px'}}>
                      <code className="text-sm block" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace', color: '#7B5FFF'}}>
                        {step.shareUrl}
                      </code>
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <div className="rounded-full p-2" style={{backgroundColor: '#7B5FFF20'}}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#7B5FFF'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
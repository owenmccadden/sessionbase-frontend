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
        {/* Pull Behavior Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-semibold text-slate-900 mb-4">Continue Anywhere, Collaborate Everywhere</h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Start a session on one machine, pull it on another, or share with teammates for true collaborative AI coding
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#7B5FFF'}}>
                  <span className="text-white font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Push from Laptop</h4>
                  <p className="text-slate-600">Start debugging an API integration on your laptop. Push the session with context and progress.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#7B5FFF'}}>
                  <span className="text-white font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Pull on Remote Host</h4>
                  <p className="text-slate-600">Later, pull the same session on your development server or workstation. Pick up exactly where you left off.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#7B5FFF'}}>
                  <span className="text-white font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Share & Fork</h4>
                  <p className="text-slate-600">Share a session link with teammates. They can view it in the browser, fork it to their own workspace, or pull it directly to their machine.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400">$ </span>
                    <span className="text-slate-100">sessionbase push --claude</span>
                  </div>
                  <div className="text-green-400 text-sm ml-4">
                    ✓ Pushed as <span className="text-purple-400">sb_7k9m2x</span>
                  </div>
                  
                  <div className="pt-3">
                    <span className="text-slate-400">$ </span>
                    <span className="text-slate-100">sessionbase pull sb_7k9m2x</span>
                  </div>
                  <div className="text-green-400 text-sm ml-4">
                    ✓ Session restored
                  </div>

                  <div className="pt-3">
                    <span className="text-slate-400"># </span>
                    <span className="text-slate-300">Share link: sessionbase.ai/sessions/7k9m2x</span>
                  </div>
                  <div className="text-slate-400 text-sm ml-4">
                    View in browser → Fork to local workspace
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
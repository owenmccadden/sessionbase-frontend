export default function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 via-indigo-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Seamless AI Collaboration
          </h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Start coding conversations on one device, continue them on another, 
            and share AI-powered sessions with your entire team
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="group hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start space-x-6 bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/60 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">Push & Preserve Context</h3>
                  <p className="text-slate-700 leading-relaxed text-base">
                    Push your entire session from Claude Code, complete with file context, 
                    code changes, and tool use.
                  </p>
                </div>
              </div>
            </div>

            <div className="group hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start space-x-6 bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/60 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">Pull Anywhere</h3>
                  <p className="text-slate-700 leading-relaxed text-base">
                    Switch to your workstation, jump on a remote server, or move to a different project. 
                    Pull your session and continue exactly where you left off.
                  </p>
                </div>
              </div>
            </div>

            <div className="group hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start space-x-6 bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/60 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors duration-300">Collaborate & Share</h3>
                  <p className="text-slate-700 leading-relaxed text-base">
                    Share session links with teammates for code reviews, onboarding, or documentation.
                    They can view in browser, fork to their workspace, or pull directly to their machine.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-cyan-200/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-slate-400 text-sm font-mono">collaborative-session</div>
                </div>
              </div>
              
              <div className="p-6 space-y-4 text-sm" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400">alice@laptop</span>
                    <span className="text-slate-400">$</span>
                    <span className="text-slate-100">sessionbase push --claude</span>
                  </div>
                  <div className="text-emerald-400 ml-6">
                    <span>✓ Pushed as <span className="text-cyan-400 font-semibold">7k9m2x</span></span>
                  </div>
                  
                  <div className="bg-slate-800 rounded-lg p-3 mt-4">
                    <div className="mb-1">
                      <span className="text-slate-300 text-xs">Share with team</span>
                      <span className="text-cyan-400 text-sm ml-2">sessionbase.ai/sessions/7k9m2x</span>
                    </div>
                    <div className="text-slate-400 text-xs">
                      View in browser • Fork to workspace • Pull to local
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-400">bob@server</span>
                    <span className="text-slate-400">$</span>
                    <span className="text-slate-100">sessionbase pull 7k9m2x</span>
                  </div>
                  <div className="text-emerald-400 ml-6">
                    <span>✓ Session restored</span>
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
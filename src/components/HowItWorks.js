export default function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 dark:text-white">
            Share context. Pick up anywhere.
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed dark:text-slate-300">
            Capture your AI coding session once and move seamlessly between tools, devices, and teammates without losing context.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Steps */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="group transition-all duration-300">
              <div className="flex items-start gap-5 bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all dark:bg-slate-900 dark:border-slate-800">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center shadow-md">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 dark:text-white">Push in one command</h3>
                  <p className="text-slate-600 text-base leading-relaxed dark:text-slate-300">
                    Send the full conversation, file context, and tool actions from your coding agent with a single command.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group transition-all duration-300">
              <div className="flex items-start gap-5 bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all dark:bg-slate-900 dark:border-slate-800">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center shadow-md">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 dark:text-white">Share a session link</h3>
                  <p className="text-slate-600 text-base leading-relaxed dark:text-slate-300">
                    Review in the browser, drop a link in chat, or embed in docs. Your team sees exactly what the agent saw.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group transition-all duration-300">
              <div className="flex items-start gap-5 bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all dark:bg-slate-900 dark:border-slate-800">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center shadow-md">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 dark:text-white">Pull and continue anywhere</h3>
                  <p className="text-slate-600 text-base leading-relaxed dark:text-slate-300">
                    Resume the session on a different machine, server, or editor and keep working without re‑prompting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual flow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-slate-100/20 rounded-2xl blur-xl dark:from-slate-800/30 dark:to-slate-700/20"></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 text-sm" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                {/* Push */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-primary dark:text-primary-light">you@laptop</span>
                    <span className="text-slate-600 dark:text-slate-400">$</span>
                    <span className="text-slate-900 dark:text-slate-100">sessionbase push --claude</span>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 ml-6">
                    ✓ Pushed as <span className="text-primary dark:text-primary-light font-semibold">7k9m2x</span>
                  </div>
                </div>

                {/* Share */}
                <div className="bg-slate-100 dark:bg-slate-800/70 rounded-lg p-4 border border-slate-300 dark:border-slate-700">
                  <div className="text-slate-700 dark:text-slate-300 text-xs mb-2">Share link</div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-primary-dark dark:text-primary-light truncate">sessionbase.ai/sessions/7k9m2x</div>
                    <div className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700/70">View</span>
                      <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700/70">Fork</span>
                      <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700/70">Pull</span>
                    </div>
                  </div>
                </div>

                {/* Pull */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-primary dark:text-primary-light">teammate@server</span>
                    <span className="text-slate-600 dark:text-slate-400">$</span>
                    <span className="text-slate-900 dark:text-slate-100">sessionbase pull 7k9m2x</span>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 ml-6">✓ Session restored</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
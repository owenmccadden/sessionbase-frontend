export default function NaturalLanguageSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Just Ask Your AI Agent
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                With our Model Context Protocol (MCP) server, uploading sessions is as simple as asking. 
                No commands to remember, no workflow interruption.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#7B5FFF'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Natural Language Commands</h3>
                  <p className="text-slate-600">
                    "Push this session to SessionBase" or "Save this conversation for my team" - your AI agent understands and handles the rest.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#7B5FFF'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Zero Friction Integration</h3>
                  <p className="text-slate-600">
                    Seamlessly integrated into Claude Code, Gemini CLI, and Amazon Q Chat. No switching contexts, no breaking flow.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#7B5FFF'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Metadata</h3>
                  <p className="text-slate-600">
                    Automatically extracts titles, tags, and summaries from your conversations for easy discovery and organization.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a 
                href="https://docs.sessionbase.ai/mcp-server/installation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white hover:opacity-90 transition-opacity"
                style={{backgroundColor: '#7B5FFF'}}
              >
                Install MCP Server
                <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right side - Chat Demo */}
          <div>
            <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-slate-800 p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm font-medium text-slate-300">Claude Code</div>
                  </div>
                  <div className="text-xs text-slate-500">Session active</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-6 bg-slate-900">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-medium text-white">You</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-700 text-slate-100 rounded-lg px-4 py-3">
                      <p className="text-sm">I need help debugging this OAuth flow. The tokens keep expiring unexpectedly.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-medium text-white">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-800 text-slate-100 rounded-lg px-4 py-3 border border-slate-700">
                      <p className="text-sm">I'll help you debug the OAuth token expiration issue. Let me examine your authentication flow...</p>
                      <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-600">
                        <code className="text-xs text-green-400 font-mono">
                          # Checking token refresh mechanism<br/>
                          # Found potential race condition in refresh logic
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-1">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-medium text-white">You</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-700 text-slate-100 rounded-lg px-4 py-3">
                      <p className="text-sm">Great! Save this to SessionBase for my team</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-medium text-white">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-green-900 text-green-100 rounded-lg px-4 py-3 border border-green-800">
                      <p className="text-sm">✅ Session saved to SessionBase successfully!</p>
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="text-green-300">
                          <span className="text-green-200">Title:</span> <span className="font-mono">OAuth Token Expiration Debug Session</span>
                        </div>
                        <div className="text-green-300">
                          <span className="text-green-200">Tags:</span> <span className="font-mono">oauth, authentication, debugging, tokens</span>
                        </div>
                        <div className="text-green-300">
                          <span className="text-green-200">Summary:</span> <span className="font-mono">Debugged OAuth token expiration issue, identified race condition in refresh logic</span>
                        </div>
                        <div className="border-t border-green-800 pt-2 mt-2">
                          <div className="text-green-300">
                            <span className="text-green-200">ID:</span> <span className="font-mono">sb_oauth_debug</span>
                          </div>
                          <div className="text-green-300">
                            <span className="text-green-200">Link:</span> <span className="font-mono">sessionbase.ai/sessions/oauth_debug</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
import { useState, useEffect } from 'react';
import { Share, Bot } from 'lucide-react';

export default function McpIntegration() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const platforms = [
    {
      name: 'Claude Code',
      logo: '/claude-logo.png',
      hasBox: true,
      conversation: [
        'Claude: I\'ve helped you implement the authentication system.',
        'The middleware is now properly handling JWT tokens.'
      ],
      input: 'Push this to SessionBase with tags "auth, jwt, implemented"',
      response: 'I\'ll push this session to SessionBase for you.',
      toolUse: {
        type: 'claude',
        content: {
          header: '⏺ sessionbase - push_session (MCP)',
          title: 'Tool use',
          details: [
            'sessionbase - push_session',
            'title: "JWT Auth Implementation"',
            'tags: "auth,jwt,middleware"'
          ],
          question: 'Do you want to proceed?',
          options: [
            '❯ 1. Yes',
            '  2. Yes, and don\'t ask again',
            '  3. No (esc)'
          ]
        }
      },
      success: '✓ Session pushed as m9k2x7'
    },
    {
      name: 'Gemini CLI',
      logo: '/gemini-cli-logo.png', 
      hasBox: true,
      conversation: [
        'Gemini: Your database migration script is working correctly.',
        'All foreign key constraints have been properly set up.'
      ],
      input: 'Share this session as "Database Migration Complete"',
      response: '✦ I can do that. I will push the current session to SessionBase.',
      toolUse: {
        type: 'gemini',
        content: {
          title: 'push_session (sessionbase MCP)',
          details: [
            'title: "Database Migration"',
            'tags: "database,migration,sql"'
          ],
          server: 'MCP Server: sessionbase',
          tool: 'Tool: push_session',
          question: 'Allow execution?',
          options: [
            '● Yes, allow once',
            '○ Yes, always allow',
            '○ No (esc)'
          ],
          footer: '⠏ Waiting for user confirmation...'
        }
      },
      success: '✓ Session shared as r5p8q1'
    },
    {
      name: 'Amazon Q Chat',
      logo: '/q-logo.png',
      hasBox: false,
      conversation: [
        'Q: I\'ve optimized your React components for better performance.',
        'The memoization changes should reduce unnecessary re-renders.'
      ],
      input: 'Upload to SessionBase with tags "react, performance, optimization"',
      response: 'I\'ll upload this session to SessionBase for you.',
      toolUse: {
        type: 'qchat',
        content: {
          header: '🛠️  Using tool: push_session from mcp server sessionbase',
          action: '● Running push_session with the param:',
          json: {
            name: "push_session",
            arguments: {
              qchat: true,
              title: "React Performance Optimization",
              tags: "react,performance,optimization,memoization",
              summary: "Session covering React component optimization"
            }
          },
          prompt: 'Allow this action? Use \'t\' to trust (always allow) this tool for the session. [y/n/t]:'
        }
      },
      success: '✓ Uploaded as b3n7k9'
    },
    {
      name: 'OpenAI Codex',
      logo: '/openai-logo-dark.png',
      logoLight: '/openai-logo-light.png',
      hasBox: true,
      conversation: [
        'Codex: I\'ve helped you implement the user authentication system.',
        'The JWT middleware is working correctly now.'
      ],
      input: 'push to sessionbase',
      response: 'Pushing this session to SessionBase with a clear title, tags, and summary.',
      toolUse: {
        type: 'codex',
        content: {
          header: 'tool running...',
          details: [
            'sessionbase.push_session({"codex":true,"title":"JWT Auth Implementation","tags":"auth,jwt,middleware","summary":"Implemented user authentication system with JWT middleware"})',
            '',
            'tool success, duration: 1.2s'
          ]
        }
      },
      success: 'Session ID: 1a3dd9'
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % platforms.length);
    }, 16000);

    return () => clearInterval(interval);
  }, [platforms.length]);

  const currentPlatform = platforms[activeIndex];

  return (
    <section className="py-24 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 dark:text-white">
            Share sessions with natural language
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed dark:text-slate-300">
            Tell Claude, Gemini, Q Chat, or Codex to push your session to SessionBase.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Terminal carousel */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-slate-100/20 rounded-2xl blur-xl dark:from-slate-800/30 dark:to-slate-700/20"></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{currentPlatform.name}</div>
                </div>
              </div>
              
              <div className="p-6 text-sm" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                {/* Conversation history */}
                <div className="space-y-2 mb-6 text-slate-600 dark:text-slate-300">
                  {currentPlatform.conversation.map((line, idx) => (
                    <div key={idx} className="text-blue-600 dark:text-blue-400">{line}</div>
                  ))}
                </div>
                
                {/* User input */}
                {currentPlatform.hasBox ? (
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-3 mb-4">
                    <div className="text-slate-900 dark:text-slate-100">
                      {currentPlatform.name === 'OpenAI Codex' ? (
                        <>
                          <span className="text-blue-400">▌</span>{currentPlatform.input}
                        </>
                      ) : (
                        <>&gt; {currentPlatform.input}</>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-slate-900 dark:text-slate-100">
                      &gt; {currentPlatform.input}
                    </div>
                  </div>
                )}
                
                {/* Response */}
                <div className="space-y-2 mb-4">
                  <div className="text-slate-600 dark:text-slate-300">
                    {currentPlatform.name === 'OpenAI Codex' ? (
                      <>&gt; {currentPlatform.response}</>
                    ) : (
                      currentPlatform.response
                    )}
                  </div>
                </div>
                
                {/* Tool use confirmation */}
                <div className="mb-4">
                  {currentPlatform.toolUse.type === 'claude' && (
                    <div className="text-xs">
                      <div className="text-slate-500 dark:text-slate-400 mb-2">{currentPlatform.toolUse.content.header}</div>
                      <div className="border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="text-slate-700 dark:text-slate-300 font-medium mb-2">{currentPlatform.toolUse.content.title}</div>
                        <div className="space-y-1 mb-3">
                          {currentPlatform.toolUse.content.details.map((detail, idx) => (
                            <div key={idx} className="text-slate-600 dark:text-slate-400 text-xs">{detail}</div>
                          ))}
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 mb-2">{currentPlatform.toolUse.content.question}</div>
                        <div className="space-y-1">
                          {currentPlatform.toolUse.content.options.map((option, idx) => (
                            <div key={idx} className="text-slate-600 dark:text-slate-400 text-xs">{option}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentPlatform.toolUse.type === 'gemini' && (
                    <div className="text-xs">
                      <div className="border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800 p-3">
                        <div className="text-slate-700 dark:text-slate-300 font-medium mb-2">{currentPlatform.toolUse.content.title}</div>
                        <div className="space-y-1 mb-2">
                          {currentPlatform.toolUse.content.details.map((detail, idx) => (
                            <div key={idx} className="text-slate-600 dark:text-slate-400">{detail}</div>
                          ))}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 mb-1">{currentPlatform.toolUse.content.server}</div>
                        <div className="text-slate-600 dark:text-slate-400 mb-3">{currentPlatform.toolUse.content.tool}</div>
                        <div className="text-slate-700 dark:text-slate-300 mb-2">{currentPlatform.toolUse.content.question}</div>
                        <div className="space-y-1 mb-2">
                          {currentPlatform.toolUse.content.options.map((option, idx) => (
                            <div key={idx} className="text-slate-600 dark:text-slate-400">{option}</div>
                          ))}
                        </div>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 mt-2">{currentPlatform.toolUse.content.footer}</div>
                    </div>
                  )}
                  
                  {currentPlatform.toolUse.type === 'qchat' && (
                    <div className="text-xs space-y-2">
                      <div className="text-slate-500 dark:text-slate-400">{currentPlatform.toolUse.content.header}</div>
                      <div className="text-slate-500 dark:text-slate-400">{currentPlatform.toolUse.content.action}</div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded p-3 border border-slate-200 dark:border-slate-600">
                        <pre className="text-slate-700 dark:text-slate-300 text-xs overflow-auto">
                          {JSON.stringify(currentPlatform.toolUse.content.json, null, 2)}
                        </pre>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">{currentPlatform.toolUse.content.prompt}</div>
                    </div>
                  )}
                  
                  {currentPlatform.toolUse.type === 'codex' && (
                    <div className="text-xs space-y-2">
                      <div className="space-y-2">
                        {currentPlatform.toolUse.content.details.map((detail, idx) => (
                          <div key={idx} className={`${detail === '' ? 'h-1' : 'text-slate-600 dark:text-slate-400'}`}>
                            {detail.includes('tool success') ? (
                              <>
                                tool <span className="text-green-600 dark:text-green-400">success</span>, duration: 1.2s
                              </>
                            ) : (
                              detail
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Final success */}
                <div className="space-y-2">
                  <div className="text-green-600 dark:text-green-400 text-xs">{currentPlatform.success}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">https://sessionbase.ai/sessions/{currentPlatform.success.slice(-6)}</div>
                </div>
              </div>
            </div>
            
            {/* Platform logos with selection indicator */}
            <div className="flex justify-center mt-6 space-x-6">
              {platforms.map((platform, index) => (
                <button
                  key={platform.name}
                  onClick={() => setActiveIndex(index)}
                  className={`relative p-3 rounded-lg transition-all duration-300 ${
                    index === activeIndex 
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-blue-50 dark:bg-blue-900/30' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {platform.logoLight ? (
                    <>
                      <img className="h-12 w-12 rounded dark:hidden" src={platform.logo} alt={platform.name} />
                      <img className="h-12 w-12 rounded hidden dark:block" src={platform.logoLight} alt={platform.name} />
                    </>
                  ) : (
                    <img 
                      src={platform.logo} 
                      alt={platform.name} 
                      className="h-12 w-12 rounded"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Benefits */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4 dark:text-white">
                Just ask your AI to share
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Stay in your conversation and let natural language do the work.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                  <Share className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Share without interruption</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Upload your session directly from your AI chat without breaking your workflow or switching apps
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                  <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Auto-generated metadata</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Uploading via MCP automatically creates titles, tags, and descriptions based on your conversation context.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-0.5">
                  <span className="text-purple-600 dark:text-purple-400 font-mono text-sm font-semibold">/</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Custom slash commands</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Set up <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm">/upload</code> commands in Claude and Gemini for instant single-command sharing.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-2 space-y-3">
              <a 
                href="https://docs.sessionbase.ai/mcp-server/installation" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: 'var(--primary-dark)',
                  '--tw-bg-opacity': '1'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
              >
                Get started in minutes
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <div>
                <a 
                  href="https://docs.sessionbase.ai/cli/usage" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium rounded-lg transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Prefer to use the CLI
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
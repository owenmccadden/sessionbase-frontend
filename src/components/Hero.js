import { useState } from 'react';
import WaitlistForm from './WaitlistForm';
import DynamicSessionViewer from './DynamicSessionViewer';

export default function Hero({ onShowAuth }) {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm i -g @sessionbase/cli');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="min-h-screen gradient-hero relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-semibold text-slate-900 leading-tight dark:text-white">
                Save & share your AI coding sessions.
              </h1>
              <p className="text-2xl text-slate-600 leading-relaxed dark:text-slate-200">
                SessionBase helps you capture, organize, and share coding agent sessions across platforms, helping you and your dev team preserve valuable context.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://docs.sessionbase.ai/mcp-server/installation"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary transition-colors shadow-lg text-center"
              >
                Get Started — MCP Server
              </a>
              <a
                href="https://docs.sessionbase.ai/cli/installation"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-slate-300 text-slate-800 px-8 py-4 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-center dark:border-white/30 dark:text-white dark:hover:bg-white/10"
              >
                CLI Installation
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Animated Code Block */}
            <div className="bg-white rounded-xl p-6 shadow-2xl border border-slate-200 relative dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="flex-1"></div>
                <button
                  onClick={copyToClipboard}
                  className="text-slate-500 hover:text-slate-800 transition-colors relative group dark:text-slate-400 dark:hover:text-white"
                  aria-label="Copy to clipboard"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  <span className="absolute -top-8 right-0 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
              <div className="text-slate-800 text-lg flex items-center dark:text-slate-100" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                <span className="text-slate-500 mr-2 dark:text-slate-400">$</span>
                <span>npm i -g @sessionbase/cli</span>
                <span className="w-2 h-5 bg-slate-400 inline-block ml-1 animate-pulse dark:bg-slate-300"></span>
              </div>
            </div>

            {/* Faux Browser Window */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="bg-slate-100 px-4 py-3 flex items-center space-x-2 dark:bg-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="flex-1 bg-white dark:bg-slate-900 rounded ml-4 px-3 py-1 text-sm text-slate-600 dark:text-slate-300">
                  sessionbase.ai/session/f47ac10b-58cc-4372-a567-0e02b2c3d479
                </div>
              </div>
              <DynamicSessionViewer />
            </div>
          </div>
        </div>
      </div>

      {showWaitlist && <WaitlistForm onClose={() => setShowWaitlist(false)} />}
    </section>
  );
}
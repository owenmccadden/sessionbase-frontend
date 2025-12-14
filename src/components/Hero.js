import { useState } from 'react';
import Image from 'next/image';
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

  const agents = [
    {
      name: "Q Chat",
      src: "/q-logo.png",
      width: 56,
      height: 16,
      url: "https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html"
    },
    {
      name: "Claude Code",
      src: "/claude-logo.png",
      width: 48,
      height: 16,
      url: "https://docs.anthropic.com/en/docs/claude-code/quickstart"
    },
    {
      name: "Gemini CLI",
      src: "/gemini-cli-logo.png",
      width: 52,
      height: 16,
      url: "https://github.com/google-gemini/gemini-cli"
    },
    {
      name: "OpenAI Codex",
      src: "/openai-logo-dark.png",
      srcDark: "/openai-logo-light.png",
      width: 58,
      height: 22,
      url: "https://openai.com/codex/"
    },
  ];

  return (
    <section className="min-h-screen gradient-hero relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto min-h-[80vh] justify-center space-y-10 lg:space-y-12">

          {/* 1. Works with badges - TOP */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Works with
            </span>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {agents.map((agent) => (
                <a
                  key={agent.name}
                  href={agent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity duration-200"
                  aria-label={agent.name}
                >
                  {agent.srcDark ? (
                    <>
                      <Image
                        src={agent.src}
                        alt={agent.name}
                        width={agent.width}
                        height={agent.height}
                        className="h-5 w-auto dark:hidden"
                      />
                      <Image
                        src={agent.srcDark}
                        alt={agent.name}
                        width={agent.width}
                        height={agent.height}
                        className="h-5 w-auto hidden dark:block"
                      />
                    </>
                  ) : (
                    <Image
                      src={agent.src}
                      alt={agent.name}
                      width={agent.width}
                      height={agent.height}
                      className="h-5 w-auto"
                    />
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* 2. Headline - LARGE */}
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-semibold text-slate-900 leading-[1.1] tracking-tight dark:text-white">
            Save & Share your AI Coding Sessions
          </h1>

          {/* 3. Subtitle - CONSTRAINED */}
          <p className="text-lg lg:text-xl text-slate-700 leading-relaxed dark:text-slate-300 max-w-2xl">
            Capture, organize, and share sessions across coding agent platforms, helping you and your dev team preserve valuable context.
          </p>

          {/* 4. CTAs - PROMINENT */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://docs.sessionbase.ai/mcp-server/installation"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary transition-all shadow-lg hover:shadow-xl text-center"
            >
              Get Started
            </a>
            <a
              href="https://docs.sessionbase.ai/cli/installation"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-slate-300 text-slate-800 px-8 py-4 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all text-center dark:border-slate-600 dark:text-white dark:hover:bg-slate-800"
            >
              CLI Installation
            </a>
          </div>

          {/* 5. npm command - ENHANCED */}
          <button
            onClick={copyToClipboard}
            className="max-w-xl w-full flex items-center justify-center gap-4 px-6 py-6 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 hover:bg-slate-100 hover:border-slate-300 active:bg-slate-200 shadow-lg hover:shadow-xl transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label="Copy install command"
            style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}
          >
            <span className="text-lg lg:text-xl font-medium">npm i -g @sessionbase/cli</span>
            {copied ? (
              <svg className="w-6 h-6 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          {/* 6. Browser mockup - CENTERED */}
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
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

      {showWaitlist && <WaitlistForm onClose={() => setShowWaitlist(false)} />}
    </section>
  );
}

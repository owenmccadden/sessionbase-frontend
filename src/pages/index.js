import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sessionId.trim()) {
      router.push(`/sessions/${sessionId.trim()}`);
    }
  };

  const handleExampleSession = () => {
    const exampleId = '63ecfc9f-4501-4201-96fb-24674bbc5906';
    router.push(`/sessions/${exampleId}`);
  };

  return (
    <>
      <Head>
        <title>SessionBase - Share, Fork & Discover AI Prompts</title>
        <meta name="description" content="The collaborative platform for developers to share, fork, and discover prompts and chat sessions from Claude Code, Q Chat, Gemini CLI, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">SessionBase</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Browse
                </button>
                <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Upload
                </button>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Sign in with GitHub
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Making AI Multiplayer
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Share, Fork & Discover
              <span className="block text-blue-600">AI Prompts</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Transform your isolated AI conversations into collaborative team knowledge.
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
              The collaborative platform for developers to share, fork, and discover prompts and chat sessions 
              from their favorite coding agents like Claude Code, Q Chat, and Gemini CLI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                Sign in with GitHub
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors">
                Start Exploring
              </button>
            </div>

            {/* Quick Session Lookup */}
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto mb-16">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Session Lookup
              </h3>
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter session ID to view..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!sessionId.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  View
                </button>
              </form>
              <button
                onClick={handleExampleSession}
                className="text-blue-600 hover:text-blue-700 text-sm mt-3 underline"
              >
                Try example session
              </button>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Making AI Multiplayer
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transform your isolated AI conversations into collaborative team knowledge. 
                SessionBase makes it easy to share your best prompts, learn from others, and build upon existing work.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Share Effortlessly</h3>
                <p className="text-gray-600">
                  Upload your chat sessions and prompts with one click. Automatic format detection supports 
                  Claude Code, Q Chat, Gemini CLI, and more.
                </p>
              </div>

              <div className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fork & Iterate</h3>
                <p className="text-gray-600">
                  Found a great prompt? Fork it and make it your own. Build upon the community's best work 
                  and create something even better.
                </p>
              </div>

              <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Discover Gems</h3>
                <p className="text-gray-600">
                  Browse curated collections, trending prompts, and discover techniques from top developers 
                  in the community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Tools */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Works with Your Favorite AI Tools
              </h2>
              <p className="text-xl text-gray-600">
                SessionBase supports sessions from all major coding AI assistants
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-bold text-gray-900 mb-2">Amazon Q Chat</h3>
                <p className="text-sm text-gray-600">Full support</p>
                <div className="mt-3 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Active
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="font-bold text-gray-900 mb-2">Claude Code</h3>
                <p className="text-sm text-gray-600">JSONL format</p>
                <div className="mt-3 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Active
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="font-bold text-gray-900 mb-2">Gemini CLI</h3>
                <p className="text-sm text-gray-600">Coming soon</p>
                <div className="mt-3 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Soon
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-bold text-gray-900 mb-2">Cursor</h3>
                <p className="text-sm text-gray-600">In development</p>
                <div className="mt-3 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Soon
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Get started in minutes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Session</h3>
                <p className="text-gray-600">
                  Drag and drop your chat session file or paste the session ID. We'll automatically detect the format.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Context & Tags</h3>
                <p className="text-gray-600">
                  Describe your prompt, add relevant tags, and help others understand when to use it.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share & Collaborate</h3>
                <p className="text-gray-600">
                  Your session is now discoverable. Others can fork it, improve it, and build amazing things.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Share Your Best Prompts?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join the community of developers building the future of AI-assisted coding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                Sign in with GitHub
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">SessionBase</h3>
                <p className="text-sm">
                  The collaborative platform for sharing AI prompts and chat sessions.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Browse Sessions</a></li>
                  <li><a href="#" className="hover:text-white">Upload</a></li>
                  <li><a href="#" className="hover:text-white">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Community</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Discord</a></li>
                  <li><a href="#" className="hover:text-white">GitHub</a></li>
                  <li><a href="#" className="hover:text-white">Twitter</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Documentation</a></li>
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
              <p>&copy; 2025 SessionBase. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

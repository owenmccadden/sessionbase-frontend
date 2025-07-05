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
    // Use the example session ID from your provided data
    const exampleId = '63ecfc9f-4501-4201-96fb-24674bbc5906';
    router.push(`/sessions/${exampleId}`);
  };

  return (
    <>
      <Head>
        <title>SessionBase - AI Chat Session Viewer</title>
        <meta name="description" content="View and analyze AI chat sessions from multiple tools like Q Chat, Claude Code, Cursor, and more" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                SessionBase
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Universal AI Chat Session Viewer
              </p>
              <p className="text-lg text-gray-500">
                Visualize and analyze chat sessions from multiple AI tools with a unified interface
              </p>
            </div>

            {/* Supported Formats */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Supported AI Tools</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-2">🤖</div>
                  <div className="font-medium text-gray-900">Amazon Q Chat</div>
                  <div className="text-sm text-gray-600">JSON Format</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-2">🧠</div>
                  <div className="font-medium text-gray-900">Claude Code</div>
                  <div className="text-sm text-gray-600">JSONL Format</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="font-medium text-gray-900">Cursor</div>
                  <div className="text-sm text-gray-600">Coming Soon</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-2">💎</div>
                  <div className="font-medium text-gray-900">Gemini CLI</div>
                  <div className="text-sm text-gray-600">Coming Soon</div>
                </div>
              </div>
            </div>

            {/* Session Input Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                View a Session
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
                    Session ID
                  </label>
                  <input
                    type="text"
                    id="sessionId"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="Enter session ID (e.g., 63ecfc9f-4501-4201-96fb-24674bbc5906)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!sessionId.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  View Session
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Don't have a session ID? Try the example:
                </p>
                <button
                  onClick={handleExampleSession}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                >
                  View Example Q Chat Session
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Auto-Detection
                </h3>
                <p className="text-gray-600 text-sm">
                  Automatically detects and parses different AI chat formats without manual configuration
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unified Interface
                </h3>
                <p className="text-gray-600 text-sm">
                  Single, consistent interface for viewing sessions from different AI tools
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rich Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  Detailed statistics, tool usage analysis, and timeline views for all session types
                </p>
              </div>
            </div>

            {/* Views */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Views</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="font-medium text-gray-900">Conversation</div>
                  <div className="text-sm text-gray-600">Message flow</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="font-medium text-gray-900">Timeline</div>
                  <div className="text-sm text-gray-600">Chronological view</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="font-medium text-gray-900">Tools</div>
                  <div className="text-sm text-gray-600">Tool usage analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-medium text-gray-900">Statistics</div>
                  <div className="text-sm text-gray-600">Session metrics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="font-medium text-gray-900">Raw Data</div>
                  <div className="text-sm text-gray-600">Original format</div>
                </div>
              </div>
            </div>

            {/* Environment Setup */}
            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔧 Setup Required
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                Make sure to set your <code className="bg-yellow-100 px-2 py-1 rounded">ENDPOINT_URL</code> environment variable:
              </p>
              <div className="bg-yellow-100 p-3 rounded font-mono text-sm text-yellow-800">
                NEXT_PUBLIC_ENDPOINT_URL=https://your-api-endpoint.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

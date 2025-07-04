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
        <title>Q Chat Session Viewer</title>
        <meta name="description" content="View and analyze Amazon Q chat sessions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Q Chat Session Viewer
              </h1>
              <p className="text-xl text-gray-600">
                Visualize and analyze Amazon Q chat sessions with detailed conversation flows
              </p>
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
                  View Example Session
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Conversation View
                </h3>
                <p className="text-gray-600 text-sm">
                  See the full conversation flow with user prompts, AI responses, and tool usage
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Transcript View
                </h3>
                <p className="text-gray-600 text-sm">
                  Clean, chronological transcript of the entire session
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl mb-3">🔧</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tool Analysis
                </h3>
                <p className="text-gray-600 text-sm">
                  Detailed view of tool usage, parameters, and execution results
                </p>
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

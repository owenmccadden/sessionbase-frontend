import { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from '../components/auth/LoginButton';
import UserProfile from '../components/auth/UserProfile';
import SessionCard from '../components/sessions/SessionCard';
import { mockSessions } from '../data/mockSessions';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [sortBy, setSortBy] = useState('votes'); // votes, newest, views
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const sortedSessions = [...mockSessions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'views':
        return b.views - a.views;
      case 'votes':
      default:
        return b.votes - a.votes;
    }
  });

  return (
    <>
      <Head>
        <title>SessionBase - AI Chat Sessions & Prompts</title>
        <meta name="description" content="Discover, share, and learn from AI chat sessions. Browse conversations with Claude, GPT-4, and other AI models." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">SessionBase</h1>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
                  Sessions
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Tags
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Users
                </a>
              </nav>

              {/* Search */}
              <div className="flex-1 max-w-lg mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Auth */}
              <div className="flex items-center space-x-4">
                {loading ? (
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                ) : isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <LoginButton />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Popular Tags</h3>
                <div className="space-y-2">
                  {[
                    { tag: 'react', count: 42 },
                    { tag: 'typescript', count: 38 },
                    { tag: 'aws', count: 35 },
                    { tag: 'nextjs', count: 29 },
                    { tag: 'postgresql', count: 24 },
                    { tag: 'git', count: 18 }
                  ].map(({ tag, count }) => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
                        {tag}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">AI Models</h3>
                <div className="space-y-2">
                  {[
                    { model: 'Claude 3.5 Sonnet', count: 28 },
                    { model: 'GPT-4', count: 22 },
                    { model: 'Gemini Pro', count: 15 }
                  ].map(({ model, count }) => (
                    <div key={model} className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">{model}</span>
                      <span className="text-gray-500 text-xs">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">All Sessions</h1>
                  <p className="text-gray-600 mt-1">
                    {mockSessions.length} sessions
                  </p>
                </div>

                {isAuthenticated && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                    Ask Session
                  </button>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-4 mb-6 border-b border-gray-200">
                {[
                  { key: 'votes', label: 'Highest Voted' },
                  { key: 'newest', label: 'Newest' },
                  { key: 'views', label: 'Most Viewed' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key)}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      sortBy === option.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Session Cards */}
              <div className="space-y-4">
                {sortedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onAuthRequired={handleAuthRequired}
                  />
                ))}
              </div>
            </main>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sign in to continue
                </h2>
                <p className="text-gray-600 mb-6">
                  You need to sign in to view sessions and interact with the community.
                </p>
                <div className="space-y-4">
                  <LoginButton className="w-full justify-center" />
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

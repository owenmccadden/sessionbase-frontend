import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from '../components/auth/UserProfile';
import LoginButton from '../components/auth/LoginButton';

export default function Teams() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <>
      <Head>
        <title>Teams - SessionBase</title>
        <meta name="description" content="Team collaboration features coming soon to SessionBase." />
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
                <Link href="/" className="text-2xl font-bold text-gray-900">SessionBase</Link>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/discover" className="text-gray-700 hover:text-gray-900 font-medium">
                  Discover
                </Link>
                {isAuthenticated && (
                  <Link href="/sessions" className="text-gray-700 hover:text-gray-900 font-medium">
                    My Sessions
                  </Link>
                )}
                <Link href="/teams" className="text-blue-600 hover:text-blue-800 font-medium border-b-2 border-blue-600">
                  Teams
                </Link>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="w-full">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Teams Coming Soon</h1>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                We're working on team features that will allow you to collaborate on sessions with your teammates 
                and build shared knowledge bases. Stay tuned for updates!
              </p>
              
              {/* Email Signup */}
              <div className="max-w-md mx-auto mb-8">
                <div className="bg-white rounded-lg p-6 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Get notified when teams launch</h3>
                  <form className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      type="submit"
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Notify Me
                    </button>
                  </form>
                </div>
              </div>

              {/* Planned Features */}
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-6 border border-blue-200 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-2xl mr-3">🔒</span>
                    Private Team Sessions
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Create private sessions that are only visible to your team members. 
                    Perfect for sharing sensitive conversations and internal knowledge.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-blue-200 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-2xl mr-3">✏️</span>
                    Collaborative Editing
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Edit and annotate sessions together. Add comments, highlights, 
                    and collaborative notes to build shared understanding.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-blue-200 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-2xl mr-3">📚</span>
                    Team Knowledge Base
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Build a searchable knowledge base from your team's best AI conversations. 
                    Organize by project, topic, or use case.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-blue-200 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-2xl mr-3">⚙️</span>
                    Advanced Sharing
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Granular permissions, role-based access, and advanced sharing controls 
                    for enterprise teams.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-8 pt-8 border-t border-blue-200">
                <p className="text-gray-600 mb-4">
                  Have specific team requirements or want early access?
                </p>
                <a 
                  href="mailto:teams@sessionbase.ai"
                  className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
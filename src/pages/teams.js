import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

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
        <Header />

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
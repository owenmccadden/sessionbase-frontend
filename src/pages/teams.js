import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Users, Lock, ExternalLink, BookOpen, Settings } from 'lucide-react';
import { submitTeamsEmail } from '../utils/api';

export default function Teams() {
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await submitTeamsEmail(email);
      setSubmitStatus('success');
      setEmail(''); // Clear form on success
    } catch (error) {
      console.error('Error submitting email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Teams - SessionBase</title>
        <meta name="description" content="Team collaboration features coming soon to SessionBase." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="w-full">
            <div className="text-center">
              <div className="mb-4">
                <Users className="w-10 h-10 mx-auto text-gray-400" />
              </div>
              <h1 className="text-3xl font-light text-gray-900 mb-4">Teams Coming Soon</h1>
              <p className="text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
                Share AI conversations privately with your dev team.
              </p>
              
              {/* Email Signup */}
              <div className="max-w-sm mx-auto mb-10">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-sm disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get Notified'}
                  </button>
                </form>
                
                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <p className="mt-3 text-green-600 text-sm text-center">
                    Thanks! We'll notify you when teams launch.
                  </p>
                )}
                {submitStatus === 'error' && (
                  <p className="mt-3 text-red-600 text-sm text-center">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              {/* Planned Features */}
              <div className="grid gap-6 max-w-2xl mx-auto text-left">
                <div className="py-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Lock className="w-5 h-5 mr-3 text-gray-400" />
                    Private Team Sessions
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Create private sessions visible only to your team members.
                  </p>
                </div>

                <div className="py-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <BookOpen className="w-5 h-5 mr-3 text-gray-400" />
                    Team Knowledge Base
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Build searchable knowledge from your team's best AI conversations.
                  </p>
                </div>

                <div className="py-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <ExternalLink className="w-5 h-5 mr-3 text-gray-400" />
                    Session Linking
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Link AI sessions in PRs and internal docs for better team knowledge sharing.
                  </p>
                </div>

                <div className="py-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-gray-400" />
                    Advanced Sharing
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Granular permissions and access controls.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
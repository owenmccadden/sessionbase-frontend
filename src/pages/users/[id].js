import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from '../../components/auth/LoginButton';
import UserProfile from '../../components/auth/UserProfile';
import SessionCard from '../../components/sessions/SessionCard';
import { getUserProfile } from '../../utils/api';

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function UserProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getUserProfile(id);
        setUserData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => router.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { user, sessions, totalSessions } = userData;

  return (
    <>
      <Head>
        <title>{user.name} - SessionBase</title>
        <meta name="description" content={`View ${user.name}'s public sessions and profile on SessionBase.`} />
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
                <Link href="/teams" className="text-gray-500 hover:text-gray-700">
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
                {authLoading ? (
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

        {/* User info */}
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start space-x-6">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=96`;
              }}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Joined {formatTimeAgo(user.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{totalSessions} session{totalSessions !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Sessions ({totalSessions})
          </h2>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard 
                key={session.sessionId} 
                session={{
                  ...session,
                  id: session.sessionId,
                  author: {
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                    userId: user.userId
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No sessions yet</h3>
            <p className="text-gray-500">This user hasn't shared any sessions yet.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
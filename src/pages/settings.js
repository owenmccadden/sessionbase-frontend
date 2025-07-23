import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getAuthToken } from '../utils/auth';
import Header from '../components/Header';

const API_BASE_URL = process.env.NEXT_PUBLIC_ENDPOINT_URL || 'https://api.sessionbase.ai';

export default function Settings() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(null);

  const handleCopyToken = async () => {
    const token = getAuthToken();
    if (token && isAuthenticated) {
      try {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy token:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = token;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleCopyCommand = async (command, commandId) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(commandId);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = command;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCommand(commandId);
      setTimeout(() => setCopiedCommand(null), 2000);
    }
  };

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  const formatTokenExpiry = (exp) => {
    const expiryDate = new Date(exp * 1000);
    return expiryDate.toLocaleString();
  };

  // Handle redirect on client side
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [isAuthenticated, user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Information Card */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Information</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user.username}
                </h3>
                <p className="text-sm text-gray-500">User ID: {user.id}</p>
                <p className="text-sm text-gray-500">
                  Token expires: {formatTokenExpiry(user.exp)}
                </p>
              </div>
            </div>

            {/* Account Actions */}
            <div className="border-t pt-6">
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* CLI Setup Instructions */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">CLI Setup</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">1. Install the SessionBase CLI</h3>
                <div className="relative">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 pr-12">
                    <code className="text-slate-100 text-sm block" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                      npm i @sessionbase/cli
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyCommand('npm i @sessionbase/cli', 'install')}
                    className={`absolute top-3 right-3 p-1.5 rounded-md transition-all duration-200 ${
                      copiedCommand === 'install'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
                    title="Copy command"
                  >
                    {copiedCommand === 'install' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">2. Configure your authentication</h3>
                <div className="relative">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 pr-12">
                    <code className="text-slate-100 text-sm block" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                      sessionbase login --token YOUR_TOKEN
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyCommand('sessionbase login --token YOUR_TOKEN', 'login')}
                    className={`absolute top-3 right-3 p-2 rounded-md transition-colors ${
                      copiedCommand === 'login'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    title="Copy command"
                  >
                    {copiedCommand === 'login' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">3. Verify your setup</h3>
                <div className="relative">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 pr-12">
                    <code className="text-slate-100 text-sm block" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                      sessionbase whoami
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyCommand('sessionbase whoami', 'whoami')}
                    className={`absolute top-3 right-3 p-2 rounded-md transition-colors ${
                      copiedCommand === 'whoami'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    title="Copy command"
                  >
                    {copiedCommand === 'whoami' ? (
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Need help?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Check out our{' '}
                        <a href="https://docs.sessionbase.ai" className="underline hover:text-blue-600">
                          documentation
                        </a>{' '}
                        for detailed CLI usage instructions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Authentication Token Card */}
          <div className="bg-white shadow-lg rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Authentication Token</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your JWT Token
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showToken ? "text" : "password"}
                      value={isAuthenticated ? (getAuthToken() || '') : ''}
                      readOnly
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-gray-50 text-sm"
                      style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}
                    />
                    <button
                      onClick={toggleTokenVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      {showToken ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    onClick={handleCopyToken}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </span>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Use this token for API authentication and CLI setup. Keep it secure and don't share it publicly.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Security Notice
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This token provides full access to your SessionBase account. 
                        If you suspect it has been compromised, sign out and sign back in to generate a new token.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

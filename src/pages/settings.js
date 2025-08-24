import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getApiKeyInfo, rotateApiKey } from '../utils/auth';
import Header from '../components/Header';
import { trackSettings } from '../utils/mixpanel';

const API_BASE_URL = process.env.NEXT_PUBLIC_ENDPOINT_URL || 'https://api.sessionbase.ai';

export default function Settings() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  
  // Track page view on component mount (with slight delay to ensure Mixpanel is initialized)
  useEffect(() => {
    const timer = setTimeout(() => {
      trackSettings.pageView();
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  const [apiKeyInfo, setApiKeyInfo] = useState(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [apiKeyError, setApiKeyError] = useState(null);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(null);
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);
  const [rotating, setRotating] = useState(false);

  // Fetch API key info on mount
  useEffect(() => {
    const fetchApiKeyInfo = async () => {
      if (!isAuthenticated || loading) return;
      
      try {
        setApiKeyLoading(true);
        const keyInfo = await getApiKeyInfo();
        setApiKeyInfo(keyInfo);
        setApiKeyError(null);
      } catch (error) {
        console.error('Failed to fetch API key info:', error);
        setApiKeyError(error.message);
      } finally {
        setApiKeyLoading(false);
      }
    };

    fetchApiKeyInfo();
  }, [isAuthenticated, loading]);

  const handleCopyApiKey = async () => {
    if (apiKeyInfo?.apiKey) {
      try {
        await navigator.clipboard.writeText(apiKeyInfo.apiKey);
        setCopiedApiKey(true);
        setTimeout(() => setCopiedApiKey(false), 2000);
      } catch (err) {
        console.error('Failed to copy API key:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = apiKeyInfo.apiKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedApiKey(true);
        setTimeout(() => setCopiedApiKey(false), 2000);
      }
    }
  };

  const handleRotateApiKey = async () => {
    try {
      setRotating(true);
      const result = await rotateApiKey();
      setApiKeyInfo(result);
      setShowRotateConfirm(false);
      setApiKeyError(null);
    } catch (error) {
      console.error('Failed to rotate API key:', error);
      setApiKeyError(error.message);
    } finally {
      setRotating(false);
    }
  };

  const maskApiKey = (apiKey) => {
    if (!apiKey || apiKey.length < 16) return apiKey;
    const prefix = apiKey.substring(0, 8); // "sb_live_"
    const suffix = apiKey.substring(apiKey.length - 4);
    return `${prefix}****...****${suffix}`;
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

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Information Card */}
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">User Information</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">User ID: {user.userId || user.id}</p>
                {apiKeyInfo?.apiKeyCreatedAt && (
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    API Key created: {formatDate(apiKeyInfo.apiKeyCreatedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="border-t pt-6">
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* CLI Setup Instructions */}
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">CLI Setup</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">1. Install the SessionBase CLI</h3>
                <div className="relative">
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 pr-12">
                    <code className="text-slate-800 dark:text-slate-100 text-sm block" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                      npm i @sessionbase/cli
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyCommand('npm i @sessionbase/cli', 'install')}
                    className={`absolute top-3 right-3 p-1.5 rounded-md transition-all duration-200 ${
                      copiedCommand === 'install'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white'
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
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">2. Authenticate with SessionBase</h3>
                <div className="relative">
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 pr-12">
                    <code className="text-slate-800 dark:text-slate-100 text-sm block" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                      sessionbase login
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyCommand('sessionbase login', 'login')}
                    className={`absolute top-3 right-3 p-2 rounded-md transition-colors ${
                      copiedCommand === 'login'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
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
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                  This will open your browser for authentication. Your API key will be stored securely for future use.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">3. Verify your setup</h3>
                <div className="relative">
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 pr-12">
                    <code className="text-slate-800 dark:text-slate-100 text-sm block" style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}>
                      sessionbase whoami
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyCommand('sessionbase whoami', 'whoami')}
                    className={`absolute top-3 right-3 p-2 rounded-md transition-colors ${
                      copiedCommand === 'whoami'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
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

              <div className="bg-primary/5 border border-primary/20 rounded-md p-4 dark:bg-primary-light/10 dark:border-primary-light/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-primary dark:text-primary-light" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-primary-dark dark:text-primary-light">
                      Need help?
                    </h3>
                    <div className="mt-2 text-sm text-primary-dark dark:text-primary-light">
                      <p>
                        Check out our{' '}
                        <a href="https://docs.sessionbase.ai" className="underline hover:text-primary-hover">
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

          {/* API Key Management Card */}
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">API Key Management</h2>
            
            {apiKeyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading API key...</span>
              </div>
            ) : apiKeyError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Failed to load API key
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-200">
                      <p>{apiKeyError}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Your API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKeyInfo?.apiKey ? (showApiKey ? apiKeyInfo.apiKey : maskApiKey(apiKeyInfo.apiKey)) : 'No API key available'}
                        readOnly
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                        style={{fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'}}
                      />
                      <button
                        onClick={toggleApiKeyVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        type="button"
                      >
                        {showApiKey ? (
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
                      onClick={handleCopyApiKey}
                      disabled={!apiKeyInfo?.apiKey}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        copiedApiKey
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700/50'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {copiedApiKey ? (
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
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                    Use this API key for CLI authentication and API access. Keep it secure and don't share it publicly.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">API Key Management</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {apiKeyInfo?.apiKeyCreatedAt && `Created: ${formatDate(apiKeyInfo.apiKeyCreatedAt)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRotateConfirm(true)}
                    disabled={rotating}
                    className="px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700/50 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rotating ? 'Rotating...' : 'Rotate API Key'}
                  </button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Security Notice
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                        <p>
                          This API key provides full access to your SessionBase account. 
                          If you suspect it has been compromised, rotate it immediately using the button above.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* API Key Rotation Confirmation Modal */}
      {showRotateConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                Rotate API Key?
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  This will generate a new API key and invalidate your current one. 
                  You'll need to log back in on the CLI using the new key.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRotateConfirm(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRotateApiKey}
                    disabled={rotating}
                    className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rotating ? 'Rotating...' : 'Rotate Key'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

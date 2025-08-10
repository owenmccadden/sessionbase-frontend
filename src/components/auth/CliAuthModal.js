import { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/auth';

export default function CliAuthModal({ isOpen, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const authToken = getAuthToken();
      setToken(authToken || '');
    }
  }, [isOpen]);

  const handleCopyToken = async () => {
    if (token) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              CLI Authentication Success!
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success message */}
          <div className="text-center mb-6">
            <div className="rounded-full bg-secondary/10 dark:bg-secondary-light/20 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-secondary-dark dark:text-secondary-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome {user?.username}! Your CLI authentication is complete.
            </p>
          </div>

          {/* Auth Token Section */}
          <div className="bg-primary/5 dark:bg-primary-light/10 rounded-lg p-6 mb-6 border border-primary/20 dark:border-primary-light/20">
            <h3 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-4 text-center">
              Your Authentication Token
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-dark dark:text-primary-light mb-3 text-center">
                  Copy this token for CLI usage:
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={token}
                      readOnly
                      className="w-full px-4 py-3 pr-12 border border-primary/30 dark:border-primary-light/30 rounded-lg bg-white dark:bg-slate-700 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                    className={`w-full px-6 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ${
                      copied
                        ? 'bg-secondary text-white shadow-lg dark:bg-secondary-light'
                        : 'bg-primary text-white hover:bg-primary-hover shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30 dark:focus:ring-primary-light/30'
                    }`}
                  >
                    {copied ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Token Copied Successfully!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Authentication Token
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 dark:focus:ring-offset-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
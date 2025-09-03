import Link from 'next/link';
import { SESSION_TYPES, detectSessionFormat } from '../../utils/sessionParser';
import { trackDiscovery } from '../../utils/mixpanel';

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

function getPlatformLogo(sessionType) {
  switch (sessionType) {
    case SESSION_TYPES.Q_CHAT:
      return <img src="/q-logo.png" alt="Amazon Q" className="w-6 h-6" />;
    case SESSION_TYPES.CLAUDE_CODE:
      return <img src="/claude-logo.png" alt="Claude" className="w-6 h-6" />;
    case SESSION_TYPES.CURSOR:
      return <span className="text-lg">⚡</span>;
    case SESSION_TYPES.GEMINI_CLI:
      return <img src="/gemini-cli-logo.png" alt="Gemini CLI" className="w-6 h-6" />;
    case SESSION_TYPES.CODEX:
      return (
        <>
          <img src="/openai-logo-dark.png" alt="OpenAI Codex" className="w-6 h-6 dark:hidden" />
          <img src="/openai-logo-light.png" alt="OpenAI Codex" className="w-6 h-6 hidden dark:block" />
        </>
      );
    default:
      return <span className="text-xs text-gray-400">?</span>;
  }
}

export default function SessionCard({ session, showActions, onAuthRequired }) {

  // Determine session type from session data
  const getSessionType = () => {
    // Check if session already has a parsed type
    if (session?.type) {
      return session.type;
    }
    
    // Check for sessionType directly on the session object (API response)
    if (session?.sessionType) {
      const sessionType = session.sessionType;
      if (sessionType === 'q-chat') return SESSION_TYPES.Q_CHAT;
      if (sessionType === 'claude' || sessionType === 'claude-code') return SESSION_TYPES.CLAUDE_CODE;
      if (sessionType === 'gemini_cli') return SESSION_TYPES.GEMINI_CLI;
      if (sessionType === 'cursor') return SESSION_TYPES.CURSOR;
      if (sessionType === 'codex') return SESSION_TYPES.CODEX;
    }
    
    // Check metadata for sessionType
    if (session?.metadata?.sessionType) {
      const metaType = session.metadata.sessionType;
      if (metaType === 'q-chat') return SESSION_TYPES.Q_CHAT;
      if (metaType === 'claude' || metaType === 'claude-code') return SESSION_TYPES.CLAUDE_CODE;
      if (metaType === 'gemini_cli') return SESSION_TYPES.GEMINI_CLI;
      if (metaType === 'cursor') return SESSION_TYPES.CURSOR;
      if (metaType === 'codex') return SESSION_TYPES.CODEX;
    }
    
    // Try to detect based on raw data if available
    if (session?.rawData) {
      return detectSessionFormat(session.rawData);
    }
    
    // Fallback: try to infer from model name or other properties
    const modelName = session?.modelName || session?.aiModel || '';
    if (modelName.toLowerCase().includes('claude')) {
      return SESSION_TYPES.CLAUDE_CODE;
    }
    if (modelName.toLowerCase().includes('gemini')) {
      return SESSION_TYPES.GEMINI_CLI;
    }
    if (modelName.toLowerCase().includes('q-')) {
      return SESSION_TYPES.Q_CHAT;
    }
    if (modelName.toLowerCase().includes('codex') || modelName.toLowerCase().includes('openai')) {
      return SESSION_TYPES.CODEX;
    }
    
    return SESSION_TYPES.UNKNOWN;
  };

  const sessionType = getSessionType();

  // Provide default values for missing properties
  const safeSession = {
    id: session?.sessionId || session?.id || '',
    title: session?.title || 'Untitled Session',
    description: session?.description || session?.summary || session?.content || 'No description available',
    author: {
      username: session?.username || session?.author?.username || 'Anonymous',
      avatarUrl: session?.avatarUrl || session?.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.username || session?.author?.username || 'Anonymous')}&background=3b82f6&color=fff&size=24`,
      userId: session?.userId || session?.author?.userId
    },
    tags: session?.tags || [],
    messageCount: session?.messageCount || 0,
    votes: session?.upvotes || session?.votes || 0,
    views: session?.views || 0,
    aiModel: session?.modelName || session?.aiModel || 'Unknown',
    createdAt: session?.createdAt || new Date().toISOString(),
    updatedAt: session?.updatedAt || session?.createdAt || new Date().toISOString(),
    isPrivate: session?.isPrivate || false,
    sessionType: sessionType
  };

  const handleSessionClick = () => {
    trackDiscovery.sessionClick(safeSession.id, safeSession.sessionType);
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      {/* Content section */}
      <div className="flex-1 min-w-0">
        <Link href={`/sessions/${safeSession.id}`} className="block" onClick={handleSessionClick}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors mb-1 overflow-hidden cursor-pointer" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {safeSession.title}
            </h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-slate-700 rounded-full border border-gray-200 dark:border-slate-600">
                {getPlatformLogo(safeSession.sessionType)}
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed overflow-hidden cursor-pointer" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {safeSession.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {safeSession.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light text-xs px-3 py-1 rounded-full hover:bg-primary/20 dark:hover:bg-primary-light/30 transition-colors font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </Link>
        
        {/* Author and timestamp */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <img
              src={safeSession.author.avatarUrl}
              alt={safeSession.author.username}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(safeSession.author.username)}&background=3b82f6&color=fff&size=24`;
              }}
              referrerPolicy="no-referrer"
            />
            <Link 
              href={`/users/${safeSession.author.userId || encodeURIComponent(safeSession.author.username)}`}
              className="font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {safeSession.author.username}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>{formatTimeAgo(safeSession.createdAt)}</span>
            {safeSession.updatedAt !== safeSession.createdAt && (
              <span>modified {formatTimeAgo(safeSession.updatedAt)}</span>
            )}
            <div className="flex items-center text-xs">
              <span className="bg-secondary/10 text-secondary-dark dark:bg-secondary-light/20 dark:text-secondary-light px-3 py-1 rounded-full font-medium">
                {safeSession.messageCount} messages
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

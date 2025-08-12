import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

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

export default function SessionCard({ session, onAuthRequired }) {
  const { isAuthenticated } = useAuth();

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
    isPrivate: session?.isPrivate || false
  };

  return (
    <Link href={`/sessions/${safeSession.id}`} className="block">
      <div 
        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      >
      {/* Content section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors mb-1 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {safeSession.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
            <span className="bg-primary/10 text-primary dark:text-primary-light px-3 py-1 rounded-full font-medium">
              {safeSession.aiModel}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed overflow-hidden" style={{
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
              href={`/users/${safeSession.author.userId || 'unknown'}`}
              className="font-medium text-primary hover:text-primary-hover transition-colors"
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
    </Link>
  );
}

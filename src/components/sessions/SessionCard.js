import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

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
  const router = useRouter();

  // Provide default values for missing properties
  const safeSession = {
    id: session?.sessionId || session?.id || '',
    title: session?.title || 'Untitled Session',
    description: session?.description || 'No description available',
    author: {
      username: session?.username || session?.author?.username || 'Anonymous',
      avatarUrl: session?.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.username || session?.author?.username || 'Anonymous')}&background=3b82f6&color=fff&size=24`,
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

  const handleCardClick = (e) => {
    // Allow all users (authenticated and unauthenticated) to view sessions
    if (!safeSession.id) {
      console.error('Session ID is missing:', session);
      return;
    }
    
    console.log('Navigating to session:', safeSession.id);
    router.push(`/sessions/${safeSession.id}`);
  };

  const handleVote = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired();
      return;
    }
    
    // TODO: Implement voting logic
    console.log('Vote clicked for session:', safeSession.id);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex gap-4">
        {/* Vote section */}
        <div className="flex flex-col items-center space-y-2 text-gray-500 min-w-[60px]">
          <button 
            onClick={handleVote}
            className="flex flex-col items-center hover:text-blue-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-lg font-semibold">{safeSession.votes}</span>
          </button>
          
          <div className="flex flex-col items-center text-sm">
            <span className="font-medium">{safeSession.views}</span>
            <span className="text-xs">views</span>
          </div>
          
          <div className="flex flex-col items-center text-sm">
            <span className="font-medium">{safeSession.messageCount}</span>
            <span className="text-xs">messages</span>
          </div>
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors line-clamp-2">
              {safeSession.title}
            </h3>
            <div className="flex items-center text-xs text-gray-500 ml-4 flex-shrink-0">
              <span className="bg-gray-100 px-2 py-1 rounded">
                {safeSession.aiModel}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {safeSession.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {safeSession.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Author and timestamp */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <img
                src={safeSession.author.avatarUrl}
                alt={safeSession.author.username}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(safeSession.author.username)}&background=3b82f6&color=fff&size=24`;
                }}
              />
              <Link 
                href={`/users/${safeSession.author.userId || 'unknown'}`}
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const handleCardClick = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired();
      return;
    }
    
    router.push(`/sessions/${session.id}`);
  };

  const handleVote = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired();
      return;
    }
    
    // TODO: Implement voting logic
    console.log('Vote clicked for session:', session.id);
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
            <span className="text-lg font-semibold">{session.votes}</span>
          </button>
          
          <div className="flex flex-col items-center text-sm">
            <span className="font-medium">{session.views}</span>
            <span className="text-xs">views</span>
          </div>
          
          <div className="flex flex-col items-center text-sm">
            <span className="font-medium">{session.messageCount}</span>
            <span className="text-xs">messages</span>
          </div>
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors line-clamp-2">
              {session.title}
            </h3>
            <div className="flex items-center text-xs text-gray-500 ml-4 flex-shrink-0">
              <span className="bg-gray-100 px-2 py-1 rounded">
                {session.aiModel}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {session.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {session.tags.map((tag) => (
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
                src={session.author.avatarUrl}
                alt={session.author.username}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-blue-600">
                {session.author.username}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span>asked {formatTimeAgo(session.createdAt)}</span>
              {session.updatedAt !== session.createdAt && (
                <span>modified {formatTimeAgo(session.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

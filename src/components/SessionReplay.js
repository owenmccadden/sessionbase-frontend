import { useState, useEffect, useCallback, useRef } from 'react';

const STREAMING_SPEED = 30; // Characters per frame (~60fps)

export default function SessionReplay({ session, onExit }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x speed
  const [showAllMessages, setShowAllMessages] = useState(false); // Show conversation history
  
  const messages = session.messages;
  const currentMessage = messages[currentMessageIndex];
  const autoPlayTimeoutRef = useRef(null);
  const streamingTimerRef = useRef(null);
  const currentMessageRef = useRef(null);

  // Reset streaming state when message changes
  useEffect(() => {
    setStreamingText('');
    setStreamingComplete(false);
    setIsStreaming(true);
    
    // Clear any existing autoplay timeout
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    
    // Scroll to current message
    setTimeout(() => {
      if (currentMessageRef.current) {
        currentMessageRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  }, [currentMessageIndex]);

  // Streaming animation effect with improved responsiveness
  useEffect(() => {
    if (!isStreaming || !currentMessage) return;

    const fullText = currentMessage.content;
    let currentIndex = 0;
    
    const animate = () => {
      const charsToAdd = Math.ceil(STREAMING_SPEED * speed);
      currentIndex += charsToAdd;
      
      if (currentIndex >= fullText.length) {
        setStreamingText(fullText);
        setStreamingComplete(true);
        setIsStreaming(false);
        
        // Auto-advance if enabled - now responds immediately to autoPlay changes
        if (autoPlay && currentMessageIndex < messages.length - 1) {
          autoPlayTimeoutRef.current = setTimeout(() => {
            setCurrentMessageIndex(prev => prev + 1);
          }, 1500); // 1.5 second pause between messages
        }
      } else {
        setStreamingText(fullText.slice(0, currentIndex));
        streamingTimerRef.current = requestAnimationFrame(animate);
      }
    };
    
    streamingTimerRef.current = requestAnimationFrame(animate);

    return () => {
      if (streamingTimerRef.current) {
        cancelAnimationFrame(streamingTimerRef.current);
      }
    };
  }, [isStreaming, currentMessage, speed, autoPlay, currentMessageIndex, messages.length]);

  // Handle autoplay state changes immediately
  useEffect(() => {
    if (autoPlay && streamingComplete && currentMessageIndex < messages.length - 1) {
      // Start autoplay immediately if conditions are met
      autoPlayTimeoutRef.current = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, 1500);
    } else if (!autoPlay && autoPlayTimeoutRef.current) {
      // Cancel autoplay immediately
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
        autoPlayTimeoutRef.current = null;
      }
    };
  }, [autoPlay, streamingComplete, currentMessageIndex, messages.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        if (isStreaming) {
          // Skip to end of current message
          setStreamingText(currentMessage.content);
          setStreamingComplete(true);
          setIsStreaming(false);
        } else if (currentMessageIndex < messages.length - 1) {
          setCurrentMessageIndex(prev => prev + 1);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentMessageIndex > 0) {
          setCurrentMessageIndex(prev => prev - 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSpeed(prev => Math.min(prev + 0.5, 3));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSpeed(prev => Math.max(prev - 0.5, 0.5));
        break;
      case 'p':
        e.preventDefault();
        setAutoPlay(prev => !prev);
        break;
      case 'Escape':
        e.preventDefault();
        onExit();
        break;
    }
  }, [isStreaming, currentMessage, currentMessageIndex, messages.length, onExit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const goToNext = () => {
    if (isStreaming) {
      setStreamingText(currentMessage.content);
      setStreamingComplete(true);
      setIsStreaming(false);
    } else if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(prev => prev - 1);
    }
  };

  const jumpToMessage = (index) => {
    setCurrentMessageIndex(index);
  };

  if (!currentMessage) return null;

  const isUser = currentMessage.type === 'user';
  const isAssistant = currentMessage.type === 'assistant';
  const isSystem = currentMessage.type === 'system' || currentMessage.type === 'tool';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onExit}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ExitIcon />
              <span>Exit Replay</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {currentMessageIndex + 1} / {messages.length}
              </span>
              <div className="w-64 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentMessageIndex + 1) / messages.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Speed Control */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Speed:</span>
              <span className="text-sm font-medium">{speed}x</span>
            </div>

            {/* Auto-play Toggle */}
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                autoPlay 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              Auto-play {autoPlay ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Replay Area - Vertical Chat Layout */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Conversation History */}
        <div className="space-y-4 mb-8">
          {/* Show all previous messages */}
          {messages.slice(0, currentMessageIndex).map((message, index) => (
            <ReplayMessageBubble 
              key={message.id} 
              message={message} 
              isCompleted={true}
              showMinimal={true}
            />
          ))}
          
          {/* Current streaming message */}
          <div ref={currentMessageRef}>
            <ReplayMessageBubble 
              message={currentMessage} 
              streamingText={streamingText}
              isStreaming={isStreaming}
              isCompleted={streamingComplete}
              showMinimal={false}
            />
          </div>
        </div>

        {/* Fixed Bottom Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Progress and Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPrevious}
                disabled={currentMessageIndex === 0}
                className={`p-2 rounded-lg transition-colors ${
                  currentMessageIndex === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
              >
                <PreviousIcon />
              </button>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 min-w-[80px]">
                  {currentMessageIndex + 1} / {messages.length}
                </span>
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentMessageIndex + 1) / messages.length) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={goToNext}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
              >
                {isStreaming ? (
                  <>
                    <span>Skip</span>
                    <SkipIcon />
                  </>
                ) : currentMessageIndex < messages.length - 1 ? (
                  <>
                    <span>Next</span>
                    <NextIcon />
                  </>
                ) : (
                  <span>Complete</span>
                )}
              </button>
            </div>

            {/* Speed and Auto-play */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Speed:</span>
                <span className="text-white font-medium">{speed}x</span>
              </div>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  autoPlay 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
              >
                {autoPlay ? '⏸ Auto' : '▶ Auto'}
              </button>
            </div>
          </div>
        </div>

        {/* Add padding for fixed controls */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}

// Clean Message Bubble Component
function ReplayMessageBubble({ message, streamingText, isStreaming, isCompleted, showMinimal }) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system' || message.type === 'tool';
  
  // For completed messages in minimal mode, show condensed version
  if (showMinimal && isCompleted) {
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-3xl ${isUser ? 'ml-16' : 'mr-16'} opacity-60`}>
          <div className={`rounded-lg p-3 text-sm ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : isSystem
              ? 'bg-orange-800 text-orange-100'
              : 'bg-gray-700 text-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs opacity-75">
                {isUser ? '👤' : isSystem ? '🔧' : '🤖'}
              </span>
              <span className="text-xs opacity-75 font-medium">
                {message.type}
              </span>
            </div>
            <div className="overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis'
            }}>
              {message.content.length > 100 ? message.content.slice(0, 100) + '...' : message.content}
            </div>
            {/* Show tool indicator if present */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="text-xs opacity-75 mt-1">
                🔧 {message.toolCalls.length} tool{message.toolCalls.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Current message - full display
  const displayText = streamingText || message.content;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'ml-16' : 'mr-16'}`}>
        {/* Message Header - minimal */}
        <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              isUser ? 'bg-blue-600' : 
              isSystem ? 'bg-orange-600' :
              'bg-green-600'
            }`}>
              {isUser ? '👤' : isSystem ? '🔧' : '🤖'}
            </span>
            <span className="font-medium text-white">
              {message.type}
            </span>
            {/* Only show model for current message */}
            {!showMinimal && message.metadata?.model && (
              <>
                <span>•</span>
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                  {message.metadata.model}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`rounded-xl p-4 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isSystem
            ? 'bg-orange-900 border border-orange-700'
            : 'bg-gray-800 border border-gray-700'
        }`}>
          <div className="whitespace-pre-wrap text-base leading-relaxed">
            {displayText}
            {isStreaming && (
              <span className="animate-pulse text-blue-300">|</span>
            )}
          </div>

          {/* Tool summary (minimal, only if completed) */}
          {isCompleted && message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 pt-3 border-t border-opacity-20 border-gray-400">
              <div className="flex items-center space-x-2 text-sm opacity-75">
                <span>🔧</span>
                <span>
                  Used {message.toolCalls.length} tool{message.toolCalls.length !== 1 ? 's' : ''}: {' '}
                  {message.toolCalls.map(tool => tool.name).join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon Components
function ExitIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PreviousIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  );
}

function LastIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l7-7-7-7m-8 14l7-7-7-7" />
    </svg>
  );
}
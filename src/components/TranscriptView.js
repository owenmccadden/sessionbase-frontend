export default function TranscriptView({ session }) {
  const { transcript } = session;

  if (!transcript || transcript.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Available</h3>
        <p className="text-gray-600">This session doesn't have a transcript to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Session Transcript</h3>
        <p className="text-sm text-gray-600">Chronological view of the conversation</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {transcript.map((entry, index) => (
          <TranscriptEntry key={index} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}

function TranscriptEntry({ entry, index }) {
  const isUserMessage = entry.startsWith('> ');
  const isToolUse = entry.includes('[Tool uses:');
  
  const getEntryStyle = () => {
    if (isUserMessage) {
      return 'bg-blue-50 border-l-4 border-blue-400';
    } else if (isToolUse) {
      return 'bg-purple-50 border-l-4 border-purple-400';
    } else {
      return 'bg-gray-50 border-l-4 border-gray-400';
    }
  };

  const getEntryIcon = () => {
    if (isUserMessage) return '👤';
    if (isToolUse) return '🔧';
    return '🤖';
  };

  const getEntryLabel = () => {
    if (isUserMessage) return 'User';
    if (isToolUse) return 'Tool Use';
    return 'Assistant';
  };

  const formatEntry = (text) => {
    // Remove the '> ' prefix from user messages
    if (text.startsWith('> ')) {
      return text.substring(2);
    }
    return text;
  };

  return (
    <div className={`p-4 ${getEntryStyle()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
          <span className="text-sm">{getEntryIcon()}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900">{getEntryLabel()}</span>
            <span className="text-xs text-gray-500">#{index + 1}</span>
          </div>
          
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {formatEntry(entry)}
          </div>
        </div>
      </div>
    </div>
  );
}

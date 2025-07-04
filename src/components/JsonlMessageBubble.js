import { useState } from 'react';

export default function JsonlMessageBubble({ message }) {
  const [showRawData, setShowRawData] = useState(false);
  const [showToolDetails, setShowToolDetails] = useState(false);

  if (!message || !message.message) {
    return null;
  }

  // Determine if this is a tool result message (should be treated as system message)
  const isToolResult = message.message.content && 
    Array.isArray(message.message.content) && 
    message.message.content.some(item => item.type === 'tool_result');

  // Determine message type for display
  const isUser = message.type === 'user' && !isToolResult;
  const isAssistant = message.type === 'assistant';
  const isSystem = isToolResult; // Tool results are system messages
  
  const timestamp = new Date(message.timestamp).toLocaleString();

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-4xl ${isUser ? 'ml-12' : 'mr-12'}`}>
        {/* Message Header */}
        <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              isUser ? 'bg-blue-100 text-blue-700' : 
              isSystem ? 'bg-orange-100 text-orange-700' :
              'bg-green-100 text-green-700'
            }`}>
              {isUser ? '👤' : isSystem ? '🔧' : '🤖'}
            </span>
            <span className="font-medium">
              {isUser ? 'User' : isSystem ? 'Tool Result' : 'Assistant'}
            </span>
            <span>•</span>
            <span>{timestamp}</span>
            {message.message.model && (
              <>
                <span>•</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {message.message.model}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isSystem
            ? 'bg-orange-50 border border-orange-200 shadow-sm'
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <MessageContent message={message} isUser={isUser} isSystem={isSystem} />
          
          {/* Tool Usage Results */}
          {message.toolUseResult && (
            <ToolResultDisplay 
              result={message.toolUseResult} 
              showDetails={showToolDetails}
              onToggleDetails={() => setShowToolDetails(!showToolDetails)}
            />
          )}

          {/* Usage Statistics for Assistant Messages */}
          {isAssistant && message.message.usage && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <UsageStats usage={message.message.usage} />
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className={`flex items-center mt-2 space-x-2 text-xs ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </button>
          {message.uuid && (
            <span className="text-gray-400">
              ID: {message.uuid.slice(0, 8)}...
            </span>
          )}
        </div>

        {/* Raw Data Display */}
        {showRawData && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-3">
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(message, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageContent({ message, isUser, isSystem }) {
  const content = message.message.content;

  // Handle string content
  if (typeof content === 'string') {
    return (
      <div className="whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  // Handle array content (for tool use, etc.)
  if (Array.isArray(content)) {
    return (
      <div className="space-y-3">
        {content.map((item, index) => (
          <ContentItem key={index} item={item} isUser={isUser} isSystem={isSystem} />
        ))}
      </div>
    );
  }

  // Handle object content
  if (typeof content === 'object' && content !== null) {
    return (
      <div className="space-y-2">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <span className={`font-medium ${isUser ? 'text-white' : 'text-gray-700'}`}>{key}:</span>
            <div className="ml-2">
              {typeof value === 'string' ? (
                <span className="whitespace-pre-wrap">{value}</span>
              ) : (
                <pre className={`text-sm p-2 rounded mt-1 overflow-auto ${
                  isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  {JSON.stringify(value, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`italic ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
      [No content to display]
    </div>
  );
}

function ContentItem({ item, isUser, isSystem }) {
  if (item.type === 'text') {
    return (
      <div className="whitespace-pre-wrap">
        {item.text}
      </div>
    );
  }

  if (item.type === 'tool_use') {
    return (
      <ToolUseDisplay toolUse={item} />
    );
  }

  if (item.type === 'tool_result') {
    return (
      <div className={`p-3 rounded border-l-4 ${
        isSystem 
          ? 'bg-orange-100 border-orange-300 text-orange-900'
          : isUser 
          ? 'bg-blue-500 border-blue-300 text-white' 
          : 'bg-gray-50 border-gray-300 text-gray-900'
      }`}>
        <div className="font-medium text-sm mb-2">Tool Result</div>
        {item.tool_use_id && (
          <div className={`text-xs mb-2 ${
            isSystem ? 'text-orange-700' : isUser ? 'text-blue-100' : 'text-gray-600'
          }`}>
            Tool Use ID: {item.tool_use_id}
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm">
          {item.content}
        </div>
      </div>
    );
  }

  // Fallback for unknown content types
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
      <div className="text-sm font-medium text-yellow-800 mb-1">
        Unknown Content Type: {item.type}
      </div>
      <pre className="text-xs text-yellow-700 overflow-auto">
        {JSON.stringify(item, null, 2)}
      </pre>
    </div>
  );
}

function ToolUseDisplay({ toolUse }) {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-purple-600">🔧</span>
          <span className="font-medium text-purple-900">Tool: {toolUse.name}</span>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-xs text-purple-600 hover:text-purple-800 underline"
        >
          {showInput ? 'Hide' : 'Show'} Input
        </button>
      </div>
      
      {toolUse.id && (
        <div className="text-xs text-purple-600 mb-2">
          ID: {toolUse.id}
        </div>
      )}

      {showInput && toolUse.input && (
        <div className="mt-3 bg-purple-100 p-3 rounded">
          <div className="text-sm font-medium text-purple-800 mb-2">Input Parameters:</div>
          <pre className="text-xs text-purple-700 overflow-auto">
            {JSON.stringify(toolUse.input, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function ToolResultDisplay({ result, showDetails, onToggleDetails }) {
  if (!result) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-green-600">✅</span>
          <span className="font-medium text-sm text-gray-700">Tool Execution Result</span>
        </div>
        <button
          onClick={onToggleDetails}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {showDetails && (
        <div className="space-y-2">
          {result.type && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Type:</span> 
              <span className="text-gray-600 ml-1">{result.type}</span>
            </div>
          )}
          
          {result.filePath && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">File Path:</span> 
              <code className="ml-1 bg-gray-100 px-1 rounded text-gray-800">{result.filePath}</code>
            </div>
          )}

          {result.stdout && (
            <div>
              <div className="text-sm font-medium text-green-700 mb-1">Output:</div>
              <pre className="text-xs bg-green-50 p-2 rounded border border-green-200 overflow-auto text-green-800">
                {result.stdout}
              </pre>
            </div>
          )}

          {result.stderr && (
            <div>
              <div className="text-sm font-medium text-red-700 mb-1">Error Output:</div>
              <pre className="text-xs bg-red-50 p-2 rounded border border-red-200 overflow-auto text-red-800">
                {result.stderr}
              </pre>
            </div>
          )}

          {result.content && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Content:</div>
              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-40 text-gray-800">
                {result.content}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UsageStats({ usage }) {
  return (
    <div className="flex items-center space-x-4 text-xs text-gray-500">
      {usage.input_tokens && (
        <span>Input: {usage.input_tokens.toLocaleString()} tokens</span>
      )}
      {usage.output_tokens && (
        <span>Output: {usage.output_tokens.toLocaleString()} tokens</span>
      )}
      {usage.cache_creation_input_tokens && (
        <span>Cache Creation: {usage.cache_creation_input_tokens.toLocaleString()}</span>
      )}
      {usage.cache_read_input_tokens && (
        <span>Cache Read: {usage.cache_read_input_tokens.toLocaleString()}</span>
      )}
      {usage.service_tier && (
        <span className="bg-gray-100 px-2 py-1 rounded">
          {usage.service_tier}
        </span>
      )}
    </div>
  );
}

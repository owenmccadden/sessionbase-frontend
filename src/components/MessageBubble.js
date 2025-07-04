import { useState } from 'react';

export default function MessageBubble({ message }) {
  const [showDetails, setShowDetails] = useState(false);

  const getMessageType = () => {
    // Check for top-level message types first (the actual structure)
    if (message.ToolUse) return 'tool-use';
    if (message.ToolUseResults) return 'tool-results';
    if (message.Response) return 'response';
    if (message.Prompt) return 'prompt';
    
    // Fallback to nested content structure (if it exists)
    const { content } = message;
    if (content?.Prompt) return 'prompt';
    if (content?.ToolUse) return 'tool-use';
    if (content?.ToolUseResults) return 'tool-results';
    if (content?.Response) return 'response';
    
    // Handle messages without content
    if (!content && !message.ToolUse && !message.ToolUseResults && !message.Response && !message.Prompt) {
      console.log('Message has no recognizable structure:', message);
      return 'empty';
    }
    
    console.log('Unknown message type for message:', message);
    return 'unknown';
  };

  const getMessageContent = () => {
    // Handle top-level message types first
    if (message.ToolUse) return message.ToolUse.content || 'Tool use message';
    if (message.Response) return message.Response.content || 'AI response';
    if (message.Prompt) return message.Prompt.prompt || 'User prompt';
    if (message.ToolUseResults) return 'Tool execution results';
    
    // Fallback to nested content structure
    const { content } = message;
    if (content?.Prompt) return content.Prompt.prompt;
    if (content?.ToolUse) return content.ToolUse.content || 'Tool use message';
    if (content?.Response) return content.Response.content;
    if (content?.ToolUseResults) return 'Tool execution results';
    
    // Handle messages without content
    if (!content) {
      return 'Empty message (no content)';
    }
    
    return `Unknown message type - Message: ${JSON.stringify(message, null, 2)}`;
  };

  const messageType = getMessageType();
  const messageContent = getMessageContent();

  const getMessageStyle = () => {
    switch (messageType) {
      case 'prompt':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'tool-use':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'tool-results':
        return 'bg-gray-50 border-gray-200 text-gray-900';
      case 'response':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'empty':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'prompt':
        return '👤';
      case 'tool-use':
        return '🔧';
      case 'tool-results':
        return '📊';
      case 'response':
        return '🤖';
      case 'empty':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getMessageLabel = () => {
    switch (messageType) {
      case 'prompt':
        return 'User Prompt';
      case 'tool-use':
        return 'Tool Use';
      case 'tool-results':
        return 'Tool Results';
      case 'response':
        return 'AI Response';
      case 'empty':
        return 'Empty Message';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getMessageStyle()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getMessageIcon()}</span>
          <span className="font-medium text-sm">{getMessageLabel()}</span>
          {message.ToolUse?.message_id && (
            <span className="text-xs text-gray-500 font-mono">
              ID: {message.ToolUse.message_id.slice(0, 8)}...
            </span>
          )}
          {message.Response?.message_id && (
            <span className="text-xs text-gray-500 font-mono">
              ID: {message.Response.message_id.slice(0, 8)}...
            </span>
          )}
          {message.content?.ToolUse?.message_id && (
            <span className="text-xs text-gray-500 font-mono">
              ID: {message.content.ToolUse.message_id.slice(0, 8)}...
            </span>
          )}
          {message.content?.Response?.message_id && (
            <span className="text-xs text-gray-500 font-mono">
              ID: {message.content.Response.message_id.slice(0, 8)}...
            </span>
          )}
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-sm">
          {messageType === 'tool-results' ? (
            <ToolResultsDisplay results={message.content.ToolUseResults} />
          ) : (
            <div className="whitespace-pre-wrap">{messageContent}</div>
          )}
        </div>

        {(messageType === 'tool-use') && (message.ToolUse?.tool_uses || message.content?.ToolUse?.tool_uses) && (
          <ToolUsesDisplay toolUses={message.ToolUse?.tool_uses || message.content.ToolUse.tool_uses} />
        )}

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Message Details</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto">
              <code>{JSON.stringify(message, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolUsesDisplay({ toolUses }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-700">Tools Used:</h4>
      {toolUses.map((tool, index) => (
        <div key={index} className="bg-white p-3 rounded border text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-purple-700">{tool.name}</span>
            <span className="text-gray-500 font-mono">{tool.id.slice(0, 8)}...</span>
          </div>
          {tool.args && (
            <div className="text-gray-600">
              <strong>Args:</strong>
              <pre className="mt-1 text-xs overflow-auto">
                {JSON.stringify(tool.args, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ToolResultsDisplay({ results }) {
  return (
    <div className="space-y-2">
      {results.tool_use_results?.map((result, index) => (
        <div key={index} className="bg-white p-3 rounded border text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Tool Result</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 font-mono">{result.tool_use_id?.slice(0, 8)}...</span>
              <span className={`px-2 py-1 rounded text-xs ${
                result.status === 'Success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.status}
              </span>
            </div>
          </div>
          {result.content && (
            <div className="text-gray-600">
              {result.content.map((content, contentIndex) => (
                <div key={contentIndex} className="mb-2">
                  {content.Text && <div>Text: {content.Text}</div>}
                  {content.Json && (
                    <div>
                      <strong>Output:</strong>
                      <pre className="mt-1 bg-gray-50 p-2 rounded overflow-auto">
                        {JSON.stringify(content.Json, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

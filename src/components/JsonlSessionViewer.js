import { useState } from 'react';
import JsonlMessageBubble from './JsonlMessageBubble';
import { getSessionStats, extractToolUsage, extractConversationMessages, extractMessageContent } from '../utils/jsonlParser';

export default function JsonlSessionViewer({ session }) {
  const [activeView, setActiveView] = useState('conversation');
  const [copySuccess, setCopySuccess] = useState(false);

  const stats = getSessionStats(session.rawMessages);
  const toolUsage = extractToolUsage(session.rawMessages);
  const conversationMessages = extractConversationMessages(session.rawMessages);

  const handleCopyRawData = async () => {
    try {
      const jsonlText = session.rawMessages.map(msg => JSON.stringify(msg)).join('\n');
      await navigator.clipboard.writeText(jsonlText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = session.rawMessages.map(msg => JSON.stringify(msg)).join('\n');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Session Header */}
      <JsonlSessionHeader session={session} stats={stats} />
      
      {/* View Toggle and Copy Button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveView('conversation')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'conversation'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Conversation View
          </button>
          <button
            onClick={() => setActiveView('timeline')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'timeline'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setActiveView('tools')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'tools'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tools ({toolUsage.length})
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'stats'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveView('raw')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'raw'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Raw JSONL
          </button>
        </div>

        {/* Copy Raw Data Button */}
        <button
          onClick={handleCopyRawData}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copySuccess
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          {copySuccess ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy JSONL</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      {activeView === 'conversation' && (
        <ConversationView messages={conversationMessages} />
      )}
      
      {activeView === 'timeline' && (
        <TimelineView messages={session.rawMessages} />
      )}
      
      {activeView === 'tools' && (
        <ToolsView toolUsage={toolUsage} />
      )}
      
      {activeView === 'stats' && (
        <StatsView stats={stats} session={session} />
      )}
      
      {activeView === 'raw' && (
        <RawJsonlView messages={session.rawMessages} />
      )}
    </div>
  );
}

function JsonlSessionHeader({ session, stats }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Session: {session.sessionId}
            </h1>
            {session.isClaudeCode && (
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                🤖 Claude Code
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Version: {session.version}</span>
            <span>•</span>
            <span>User Type: {session.userType}</span>
            <span>•</span>
            <span>Duration: {stats.duration}</span>
          </div>
          {session.cwd && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Working Directory:</span>
              <code className="ml-1 bg-gray-100 px-2 py-1 rounded">{session.cwd}</code>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
          <div className="text-sm text-gray-600">Total Messages</div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{stats.userMessages}</div>
            <div className="text-sm text-gray-600">User Messages</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{stats.assistantMessages}</div>
            <div className="text-sm text-gray-600">Assistant Messages</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{stats.toolCalls}</div>
            <div className="text-sm text-gray-600">Tool Calls</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {stats.totalTokens > 0 ? stats.totalTokens.toLocaleString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Total Tokens</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationView({ messages }) {
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversation Messages</h3>
          <p className="text-gray-600">This session doesn't contain any conversation messages to display.</p>
        </div>
      ) : (
        messages.map((message) => (
          <JsonlMessageBubble key={message.id} message={message} />
        ))
      )}
    </div>
  );
}

function TimelineView({ messages }) {
  const validMessages = messages.filter(msg => !msg.isMeta && msg.timestamp);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Session Timeline</h3>
        <p className="text-sm text-gray-600">Chronological view of all session events</p>
      </div>
      
      <div className="p-4">
        {validMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">⏰</div>
            <p className="text-gray-600">No timestamped messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {validMessages.map((message, index) => (
              <div key={message.uuid || index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {message.type === 'user' ? '👤 User' : '🤖 Assistant'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                    {message.message?.model && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {message.message.model}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {extractMessageContent(message)}
                  </div>
                  {message.toolUseResult && (
                    <div className="text-xs text-green-600 mt-1">
                      ✅ Tool execution completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolsView({ toolUsage }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Tool Usage</h3>
        <p className="text-sm text-gray-600">
          {toolUsage.length} tool call{toolUsage.length !== 1 ? 's' : ''} in this session
        </p>
      </div>
      
      <div className="p-4">
        {toolUsage.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🔧</div>
            <p className="text-gray-600">No tools were used in this session</p>
          </div>
        ) : (
          <div className="space-y-4">
            {toolUsage.map((tool, index) => (
              <div key={tool.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-600">🔧</span>
                    <span className="font-medium text-gray-900">{tool.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(tool.timestamp).toLocaleString()}
                  </span>
                </div>
                
                {tool.input && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Input:</div>
                    <pre className="text-xs bg-gray-50 p-2 rounded border overflow-auto">
                      {JSON.stringify(tool.input, null, 2)}
                    </pre>
                  </div>
                )}
                
                {tool.result && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Result:</div>
                    <pre className="text-xs bg-green-50 p-2 rounded border overflow-auto">
                      {JSON.stringify(tool.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsView({ stats, session }) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalMessages}</div>
            <div className="text-sm text-gray-600 mt-1">Total Messages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.userMessages}</div>
            <div className="text-sm text-gray-600 mt-1">User Messages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.assistantMessages}</div>
            <div className="text-sm text-gray-600 mt-1">Assistant Messages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.toolCalls}</div>
            <div className="text-sm text-gray-600 mt-1">Tool Calls</div>
          </div>
        </div>
      </div>

      {/* Token Usage */}
      {stats.totalTokens > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Usage</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inputTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Input Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.outputTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Output Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Total Tokens</div>
            </div>
          </div>
        </div>
      )}

      {/* Session Metadata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Metadata</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Session ID:</span>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{session.sessionId}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium">{session.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">User Type:</span>
            <span className="font-medium">{session.userType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{stats.duration}</span>
          </div>
          {session.cwd && (
            <div className="flex justify-between">
              <span className="text-gray-600">Working Directory:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded max-w-md truncate">
                {session.cwd}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RawJsonlView({ messages }) {
  const jsonlText = messages.map(msg => JSON.stringify(msg)).join('\n');
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Raw JSONL Data</h3>
        <p className="text-sm text-gray-600">Complete JSONL representation of the session</p>
      </div>
      <div className="p-4">
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96">
          <code>{jsonlText}</code>
        </pre>
      </div>
    </div>
  );
}

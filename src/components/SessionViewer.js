import { useState } from 'react';
import MessageBubble from './MessageBubble';
import SessionHeader from './SessionHeader';
import TranscriptView from './TranscriptView';

export default function SessionViewer({ session }) {
  const [activeView, setActiveView] = useState('conversation');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyRawData = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(session, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(session, null, 2);
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
      <SessionHeader session={session} />
      
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
            onClick={() => setActiveView('prompts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'prompts'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User Prompts
          </button>
          <button
            onClick={() => setActiveView('transcript')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'transcript'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transcript View
          </button>
          <button
            onClick={() => setActiveView('raw')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'raw'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Raw Data
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
              <span>Copy Raw Data</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      {activeView === 'conversation' && (
        <ConversationView session={session} />
      )}
      
      {activeView === 'prompts' && (
        <PromptsView session={session} />
      )}
      
      {activeView === 'transcript' && (
        <TranscriptView session={session} />
      )}
      
      {activeView === 'raw' && (
        <RawDataView session={session} />
      )}
    </div>
  );
}

function PromptsView({ session }) {
  const { history } = session;
  
  // Extract all user prompts from the session history
  const userPrompts = [];
  
  history.forEach((exchange, exchangeIndex) => {
    exchange.forEach((message, messageIndex) => {
      // Check for top-level Prompt structure
      if (message.Prompt) {
        userPrompts.push({
          exchangeIndex,
          messageIndex,
          content: message.Prompt.prompt,
          additionalContext: message.additional_context,
          envContext: message.env_context
        });
      }
      // Check for nested content.Prompt structure
      else if (message.content?.Prompt) {
        userPrompts.push({
          exchangeIndex,
          messageIndex,
          content: message.content.Prompt.prompt,
          additionalContext: message.additional_context,
          envContext: message.env_context
        });
      }
    });
  });

  if (userPrompts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">👤</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No User Prompts Found</h3>
        <p className="text-gray-600">This session doesn't contain any user prompts to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">User Prompts</h3>
        <p className="text-sm text-gray-600">
          Found {userPrompts.length} user prompt{userPrompts.length !== 1 ? 's' : ''} in this session
        </p>
      </div>
      
      {userPrompts.map((prompt, index) => (
        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">👤</span>
              <span className="font-medium text-sm text-blue-900">User Prompt #{index + 1}</span>
            </div>
            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
              Exchange {prompt.exchangeIndex + 1}
            </span>
          </div>
          
          <div className="text-blue-900 whitespace-pre-wrap mb-4">
            {prompt.content}
          </div>
          
          {prompt.additionalContext && (
            <div className="mt-4 p-3 bg-blue-100 rounded border-l-4 border-blue-400">
              <h4 className="text-xs font-medium text-blue-800 mb-1">Additional Context</h4>
              <div className="text-xs text-blue-700 whitespace-pre-wrap">
                {prompt.additionalContext}
              </div>
            </div>
          )}
          
          {prompt.envContext?.env_state && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Environment Context</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>OS:</strong> {prompt.envContext.env_state.operating_system}</div>
                <div><strong>Working Directory:</strong> {prompt.envContext.env_state.current_working_directory}</div>
                {prompt.envContext.env_state.environment_variables?.length > 0 && (
                  <div><strong>Environment Variables:</strong> {prompt.envContext.env_state.environment_variables.length} set</div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ConversationView({ session }) {
  const { history } = session;

  return (
    <div className="space-y-6">
      {history.map((exchange, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Exchange {index + 1}
            </h3>
            <span className="text-sm text-gray-500">
              {exchange.length} message{exchange.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-4">
            {exchange.map((message, msgIndex) => (
              <MessageBubble key={msgIndex} message={message} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RawDataView({ session }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Raw Session Data</h3>
        <p className="text-sm text-gray-600">Complete JSON representation of the session</p>
      </div>
      <div className="p-4">
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
          <code>{JSON.stringify(session, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { SESSION_TYPES } from '../utils/sessionParser';
import SessionReplay from './SessionReplay';

export default function UnifiedSessionViewer({ session }) {
  const [activeView, setActiveView] = useState('conversation');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(false);

  const handleCopyRawData = async () => {
    try {
      const dataText = typeof session.rawData === 'string' 
        ? session.rawData 
        : JSON.stringify(session.rawData, null, 2);
      
      await navigator.clipboard.writeText(dataText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = typeof session.rawData === 'string' 
        ? session.rawData 
        : JSON.stringify(session.rawData, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Show replay mode if activated
  if (isReplayMode) {
    return <SessionReplay session={session} onExit={() => setIsReplayMode(false)} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Session Header */}
      <SessionHeader session={session} onStartReplay={() => setIsReplayMode(true)} />
      
      {/* View Toggle and Copy Button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <ViewToggleButton
            active={activeView === 'conversation'}
            onClick={() => setActiveView('conversation')}
            label="Conversation"
          />
          <ViewToggleButton
            active={activeView === 'timeline'}
            onClick={() => setActiveView('timeline')}
            label="Timeline"
          />
          <ViewToggleButton
            active={activeView === 'tools'}
            onClick={() => setActiveView('tools')}
            label={`Tools (${session.stats.toolCalls})`}
          />
          <ViewToggleButton
            active={activeView === 'stats'}
            onClick={() => setActiveView('stats')}
            label="Statistics"
          />
          <ViewToggleButton
            active={activeView === 'raw'}
            onClick={() => setActiveView('raw')}
            label="Raw Data"
          />
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
              <CheckIcon />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon />
              <span>Copy Raw Data</span>
            </>
          )}
        </button>
      </div>

      {/* Content Views */}
      {activeView === 'conversation' && <ConversationView session={session} />}
      {activeView === 'timeline' && <TimelineView session={session} />}
      {activeView === 'tools' && <ToolsView session={session} />}
      {activeView === 'stats' && <StatsView session={session} />}
      {activeView === 'raw' && <RawDataView session={session} />}
    </div>
  );
}

function ViewToggleButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function SessionHeader({ session, onStartReplay }) {
  const getSessionIcon = (type) => {
    switch (type) {
      case SESSION_TYPES.Q_CHAT:
        return '🤖';
      case SESSION_TYPES.CLAUDE_CODE:
        return '🧠';
      case SESSION_TYPES.CURSOR:
        return '⚡';
      case SESSION_TYPES.GEMINI_CLI:
        return '💎';
      default:
        return '❓';
    }
  };

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case SESSION_TYPES.Q_CHAT:
        return 'Amazon Q Chat';
      case SESSION_TYPES.CLAUDE_CODE:
        return 'Claude Code';
      case SESSION_TYPES.CURSOR:
        return 'Cursor';
      case SESSION_TYPES.GEMINI_CLI:
        return 'Gemini CLI';
      default:
        return 'Unknown Format';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{getSessionIcon(session.type)}</span>
            <h1 className="text-2xl font-bold text-gray-900">
              {session.title}
            </h1>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {getSessionTypeLabel(session.type)}
            </span>
            {/* Replay Button */}
            <button
              onClick={onStartReplay}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Start interactive replay"
            >
              <PlayIcon />
              <span>Replay</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span>ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{session.id}</code></span>
            {session.metadata.version && (
              <>
                <span>•</span>
                <span>Version: {session.metadata.version}</span>
              </>
            )}
            {session.metadata.duration && (
              <>
                <span>•</span>
                <span>Duration: {session.metadata.duration}</span>
              </>
            )}
          </div>
          
          {session.metadata.cwd && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Working Directory:</span>
              <code className="ml-1 bg-gray-100 px-2 py-1 rounded">{session.metadata.cwd}</code>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{session.stats.totalMessages}</div>
          <div className="text-sm text-gray-600">Total Messages</div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            value={session.stats.userMessages}
            label="User Messages"
            color="text-green-600"
          />
          <StatCard
            value={session.stats.assistantMessages}
            label="Assistant Messages"
            color="text-purple-600"
          />
          <StatCard
            value={session.stats.toolCalls}
            label="Tool Calls"
            color="text-orange-600"
          />
          <StatCard
            value={session.stats.totalTokens > 0 ? session.stats.totalTokens.toLocaleString() : 'N/A'}
            label="Total Tokens"
            color="text-blue-600"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ConversationView({ session }) {
  const [allCodeBlocksCollapsed, setAllCodeBlocksCollapsed] = useState(false);
  const [forceCollapseToggle, setForceCollapseToggle] = useState(0);

  const handleToggleAll = () => {
    setAllCodeBlocksCollapsed(!allCodeBlocksCollapsed);
    setForceCollapseToggle(prev => prev + 1);
  };

  if (session.messages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
        <p className="text-gray-600">This session doesn't contain any messages to display.</p>
      </div>
    );
  }

  // Check if there are any code blocks in the session
  const hasCodeBlocks = session.messages.some(message => 
    getContentType(message.content, message) === 'code'
  );

  return (
    <div className="space-y-4">
      {/* Sticky Code Block Controls */}
      {hasCodeBlocks && (
        <div className="sticky top-20 z-30 flex justify-end mb-4">
          <div className="flex items-center space-x-3 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 backdrop-blur-sm bg-white/95">
            <span className="text-sm text-gray-600 font-medium">Code Blocks:</span>
            <button
              onClick={handleToggleAll}
              className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                allCodeBlocksCollapsed 
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                  : 'bg-gray-600 text-white shadow-md hover:bg-gray-700'
              }`}
            >
              <span className={`${
                allCodeBlocksCollapsed ? 'rotate-0' : 'rotate-90'
              }`}>
                ▶️
              </span>
              <span className="font-medium">
                {allCodeBlocksCollapsed ? 'Expand All' : 'Collapse All'}
              </span>
            </button>
          </div>
        </div>
      )}
      
      {/* Messages */}
      {session.messages.map((message) => (
        <UnifiedMessageBubble 
          key={message.id} 
          message={message} 
          sessionType={session.type}
          allCodeBlocksCollapsed={allCodeBlocksCollapsed}
          forceCollapseToggle={forceCollapseToggle}
        />
      ))}
    </div>
  );
}

// Helper function to determine content type based on file extension and patterns
function getContentType(content, message) {
  if (!content || typeof content !== 'string') return 'text';
  
  // User messages should never be treated as code blocks
  if (message?.type === 'user') {
    return 'text';
  }
  
  // Clean content for pattern detection first
  const cleanContent = cleanContentForMarkdown(content);
  
  // Check if this is a tool result with file information
  let filePath = null;
  if (message?.metadata?.toolUseResult?.file?.filePath) {
    filePath = message.metadata.toolUseResult.file.filePath;
  }
  
  // If we have a file path, use the extension to determine type
  if (filePath) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    // Code file extensions (removed 'json' from here since we want to handle JSON specially)
    const codeExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cc', 'cxx', 'h', 'hpp',
      'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sh', 'bash', 'zsh',
      'fish', 'ps1', 'bat', 'cmd', 'sql', 'xml', 'yaml', 'yml', 'toml',
      'ini', 'cfg', 'conf', 'env', 'css', 'scss', 'sass', 'less', 'html', 'htm',
      'vue', 'svelte', 'astro', 'r', 'R', 'matlab', 'm', 'pl', 'pm', 'lua', 'vim',
      'ex', 'exs', 'elm', 'hs', 'lhs', 'clj', 'cljs', 'cljc', 'edn', 'ml', 'mli',
      'fs', 'fsi', 'fsx', 'dart', 'jl', 'nim', 'cr', 'zig', 'v', 'vv'
    ];
    
    // Markdown file extensions
    const markdownExtensions = ['md', 'markdown', 'mdown', 'mkd', 'mdx'];
    
    // JSON file extension - handle specially
    if (extension === 'json') {
      // For JSON files, check if it's data or code
      const cleanContent = cleanContentForMarkdown(content);
      const hasJsonStructure = /^\s*\{[\s\S]*\}\s*$/.test(cleanContent.trim());
      if (hasJsonStructure) {
        try {
          JSON.parse(cleanContent.trim());
          // If it's valid JSON and contains common message/data fields, treat as text/data
          if (/["'](?:id|type|content|timestamp|metadata|role)["']\s*:/.test(cleanContent)) {
            return 'text';
          }
        } catch (e) {
          // If JSON parsing fails, treat as code
        }
      }
      return 'code'; // Default for JSON files if not data
    }
    
    if (codeExtensions.includes(extension)) {
      return 'code';
    }
    
    if (markdownExtensions.includes(extension)) {
      return 'markdown';
    }
  }
  
  // Check for code patterns (these should override markdown detection)
  const codePatterns = [
    /^(import|export|from|require)\s+/m,           // JS/TS imports
    /^(function|const|let|var|class)\s+/m,         // JS/TS declarations
    /^(def|class|import|from)\s+/m,                // Python
    /^(public|private|protected|static)\s+/m,      // Java/C#/C++
    /^(#include|#define|#ifndef)\s+/m,             // C/C++
    /^(package|func|import|var)\s+/m,              // Go
    /^(use|fn|impl|struct|enum)\s+/m,              // Rust
    /^\s*<[a-zA-Z][^>]*>/m,                        // HTML/XML tags
    /^\s*[a-zA-Z-]+\s*:\s*[^;}]+;\s*$/m,          // CSS properties (must end with semicolon and be more specific)
    /^SELECT|INSERT|UPDATE|DELETE|CREATE|DROP/im,  // SQL
  ];
  
  if (codePatterns.some(pattern => pattern.test(cleanContent))) {
    return 'code';
  }
  
  // Check for markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers
    /\*\*.*?\*\*/,           // Bold
    /^\s*[-*+]\s+/m,         // Lists
    /^\s*\d+\.\s+/m,         // Numbered lists
    /\[.*?\]\(.*?\)/,        // Links
    /!\[.*?\]\(.*?\)/,       // Images
    /^\s*\|.*\|.*\|/m,       // Tables
    /^\s*>\s+/m,             // Blockquotes
    /---+/,                  // Horizontal rules
  ];
  
  if (markdownPatterns.some(pattern => pattern.test(cleanContent))) {
    return 'markdown';
  }
  
  return 'text';
}

// Helper function to detect language from file extension
function getLanguageFromPath(filePath) {
  if (!filePath) return '';
  
  const extension = filePath.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript', 
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'bash',
    'ps1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',
    'sql': 'sql',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'html': 'html',
    'htm': 'html',
    'vue': 'vue',
    'svelte': 'svelte',
    'r': 'r',
    'R': 'r',
    'matlab': 'matlab',
    'm': 'matlab',
    'pl': 'perl',
    'lua': 'lua',
    'vim': 'vim',
    'ex': 'elixir',
    'exs': 'elixir',
    'elm': 'elm',
    'hs': 'haskell',
    'clj': 'clojure',
    'ml': 'ocaml',
    'fs': 'fsharp',
    'dart': 'dart',
    'jl': 'julia',
    'nim': 'nim',
    'cr': 'crystal',
    'zig': 'zig'
  };
  
  return languageMap[extension] || extension || '';
}

// Helper function to clean content for markdown rendering
function cleanContentForMarkdown(content) {
  if (!content || typeof content !== 'string') return content;
  
  let cleanedContent = content;
  
  // Remove "Tool result:" prefix if present
  cleanedContent = cleanedContent.replace(/^Tool result:\s*/i, '');
  
  // Remove line numbers (like "1→", "2→", etc.)
  cleanedContent = cleanedContent.replace(/^\s*\d+→/gm, '');
  
  return cleanedContent.trim();
}

function CodeBlock({ content, language, filePath, isUser, allCodeBlocksCollapsed, forceCollapseToggle }) {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // React to global collapse/expand controls immediately
  React.useEffect(() => {
    if (forceCollapseToggle > 0) {
      setIsCollapsed(allCodeBlocksCollapsed);
    }
  }, [allCodeBlocksCollapsed, forceCollapseToggle]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get appropriate syntax highlighting theme
  const syntaxTheme = isUser ? vscDarkPlus : vs;
  
  // Custom style overrides for better integration
  const customStyle = {
    margin: 0,
    padding: '1rem',
    background: 'transparent',
    fontSize: '0.875rem',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  };

  const lineNumberStyle = {
    minWidth: '3rem',
    paddingRight: '1rem',
    textAlign: 'right',
    userSelect: 'none',
    opacity: 0.6,
  };

  return (
    <div className={`rounded-lg overflow-hidden ${
      isUser 
        ? 'bg-gray-900 border border-gray-700' 
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      {/* Header with file path and controls */}
      <div className={`px-4 py-2 border-b flex items-center justify-between ${
        isUser 
          ? 'bg-gray-800 border-gray-700 text-gray-100' 
          : 'bg-gray-50 border-gray-200 text-gray-700'
      }`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-sm hover:opacity-70 ${
              isUser ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            <span className={`inline-block ${
              isCollapsed ? 'rotate-0' : 'rotate-90'
            }`}>
              ▶️
            </span>
          </button>
          <span className="text-sm font-mono">📄</span>
          <span className="text-sm font-medium">{filePath || 'Code Block'}</span>
          {language && (
            <span className={`text-xs px-2 py-1 rounded ${
              isUser 
                ? 'bg-gray-700 text-gray-200' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {language}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isCollapsed && (
            <>
              <button
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isUser 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                {showLineNumbers ? 'Hide' : 'Show'} Lines
              </button>
              <button
                onClick={handleCopy}
                className={`text-xs px-2 py-1 rounded flex items-center space-x-1 transition-colors ${
                  copySuccess
                    ? (isUser ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700')
                    : (isUser ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600')
                }`}
              >
                {copySuccess ? (
                  <>
                    <span>✓</span>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Code content - CSS display toggle for maximum speed */}
      <div 
        className={`overflow-x-auto ${
          isUser 
            ? 'bg-gray-900' 
            : 'bg-white'
        }`}
        style={{ display: isCollapsed ? 'none' : 'block' }}
      >
        <SyntaxHighlighter
          language={language || 'text'}
          style={syntaxTheme}
          showLineNumbers={showLineNumbers}
          customStyle={customStyle}
          lineNumberStyle={lineNumberStyle}
          wrapLines={true}
          wrapLongLines={false}
        >
          {content}
        </SyntaxHighlighter>
      </div>
      
      {/* Collapsed state preview - CSS display toggle */}
      <div 
        className={`px-4 py-2 text-sm italic ${
          isUser ? 'text-gray-400' : 'text-gray-500'
        }`}
        style={{ display: isCollapsed ? 'block' : 'none' }}
      >
        {content.split('\n').length} lines • Click to expand
      </div>
    </div>
  );
}

function UnifiedMessageBubble({ message, sessionType, allCodeBlocksCollapsed, forceCollapseToggle }) {
  const [showRawData, setShowRawData] = useState(false);
  const [showToolDetails, setShowToolDetails] = useState(false);

  // Determine message alignment and styling
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';
  const isSystem = message.type === 'system' || message.type === 'tool';
  
  // Determine content type
  const contentType = getContentType(message.content, message);
  const shouldRenderMarkdown = contentType === 'markdown';
  const shouldRenderCode = contentType === 'code';

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
            <span className="font-medium capitalize">
              {message.type}
              {message.role && message.role !== message.type && ` (${message.role})`}
            </span>
            <span>•</span>
            <span>{message.timestamp.toLocaleString()}</span>
            {message.metadata?.model && (
              <>
                <span>•</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {message.metadata.model}
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
          {/* Main Content */}
          <div className="mb-3">
            {shouldRenderCode ? (
              <CodeBlock 
                content={cleanContentForMarkdown(message.content)}
                language={getLanguageFromPath(message?.metadata?.toolUseResult?.file?.filePath)}
                filePath={message?.metadata?.toolUseResult?.file?.filePath}
                isUser={isUser}
                allCodeBlocksCollapsed={allCodeBlocksCollapsed}
                forceCollapseToggle={forceCollapseToggle}
              />
            ) : shouldRenderMarkdown ? (
              <div className={`${isUser ? 'text-white' : 'text-gray-700'}`}>
                <ReactMarkdown 
                  components={{
                    h1: ({children}) => (
                      <h1 className={`text-xl font-bold mb-2 ${
                        isUser ? 'text-blue-100' : 'text-gray-900'
                      }`}>
                        {children}
                      </h1>
                    ),
                    h2: ({children}) => (
                      <h2 className={`text-lg font-bold mb-2 ${
                        isUser ? 'text-blue-100' : 'text-gray-900'
                      }`}>
                        {children}
                      </h2>
                    ),
                    h3: ({children}) => (
                      <h3 className={`text-base font-bold mb-1 ${
                        isUser ? 'text-blue-100' : 'text-gray-900'
                      }`}>
                        {children}
                      </h3>
                    ),
                    p: ({children}) => (
                      <p className={`mb-2 ${
                        isUser ? 'text-white' : 'text-gray-700'
                      }`}>
                        {children}
                      </p>
                    ),
                    strong: ({children}) => (
                      <strong className={`font-bold ${
                        isUser ? 'text-blue-100' : 'text-gray-900'
                      }`}>
                        {children}
                      </strong>
                    ),
                    em: ({children}) => (
                      <em className={`italic ${
                        isUser ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {children}
                      </em>
                    ),
                    ul: ({children}) => (
                      <ul className={`list-disc list-inside mb-2 space-y-0.5 ${
                        isUser ? 'text-white' : 'text-gray-700'
                      }`}>
                        {children}
                      </ul>
                    ),
                    ol: ({children}) => (
                      <ol className={`list-decimal list-inside mb-2 space-y-0.5 ${
                        isUser ? 'text-white' : 'text-gray-700'
                      }`}>
                        {children}
                      </ol>
                    ),
                    li: ({children}) => (
                      <li className={`${
                        isUser ? 'text-white' : 'text-gray-700'
                      }`}>
                        {children}
                      </li>
                    ),
                    code: ({node, inline, className, children, ...props}) => {
                      // More explicit inline detection
                      const isInline = inline || !node || node.tagName !== 'pre';
                      
                      if (isInline) {
                        return (
                          <code 
                            className={`px-1 py-0.5 rounded text-sm font-mono ${
                              isUser 
                                ? 'bg-blue-500 text-blue-100' 
                                : 'bg-gray-100 text-gray-900'
                            }`} 
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <pre className={`p-3 rounded-lg overflow-x-auto mb-3 ${
                          isUser 
                            ? 'bg-blue-500 text-blue-100' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <code className="text-sm font-mono" {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    pre: ({children}) => {
                      // Handle pre tags separately to ensure block code works correctly
                      return children;
                    },
                    blockquote: ({children}) => (
                      <blockquote className={`border-l-4 pl-4 italic mb-3 ${
                        isUser 
                          ? 'border-blue-300 text-blue-100' 
                          : 'border-gray-300 text-gray-600'
                      }`}>
                        {children}
                      </blockquote>
                    ),
                    table: ({children}) => (
                      <div className="overflow-x-auto mb-3">
                        <table className={`min-w-full divide-y ${
                          isUser 
                            ? 'divide-blue-400' 
                            : 'divide-gray-200'
                        }`}>
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({children}) => (
                      <th className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                        isUser 
                          ? 'bg-blue-500 text-blue-100' 
                          : 'bg-gray-50 text-gray-500'
                      }`}>
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className={`px-3 py-2 text-sm ${
                        isUser 
                          ? 'text-blue-100' 
                          : 'text-gray-900'
                      }`}>
                        {children}
                      </td>
                    ),
                    a: ({children, href}) => (
                      <a 
                        href={href}
                        className={`underline ${
                          isUser 
                            ? 'text-blue-200 hover:text-blue-100' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => (
                      <hr className={`my-4 border-t ${
                        isUser ? 'border-blue-300' : 'border-gray-300'
                      }`} />
                    )
                  }}
                >
                  {cleanContentForMarkdown(message.content)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            )}
          </div>
          
          {/* Tool Calls */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.toolCalls.map((tool, index) => (
                <UnifiedToolUseDisplay 
                  key={tool.id || index} 
                  toolUse={tool} 
                  isUser={isUser}
                />
              ))}
            </div>
          )}
          
          {/* Tool Results */}
          {message.toolResults && message.toolResults.length > 0 && (
            <UnifiedToolResultDisplay 
              results={message.toolResults} 
              showDetails={showToolDetails}
              onToggleDetails={() => setShowToolDetails(!showToolDetails)}
              isUser={isUser}
            />
          )}

          {/* Usage Statistics */}
          {message.metadata?.usage && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <UsageStats usage={message.metadata.usage} isUser={isUser} />
            </div>
          )}

          {/* Additional Context for Q Chat */}
          {message.metadata?.additional_context && (
            <div className={`mt-3 p-3 rounded border-l-4 ${
              isUser 
                ? 'bg-blue-500 border-blue-300 text-blue-100' 
                : 'bg-blue-100 border-blue-400 text-blue-800'
            }`}>
              <div className="text-xs font-medium mb-1">Additional Context</div>
              <div className="text-xs whitespace-pre-wrap">
                {message.metadata.additional_context}
              </div>
            </div>
          )}
          
          {/* Environment Context */}
          {message.metadata?.env_context?.env_state && (
            <div className={`mt-3 p-3 rounded ${
              isUser ? 'bg-blue-500 text-blue-100' : 'bg-gray-50 text-gray-700'
            }`}>
              <div className="text-xs font-medium mb-2">Environment Context</div>
              <div className="text-xs space-y-1">
                <div><strong>OS:</strong> {message.metadata.env_context.env_state.operating_system}</div>
                <div><strong>Working Directory:</strong> {message.metadata.env_context.env_state.current_working_directory}</div>
              </div>
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
          {message.id && (
            <span className="text-gray-400">
              ID: {message.id.toString().slice(0, 8)}...
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

function UnifiedToolUseDisplay({ toolUse, isUser }) {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className={`rounded-lg p-4 ${
      isUser 
        ? 'bg-blue-500 border border-blue-400' 
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={isUser ? 'text-blue-100' : 'text-yellow-600'}>🔧</span>
          <span className={`font-medium ${
            isUser ? 'text-blue-100' : 'text-yellow-900'
          }`}>
            Tool: {toolUse.name}
          </span>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className={`text-xs underline ${
            isUser 
              ? 'text-blue-200 hover:text-blue-100' 
              : 'text-yellow-600 hover:text-yellow-800'
          }`}
        >
          {showInput ? 'Hide' : 'Show'} Input
        </button>
      </div>
      
      <div className="space-y-2">
        {toolUse.id && (
          <div className={`text-xs ${
            isUser ? 'text-blue-200' : 'text-yellow-600'
          }`}>
            ID: {toolUse.id}
          </div>
        )}

        {/* Show summary if available (Q Chat feature) */}
        {toolUse.metadata?.summary && (
          <div className={`text-sm ${
            isUser ? 'text-blue-100' : 'text-yellow-800'
          }`}>
            <span className="font-medium">Summary:</span> {toolUse.metadata.summary}
          </div>
        )}

        {/* Show original name if different (Q Chat feature) */}
        {toolUse.metadata?.orig_name && toolUse.metadata.orig_name !== toolUse.name && (
          <div className={`text-xs ${
            isUser ? 'text-blue-200' : 'text-yellow-600'
          }`}>
            Original Name: {toolUse.metadata.orig_name}
          </div>
        )}
      </div>

      {showInput && toolUse.input && (
        <div className={`mt-3 space-y-3`}>
          {/* Main input parameters */}
          <div className={`p-3 rounded ${
            isUser 
              ? 'bg-blue-400 text-blue-100' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className="text-sm font-medium mb-2">Input Parameters:</div>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(toolUse.input, null, 2)}
            </pre>
          </div>

          {/* Original arguments if different (Q Chat feature) */}
          {toolUse.metadata?.orig_args && 
           JSON.stringify(toolUse.metadata.orig_args) !== JSON.stringify(toolUse.input) && (
            <div className={`p-3 rounded ${
              isUser 
                ? 'bg-blue-300 text-blue-100' 
                : 'bg-yellow-200 text-yellow-800'
            }`}>
              <div className="text-sm font-medium mb-2">Original Arguments:</div>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(toolUse.metadata.orig_args, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UnifiedToolResultDisplay({ results, showDetails, onToggleDetails, isUser }) {
  if (!results || results.length === 0) return null;

  return (
    <div className={`mt-3 pt-3 ${
      isUser ? 'border-t border-blue-400' : 'border-t border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={isUser ? 'text-blue-100' : 'text-yellow-600'}>✅</span>
          <span className={`font-medium text-sm ${
            isUser ? 'text-blue-100' : 'text-gray-700'
          }`}>
            Tool Execution Results
          </span>
        </div>
        <button
          onClick={onToggleDetails}
          className={`text-xs underline ml-4 ${
            isUser 
              ? 'text-blue-200 hover:text-blue-100' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {showDetails && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className={`p-3 rounded ${
              isUser 
                ? 'bg-blue-500 text-blue-100' 
                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            }`}>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsageStats({ usage, isUser }) {
  return (
    <div className={`flex items-center space-x-4 text-xs ${
      isUser ? 'text-blue-200' : 'text-gray-500'
    }`}>
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
        <span className={`px-2 py-1 rounded ${
          isUser 
            ? 'bg-blue-500 text-blue-100' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {usage.service_tier}
        </span>
      )}
    </div>
  );
}

function TimelineView({ session }) {
  const sortedMessages = [...session.messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Session Timeline</h3>
        <p className="text-sm text-gray-600">Chronological view of all session events</p>
      </div>
      
      <div className="p-4">
        {sortedMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">⏰</div>
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMessages.map((message, index) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {message.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleString()}
                    </span>
                    {message.metadata?.model && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {message.metadata.model}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {message.content}
                  </div>
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      🔧 {message.toolCalls.length} tool call{message.toolCalls.length !== 1 ? 's' : ''}
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

function ToolsView({ session }) {
  const toolCalls = [];
  
  session.messages.forEach(message => {
    if (message.toolCalls && message.toolCalls.length > 0) {
      message.toolCalls.forEach(tool => {
        toolCalls.push({
          ...tool,
          messageId: message.id,
          messageTimestamp: message.timestamp,
          messageType: message.type
        });
      });
    }
  });
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Tool Usage</h3>
        <p className="text-sm text-gray-600">
          {toolCalls.length} tool call{toolCalls.length !== 1 ? 's' : ''} in this session
        </p>
      </div>
      
      <div className="p-4">
        {toolCalls.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🔧</div>
            <p className="text-gray-600">No tools were used in this session</p>
          </div>
        ) : (
          <div className="space-y-4">
            {toolCalls.map((tool, index) => (
              <ToolCallDetailCard key={tool.id || index} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCallDetailCard({ tool }) {
  const [showInput, setShowInput] = useState(false);
  const [showOriginalArgs, setShowOriginalArgs] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-600">🔧</span>
          <span className="font-medium text-gray-900">{tool.name}</span>
          {tool.metadata?.orig_name && tool.metadata.orig_name !== tool.name && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              orig: {tool.metadata.orig_name}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {(tool.timestamp || tool.messageTimestamp).toLocaleString()}
        </span>
      </div>

      {/* Tool ID */}
      {tool.id && (
        <div className="text-xs text-gray-600 mb-2">
          ID: <code className="bg-gray-100 px-1 rounded">{tool.id}</code>
        </div>
      )}

      {/* Summary (Q Chat feature) */}
      {tool.metadata?.summary && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm font-medium text-blue-800 mb-1">Summary:</div>
          <div className="text-sm text-blue-700">{tool.metadata.summary}</div>
        </div>
      )}

      {/* Input Parameters */}
      {tool.input && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Input Parameters:</div>
            <button
              onClick={() => setShowInput(!showInput)}
              className="text-xs text-yellow-600 hover:text-yellow-800 underline"
            >
              {showInput ? 'Hide' : 'Show'}
            </button>
          </div>
          {showInput && (
            <pre className="text-xs bg-gray-50 p-2 rounded border overflow-auto">
              {JSON.stringify(tool.input, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Original Arguments (Q Chat feature) */}
      {tool.metadata?.orig_args && 
       JSON.stringify(tool.metadata.orig_args) !== JSON.stringify(tool.input) && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Original Arguments:</div>
            <button
              onClick={() => setShowOriginalArgs(!showOriginalArgs)}
              className="text-xs text-yellow-600 hover:text-yellow-800 underline"
            >
              {showOriginalArgs ? 'Hide' : 'Show'}
            </button>
          </div>
          {showOriginalArgs && (
            <pre className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200 overflow-auto">
              {JSON.stringify(tool.metadata.orig_args, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function StatsView({ session }) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{session.stats.totalMessages}</div>
            <div className="text-sm text-gray-600 mt-1">Total Messages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{session.stats.userMessages}</div>
            <div className="text-sm text-gray-600 mt-1">User Messages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{session.stats.assistantMessages}</div>
            <div className="text-sm text-gray-600 mt-1">Assistant Messages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{session.stats.toolCalls}</div>
            <div className="text-sm text-gray-600 mt-1">Tool Calls</div>
          </div>
        </div>
      </div>

      {/* Additional Message Types (if any) */}
      {(session.stats.toolMessages > 0 || session.stats.systemMessages > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Message Types</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {session.stats.toolMessages > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{session.stats.toolMessages}</div>
                <div className="text-sm text-gray-600 mt-1">Tool Messages</div>
              </div>
            )}
            {session.stats.systemMessages > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{session.stats.systemMessages}</div>
                <div className="text-sm text-gray-600 mt-1">System Messages</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Token Usage */}
      {session.stats.totalTokens > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Usage</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{session.stats.inputTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Input Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{session.stats.outputTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Output Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{session.stats.totalTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Total Tokens</div>
            </div>
          </div>
        </div>
      )}

      {/* Session Metadata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Metadata</h3>
        
        <div className="space-y-3">
          {/* Session ID */}
          <div className="flex justify-between">
            <span className="text-gray-600">Session ID:</span>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{session.id}</code>
          </div>
          
          {/* Session Type */}
          <div className="flex justify-between">
            <span className="text-gray-600">Session Type:</span>
            <span className="font-medium">{getSessionTypeLabel(session.type)}</span>
          </div>
          
          {/* Version (if available) */}
          {session.metadata.version && (
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">{session.metadata.version}</span>
            </div>
          )}
          
          {/* User Type (Claude Code) */}
          {session.metadata.userType && (
            <div className="flex justify-between">
              <span className="text-gray-600">User Type:</span>
              <span className="font-medium">{session.metadata.userType}</span>
            </div>
          )}
          
          {/* Duration */}
          {session.metadata.duration && (
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{session.metadata.duration}</span>
            </div>
          )}
          
          {/* Working Directory */}
          {session.metadata.cwd && (
            <div className="flex justify-between">
              <span className="text-gray-600">Working Directory:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded max-w-md truncate">
                {session.metadata.cwd}
              </code>
            </div>
          )}
          
          {/* Model (Q Chat) */}
          {session.metadata.model && (
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{session.metadata.model}</span>
            </div>
          )}
          
          {/* Conversation ID (Q Chat) */}
          {session.metadata.conversation_id && session.metadata.conversation_id !== session.id && (
            <div className="flex justify-between">
              <span className="text-gray-600">Conversation ID:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{session.metadata.conversation_id}</code>
            </div>
          )}
          
          {/* Valid History Range (Q Chat) */}
          {session.metadata.valid_history_range && (
            <div className="flex justify-between">
              <span className="text-gray-600">Valid History Range:</span>
              <span className="font-medium">
                [{session.metadata.valid_history_range[0]}, {session.metadata.valid_history_range[1]}]
              </span>
            </div>
          )}
          
          {/* Total Messages (metadata) */}
          {session.metadata.totalMessages && (
            <div className="flex justify-between">
              <span className="text-gray-600">Total Raw Messages:</span>
              <span className="font-medium">{session.metadata.totalMessages}</span>
            </div>
          )}
        </div>
      </div>

      {/* Q Chat Specific: Transcript Preview */}
      {session.metadata.transcript && Array.isArray(session.metadata.transcript) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Transcript Preview</h3>
          <div className="text-sm text-gray-600 mb-3">
            {session.metadata.transcript.length} transcript entries
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
            {session.metadata.transcript.slice(0, 5).map((entry, index) => (
              <div key={index} className="text-sm text-gray-700 mb-2 last:mb-0">
                {entry.length > 100 ? `${entry.substring(0, 100)}...` : entry}
              </div>
            ))}
            {session.metadata.transcript.length > 5 && (
              <div className="text-xs text-gray-500 mt-2">
                ... and {session.metadata.transcript.length - 5} more entries
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get session type label
function getSessionTypeLabel(type) {
  switch (type) {
    case SESSION_TYPES.Q_CHAT:
      return 'Amazon Q Chat';
    case SESSION_TYPES.CLAUDE_CODE:
      return 'Claude Code';
    case SESSION_TYPES.CURSOR:
      return 'Cursor';
    case SESSION_TYPES.GEMINI_CLI:
      return 'Gemini CLI';
    default:
      return 'Unknown Format';
  }
}

function RawDataView({ session }) {
  const rawText = typeof session.rawData === 'string' 
    ? session.rawData 
    : JSON.stringify(session.rawData, null, 2);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Raw Session Data</h3>
        <p className="text-sm text-gray-600">Complete raw data representation of the session</p>
      </div>
      <div className="p-4">
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96">
          <code>{rawText}</code>
        </pre>
      </div>
    </div>
  );
}

// Icon components
function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

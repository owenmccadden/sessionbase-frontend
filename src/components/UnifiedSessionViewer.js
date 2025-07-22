import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { SESSION_TYPES } from '../utils/sessionParser';
import SessionReplay from './SessionReplay';
import { useAuth } from '../contexts/AuthContext';
import { authenticatedFetch } from '../utils/auth';

export default function UnifiedSessionViewer({ session, onSessionUpdate, sessionId }) {
  const [activeView, setActiveView] = useState('conversation');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const { user } = useAuth();

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
      <SessionHeader 
        session={session} 
        onStartReplay={() => setIsReplayMode(true)} 
        user={user}
        onSessionUpdate={onSessionUpdate}
        sessionId={sessionId}
      />
      
      {/* View Toggle and Copy Button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <ViewToggleButton
            active={activeView === 'conversation'}
            onClick={() => setActiveView('conversation')}
            label="Conversation"
          />
          <ViewToggleButton
            active={activeView === 'user-prompts'}
            onClick={() => setActiveView('user-prompts')}
            label="User Prompts"
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
      {activeView === 'user-prompts' && <UserPromptsView session={session} />}
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

function SessionHeader({ session, onStartReplay, user, onSessionUpdate, sessionId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    title: session.metadata?.title || session.title || '',
    summary: session.metadata?.summary || '',
    tags: session.metadata?.tags || []
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is the owner of the session
  const isOwner = user && session.author && (
    user.id === session.author.userId || 
    user.userId === session.author.userId ||
    user.id === session.author.id
  );

  const handleSave = async () => {
    if (!isOwner) return;
    
    setIsSaving(true);
    try {
      const endpointUrl = process.env.NEXT_PUBLIC_ENDPOINT_URL || process.env.ENDPOINT_URL;
      const response = await authenticatedFetch(`${endpointUrl}/sessions/${sessionId}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedData.title,
          summary: editedData.summary,
          tags: editedData.tags
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        if (onSessionUpdate) {
          onSessionUpdate({
            ...session,
            metadata: {
              ...session.metadata,
              title: editedData.title,
              summary: editedData.summary,
              tags: editedData.tags
            }
          });
        }
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        console.error('Response Status:', response.status);
        throw new Error(`Failed to update session metadata: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating session metadata:', error);
      // Could add a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
      title: session.metadata?.title || session.title || '',
      summary: session.metadata?.summary || '',
      tags: session.metadata?.tags || []
    });
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedData.tags.includes(newTag.trim())) {
      setEditedData({
        ...editedData,
        tags: [...editedData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditedData({
      ...editedData,
      tags: editedData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleVisibilityToggle = async (isPrivate) => {
    if (!isOwner) return;
    
    try {
      const endpointUrl = process.env.NEXT_PUBLIC_ENDPOINT_URL || process.env.ENDPOINT_URL;
      const response = await authenticatedFetch(`${endpointUrl}/sessions/${sessionId}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: session.metadata?.title || session.title || '',
          summary: session.metadata?.summary || '',
          tags: session.metadata?.tags || [],
          isPrivate: isPrivate
        }),
      });

      if (response.ok) {
        if (onSessionUpdate) {
          onSessionUpdate({
            ...session,
            metadata: {
              ...session.metadata,
              isPrivate: isPrivate
            }
          });
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to update visibility:', errorText);
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  const getSessionIcon = (type) => {
    switch (type) {
      case SESSION_TYPES.Q_CHAT:
        return <img src="/q-logo.png" alt="Amazon Q" className="w-8 h-8" />;
      case SESSION_TYPES.CLAUDE_CODE:
        return <img src="/claude-logo.png" alt="Claude" className="w-8 h-8" />;
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 relative">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="mb-2">
            {isEditing ? (
              <input
                type="text"
                value={editedData.title}
                onChange={(e) => setEditedData({...editedData, title: e.target.value})}
                className="w-full text-2xl font-bold text-gray-900 border border-gray-300 rounded px-3 py-2 bg-white"
                placeholder="Session title"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">
                {session.metadata?.title || session.title}
              </h1>
            )}
          </div>
          
          {/* Action buttons - moved below title */}
          <div className="flex items-center space-x-2 mb-3">
            {/* Edit/Save/Cancel buttons */}
            {isOwner && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded transition-colors"
                    >
                      {isSaving ? (
                        <span className="animate-spin">⭮</span>
                      ) : (
                        <SaveIcon />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-medium rounded transition-colors"
                    >
                      <CancelIcon />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                )}
              </>
            )}
            
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
          
          {/* Summary */}
          {(isEditing || session.metadata?.summary) && (
            <div className="mb-3">
              {isEditing ? (
                <textarea
                  value={editedData.summary}
                  onChange={(e) => setEditedData({...editedData, summary: e.target.value})}
                  className="w-full text-gray-700 text-sm leading-relaxed border border-gray-300 rounded px-2 py-1 resize-none"
                  placeholder="Session summary"
                  rows="2"
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {session.metadata.summary}
                </p>
              )}
            </div>
          )}
          
          {/* Tags */}
          {(isEditing || (session.metadata?.tags && session.metadata.tags.length > 0)) && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {(isEditing ? editedData.tags : session.metadata.tags).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                    placeholder="Add tag"
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
          
          {session.metadata.cwd && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Working Directory:</span>
              <code className="ml-1 bg-gray-100 px-2 py-1 rounded">{session.metadata.cwd}</code>
            </div>
          )}
        </div>
        
        {/* Platform Badge - Top Right */}
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <span className="text-sm">{getSessionIcon(session.type)}</span>
          <span className="text-sm font-medium text-gray-700">
            {getSessionTypeLabel(session.type)}
          </span>
        </div>
      </div>
      
      {/* Visibility Badge - Bottom Right */}
      <div className="absolute bottom-4 right-4">
        <VisibilityBadge 
          isPrivate={session.metadata?.isPrivate === true} 
          onToggle={(isPrivate) => {
            if (isOwner) {
              handleVisibilityToggle(isPrivate);
            }
          }}
          isOwner={isOwner}
        />
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
  const [allMarkdownBlocksCollapsed, setAllMarkdownBlocksCollapsed] = useState(false);
  const [forceCollapseToggle, setForceCollapseToggle] = useState(0);
  const [forceMarkdownCollapseToggle, setForceMarkdownCollapseToggle] = useState(0);
  const [allToolUseBlocksHidden, setAllToolUseBlocksHidden] = useState(false);

  const handleToggleAll = () => {
    setAllCodeBlocksCollapsed(!allCodeBlocksCollapsed);
    setForceCollapseToggle(prev => prev + 1);
  };

  const handleToggleAllMarkdown = () => {
    setAllMarkdownBlocksCollapsed(!allMarkdownBlocksCollapsed);
    setForceMarkdownCollapseToggle(prev => prev + 1);
  };

  const handleToggleAllToolUse = () => {
    setAllToolUseBlocksHidden(!allToolUseBlocksHidden);
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

  // Check if there are any markdown blocks in the session
  const hasMarkdownBlocks = session.messages.some(message => 
    getContentType(message.content, message) === 'markdown'
  );

  // Check if there are any tool use blocks in the session
  const hasToolUseBlocks = session.messages.some(message => 
    message.toolCalls && message.toolCalls.length > 0
  );

  return (
    <div className="space-y-4">
      {/* Sticky Controls */}
      {(hasCodeBlocks || hasMarkdownBlocks || hasToolUseBlocks) && (
        <div className="fixed top-20 right-2 z-30">
          <div className="flex flex-col items-end space-y-2 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 backdrop-blur-sm bg-white/95">
            {/* Code Blocks Toggle */}
            {hasCodeBlocks && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">Code Blocks:</span>
                <button
                  onClick={handleToggleAll}
                  className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                    allCodeBlocksCollapsed 
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                      : 'bg-gray-600 text-white shadow-md hover:bg-gray-700'
                  }`}
                >
                  {allCodeBlocksCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                  <span className="font-medium">
                    {allCodeBlocksCollapsed ? 'Expand All' : 'Collapse All'}
                  </span>
                </button>
              </div>
            )}

            {/* Markdown Blocks Toggle */}
            {hasMarkdownBlocks && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">Markdown Blocks:</span>
                <button
                  onClick={handleToggleAllMarkdown}
                  className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                    allMarkdownBlocksCollapsed 
                      ? 'bg-green-600 text-white shadow-md hover:bg-green-700' 
                      : 'bg-gray-600 text-white shadow-md hover:bg-gray-700'
                  }`}
                >
                  {allMarkdownBlocksCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                  <span className="font-medium">
                    {allMarkdownBlocksCollapsed ? 'Expand All' : 'Collapse All'}
                  </span>
                </button>
              </div>
            )}
            
            {/* Tool Use Blocks Toggle */}
            {hasToolUseBlocks && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">Tool Use:</span>
                <button
                  onClick={handleToggleAllToolUse}
                  className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                    allToolUseBlocksHidden 
                      ? 'bg-orange-600 text-white shadow-md hover:bg-orange-700' 
                      : 'bg-gray-600 text-white shadow-md hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium">
                    {allToolUseBlocksHidden ? 'Show All' : 'Hide All'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Messages */}
      {session.messages.map((message) => {
        // Hide entire message if it contains tool calls or tool results and tool use blocks are hidden
        const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
        const hasToolResults = message.toolResults && message.toolResults.length > 0;
        if ((hasToolCalls || hasToolResults) && allToolUseBlocksHidden) {
          return null;
        }
        
        return (
          <UnifiedMessageBubble 
            key={message.id} 
            message={message} 
            sessionType={session.type}
            allCodeBlocksCollapsed={allCodeBlocksCollapsed}
            forceCollapseToggle={forceCollapseToggle}
            allMarkdownBlocksCollapsed={allMarkdownBlocksCollapsed}
            forceMarkdownCollapseToggle={forceMarkdownCollapseToggle}
            allToolUseBlocksHidden={allToolUseBlocksHidden}
            session={session}
          />
        );
      })}
    </div>
  );
}

// Conservative heuristics to detect if user content is likely a code block
function detectUserCodeContent(content) {
  if (!content || typeof content !== 'string') return 'text';
  
  const cleanContent = content.trim();
  
  // If content is very short (less than 3 lines), bias toward text unless very obvious
  const lines = cleanContent.split('\n');
  if (lines.length < 3 && cleanContent.length < 100) {
    // Only detect very obvious single-line code patterns
    const obviousSingleLineCode = [
      /^(import|export|from|require)\s+.+$/,           // JS/TS imports
      /^(function|const|let|var|class)\s+\w+.*[{(].*$/,  // JS/TS declarations with opening brace/paren
      /^(def|class)\s+\w+.*:.*$/,                      // Python def/class
      /^(public|private|protected|static)\s+(class|interface|enum)\s+\w+/,  // Java/C# class declarations
      /^#include\s*<.+>$/,                             // C/C++ includes
      /^(package|func|import|var)\s+/,                 // Go
      /^(use|fn|impl|struct|enum)\s+/,                 // Rust
    ];
    
    if (obviousSingleLineCode.some(pattern => pattern.test(cleanContent))) {
      return 'code';
    }
    return 'text';
  }
  
  // For longer content, use more comprehensive detection
  
  // Check for markdown fencing (very strong indicator)
  if (/^```[\w]*\s*\n[\s\S]*\n```\s*$/m.test(cleanContent)) {
    return 'code';
  }
  
  // Check for multiple clear code indicators (need at least 2 for confidence)
  let codeIndicators = 0;
  
  // Strong code patterns that are unlikely to appear in normal text
  const strongCodePatterns = [
    /^(import|export|from|require)\s+/m,              // Module imports
    /^(function|const|let|var|class)\s+\w+/m,         // JS/TS declarations  
    /^(def|class)\s+\w+.*:/m,                         // Python def/class
    /^(public|private|protected|static)\s+(class|interface|enum|void|int|string)/m, // Java/C# modifiers
    /^#include\s*[<"]/m,                              // C/C++ includes
    /^(package|func|import|var)\s+\w+/m,              // Go keywords
    /^(use|fn|impl|struct|enum)\s+/m,                 // Rust keywords
    /^\s*<[a-zA-Z][^>]*>/m,                           // HTML/XML tags
    /^SELECT|INSERT|UPDATE|DELETE|CREATE|DROP/im,     // SQL keywords
  ];
  
  // Count strong indicators
  codeIndicators += strongCodePatterns.filter(pattern => pattern.test(cleanContent)).length;
  
  // Additional indicators (weaker, so need more of these)
  const weakCodePatterns = [
    /[{}\[\]();]/,                                    // Common code punctuation
    /\w+\s*\(\s*.*\s*\)/,                            // Function calls
    /\w+\.\w+/,                                      // Object property access
    /[=!<>]=|[<>]/,                                  // Comparison operators
    /\+\+|--|[+\-*/%]=?/,                           // Arithmetic operators
    /\/\/.*$|\/\*[\s\S]*?\*\//m,                     // Comments
    /^\s*[\w\-]+\s*:\s*[^;]+;?\s*$/m,               // CSS-like property declarations
  ];
  
  // Count weak indicators
  const weakMatches = weakCodePatterns.filter(pattern => pattern.test(cleanContent)).length;
  codeIndicators += Math.min(weakMatches / 3, 2); // Cap weak indicators contribution
  
  // Structure-based indicators
  const structureIndicators = [
    // Multiple lines with consistent indentation (2+ levels)
    /^\s{2,}\w+/m && /^\s{4,}\w+/m,
    // Multiple lines starting with keywords
    lines.filter(line => /^\s*(if|for|while|function|def|class|public|private|import|export|const|let|var)\s+/.test(line)).length >= 2,
    // Bracket/brace balance suggesting code structure
    cleanContent.split('').filter(c => c === '{').length >= 2 && cleanContent.split('').filter(c => c === '}').length >= 2,
  ];
  
  codeIndicators += structureIndicators.filter(Boolean).length;
  
  // Bias against natural language patterns
  const naturalLanguagePatterns = [
    /\b(the|and|or|but|however|therefore|because|although|since|while|during|after|before)\b/gi,
    /\b(is|are|was|were|will|would|could|should|might|may)\b/gi,
    /\b(this|that|these|those|here|there|where|when|how|why|what)\b/gi,
  ];
  
  const naturalLanguageWords = naturalLanguagePatterns.reduce((count, pattern) => {
    const matches = cleanContent.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  // If there's a lot of natural language, reduce confidence
  if (naturalLanguageWords > cleanContent.split(/\s+/).length * 0.1) {
    codeIndicators -= 1;
  }
  
  // Decision threshold: need significant evidence for code detection
  // This is deliberately conservative to avoid false positives
  if (codeIndicators >= 3) {
    return 'code';
  }
  
  // Check for markdown patterns as secondary option
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers
    /\*\*.*?\*\*/,           // Bold
    /^\s*[-*+]\s+/m,         // Lists
    /^\s*\d+\.\s+/m,         // Numbered lists
    /\[.*?\]\(.*?\)/,        // Links
    /!\[.*?\]\(.*?\)/,       // Images
    /^\s*\|.*\|.*\|/m,       // Tables
    /^\s*>\s+/m,             // Blockquotes
  ];
  
  if (markdownPatterns.some(pattern => pattern.test(cleanContent))) {
    return 'markdown';
  }
  
  return 'text';
}

// Helper function to determine content type based on file extension and patterns
function getContentType(content, message) {
  if (!content || typeof content !== 'string') return 'text';
  
  // For user messages, use conservative heuristics to detect obvious code blocks
  if (message?.type === 'user') {
    return detectUserCodeContent(content);
  }
  
  // Clean content for pattern detection first
  const cleanContent = cleanContentForMarkdown(content);
  
  // If content contains natural language explanations, prioritize text/markdown over code
  // Look for conversational phrases that indicate this is explanatory content
  const conversationalPhrases = [
    /\b(?:you're|absolutely|perfect|great|now|based on|can see|available|let me|i'll|i can|here's|this is|these are)\b/i,
    /\b(?:right|sure|okay|yes|no|exactly|correct|sounds good|makes sense)\b/i,
    /\b(?:let's|we'll|i'll|should|will|going to|start|create|update|implement)\b/i,
    /\b(?:instead|rather than|instead of|better|simple|minimal|just)\b/i
  ];
  
  const hasConversationalText = conversationalPhrases.some(pattern => pattern.test(cleanContent));
  
  // If it's clearly conversational and doesn't look like code, treat as text
  if (hasConversationalText && cleanContent.length < 500) {
    // Check if it has markdown patterns
    if (/(\*\*.*?\*\*|^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s)/m.test(cleanContent)) {
      return 'markdown';
    }
    // Otherwise treat as plain text for short conversational content
    return 'text';
  }
  
  // If it has explanatory text AND markdown patterns, treat as markdown
  if (hasConversationalText && /(\*\*.*?\*\*|^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s)/m.test(cleanContent)) {
    return 'markdown';
  }
  
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
          // If it's configuration-like JSON (package.json, tsconfig.json, etc.), treat as code
          if (/["'](?:name|version|scripts|dependencies|devDependencies|compilerOptions|extends)["']\s*:/.test(cleanContent)) {
            return 'code';
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
  
  // Check for markdown patterns FIRST (before code patterns)
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

  // Check for code patterns (these should only trigger for actual code)
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
  
  // Final fallback: if it's an assistant message without file path and doesn't match code patterns,
  // and it's relatively short and conversational, treat as text
  if (message?.type === 'assistant' && !filePath && cleanContent.length < 300) {
    return 'text';
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
            {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
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

function MarkdownBlock({ content, isUser, allMarkdownBlocksCollapsed, forceMarkdownCollapseToggle }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // React to global collapse/expand controls immediately
  React.useEffect(() => {
    if (forceMarkdownCollapseToggle > 0) {
      setIsCollapsed(allMarkdownBlocksCollapsed);
    }
  }, [allMarkdownBlocksCollapsed, forceMarkdownCollapseToggle]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanContentForMarkdown(content));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden ${
      isUser 
        ? 'bg-slate-700 border border-slate-600' 
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      {/* Header with controls */}
      <div className={`px-4 py-2 border-b flex items-center justify-between ${
        isUser 
          ? 'bg-slate-800 border-slate-600 text-slate-100' 
          : 'bg-gray-50 border-gray-200 text-gray-700'
      }`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-sm hover:opacity-70 ${
              isUser ? 'text-slate-300' : 'text-gray-500'
            }`}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
          </button>
          <span className="text-sm font-mono">📝</span>
          <span className="text-sm font-medium">Markdown Content</span>
        </div>
        <div className="flex items-center space-x-2">
          {!isCollapsed && (
            <button
              onClick={handleCopy}
              className={`text-xs px-2 py-1 rounded flex items-center space-x-1 transition-colors ${
                copySuccess
                  ? (isUser ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700')
                  : (isUser ? 'hover:bg-slate-600 text-slate-200' : 'hover:bg-gray-200 text-gray-600')
              }`}
            >
              {copySuccess ? (
                <>
                  <CheckIcon />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Markdown content - CSS display toggle for maximum speed */}
      <div 
        className={`${
          isUser 
            ? 'bg-slate-700' 
            : 'bg-white'
        }`}
        style={{ display: isCollapsed ? 'none' : 'block' }}
      >
        <div className={`p-4 ${isUser ? 'text-slate-100' : 'text-gray-700'}`}>
          <ReactMarkdown 
            components={{
              h1: ({children}) => (
                <h1 className={`text-xl font-bold mb-2 ${
                  isUser ? 'text-slate-50' : 'text-gray-900'
                }`}>
                  {children}
                </h1>
              ),
              h2: ({children}) => (
                <h2 className={`text-lg font-bold mb-2 ${
                  isUser ? 'text-slate-50' : 'text-gray-900'
                }`}>
                  {children}
                </h2>
              ),
              h3: ({children}) => (
                <h3 className={`text-base font-bold mb-1 ${
                  isUser ? 'text-slate-50' : 'text-gray-900'
                }`}>
                  {children}
                </h3>
              ),
              p: ({children}) => (
                <p className={`mb-2 ${
                  isUser ? 'text-slate-100' : 'text-gray-700'
                }`}>
                  {children}
                </p>
              ),
              strong: ({children}) => (
                <strong className={`font-bold ${
                  isUser ? 'text-slate-50' : 'text-gray-900'
                }`}>
                  {children}
                </strong>
              ),
              em: ({children}) => (
                <em className={`italic ${
                  isUser ? 'text-slate-200' : 'text-gray-600'
                }`}>
                  {children}
                </em>
              ),
              ul: ({children}) => (
                <ul className={`list-disc list-inside mb-2 space-y-0.5 ${
                  isUser ? 'text-slate-100' : 'text-gray-700'
                }`}>
                  {children}
                </ul>
              ),
              ol: ({children}) => (
                <ol className={`list-decimal list-inside mb-2 space-y-0.5 ${
                  isUser ? 'text-slate-100' : 'text-gray-700'
                }`}>
                  {children}
                </ol>
              ),
              li: ({children}) => (
                <li className={`${
                  isUser ? 'text-slate-100' : 'text-gray-700'
                }`}>
                  {children}
                </li>
              ),
              code: ({node, inline, className, children, ...props}) => {
                const isInline = inline || !node || node.tagName !== 'pre';
                
                if (isInline) {
                  return (
                    <code 
                      className={`px-1 py-0.5 rounded text-sm font-mono ${
                        isUser 
                          ? 'bg-slate-600 text-slate-200' 
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
                      ? 'bg-slate-600 text-slate-200' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <code className="text-sm font-mono" {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              pre: ({children}) => {
                return children;
              },
              blockquote: ({children}) => (
                <blockquote className={`border-l-4 pl-4 italic mb-3 ${
                  isUser 
                    ? 'border-slate-400 text-slate-200' 
                    : 'border-gray-300 text-gray-600'
                }`}>
                  {children}
                </blockquote>
              ),
              table: ({children}) => (
                <div className="overflow-x-auto mb-3">
                  <table className={`min-w-full divide-y ${
                    isUser 
                      ? 'divide-slate-500' 
                      : 'divide-gray-200'
                  }`}>
                    {children}
                  </table>
                </div>
              ),
              th: ({children}) => (
                <th className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                  isUser 
                    ? 'bg-slate-600 text-slate-200' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {children}
                </th>
              ),
              td: ({children}) => (
                <td className={`px-3 py-2 text-sm ${
                  isUser 
                    ? 'text-slate-100' 
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
                      ? 'text-slate-300 hover:text-slate-200' 
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
                  isUser ? 'border-slate-500' : 'border-gray-300'
                }`} />
              )
            }}
          >
            {cleanContentForMarkdown(content)}
          </ReactMarkdown>
        </div>
      </div>
      
      {/* Collapsed state preview */}
      <div 
        className={`px-4 py-2 text-sm italic ${
          isUser ? 'text-slate-300' : 'text-gray-500'
        }`}
        style={{ display: isCollapsed ? 'block' : 'none' }}
      >
        Markdown content • Click to expand
      </div>
    </div>
  );
}

function UnifiedMessageBubble({ message, sessionType, allCodeBlocksCollapsed, forceCollapseToggle, allMarkdownBlocksCollapsed, forceMarkdownCollapseToggle, allToolUseBlocksHidden, session }) {
  const [showRawData, setShowRawData] = useState(false);
  const [showToolDetails, setShowToolDetails] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Determine message alignment and styling
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';
  const isSystem = message.type === 'system' || message.type === 'tool';
  
  // Get session author info using same pattern as SessionCard
  const sessionAuthor = {
    username: session?.username || session?.author?.username || 'User',
    avatarUrl: session?.avatarUrl || session?.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.username || session?.author?.username || 'User')}&background=3b82f6&color=fff&size=24`,
    userId: session?.userId || session?.author?.userId
  };
  
  // Determine content type
  const contentType = getContentType(message.content, message);
  const shouldRenderMarkdown = contentType === 'markdown';
  const shouldRenderCode = contentType === 'code';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-4xl ${isUser ? 'ml-12' : 'mr-12'}`}>
        {/* Message Header */}
        <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className="group flex items-center space-x-2 text-sm text-gray-500">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              isUser ? '' : 
              isSystem ? 'bg-orange-100 text-orange-700' :
              ''
            }`}>
              {isUser ? (
                <img
                  src={sessionAuthor.avatarUrl}
                  alt={sessionAuthor.username}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionAuthor.username)}&background=3b82f6&color=fff&size=24`;
                  }}
                />
              ) : isSystem ? '🔧' : 
                sessionType === SESSION_TYPES.Q_CHAT ? 
                  <img src="/q-logo.png" alt="Amazon Q" className="w-4 h-4" /> :
                  <img src="/claude-logo.png" alt="Claude" className="w-4 h-4" />
              }
            </span>
            <span className={`font-medium ${
              message.type === 'user' ? '' : 'capitalize'
            }`}>
              {message.type === 'assistant' && sessionType === SESSION_TYPES.CLAUDE_CODE ? 'Claude' : 
               message.type === 'assistant' && sessionType === SESSION_TYPES.Q_CHAT ? 'Amazon Q' :
               message.type === 'user' ? (
                sessionAuthor.userId ? (
                  <Link href={`/users/${sessionAuthor.userId}`} className="hover:underline">
                    {sessionAuthor.username}
                  </Link>
                ) : sessionAuthor.username
               ) :
               message.type}
              {message.role && message.role !== message.type && ` (${message.role})`}
            </span>
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
        <div className={`relative rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isSystem
            ? 'bg-orange-50 border border-orange-200 shadow-sm'
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          {/* Copy Button - Hide for tool blocks, code blocks, and markdown blocks */}
          {!isSystem && !shouldRenderCode && !shouldRenderMarkdown && (
            <button
              onClick={() => copyToClipboard(message.content)}
              className={`absolute top-2 right-2 p-1.5 rounded-md transition-all ${
                copySuccess
                  ? 'bg-green-100 text-green-600'
                  : isUser
                  ? 'hover:bg-blue-500 text-blue-200 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
              title="Copy message"
            >
              {copySuccess ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              )}
            </button>
          )}

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
              <MarkdownBlock 
                content={message.content}
                isUser={isUser}
                allMarkdownBlocksCollapsed={allMarkdownBlocksCollapsed}
                forceMarkdownCollapseToggle={forceMarkdownCollapseToggle}
              />
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
        </div>

        {/* Raw Data Display */}
        {showRawData && (
          <RawMessageDataDisplay message={message} />
        )}
      </div>
    </div>
  );
}

function RawMessageDataDisplay({ message }) {
  const [copySuccess, setCopySuccess] = useState(false);
  
  const rawText = JSON.stringify(message, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = rawText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="mt-2 bg-gray-50 border border-gray-200 rounded">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">Message Raw Data</span>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all ${
            copySuccess
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3">
        <pre className="text-xs text-gray-600 overflow-auto">
          {rawText}
        </pre>
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

function UserPromptsView({ session }) {
  const [copiedId, setCopiedId] = useState(null);
  
  // Filter to only show user messages
  const userMessages = session.messages.filter(message => message.type === 'user');
  const sortedUserMessages = [...userMessages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Get session author info using same pattern as in UnifiedMessageBubble
  const sessionAuthor = {
    username: session?.username || session?.author?.username || 'User',
    avatarUrl: session?.avatarUrl || session?.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.username || session?.author?.username || 'User')}&background=3b82f6&color=fff&size=24`,
    userId: session?.userId || session?.author?.userId
  };
  
  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">User Prompts</h3>
        <p className="text-sm text-gray-600">All messages sent by the user in this session</p>
      </div>
      
      <div className="p-4">
        {sortedUserMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">💬</div>
            <p className="text-gray-600">No user messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedUserMessages.map((message, index) => (
              <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="group flex items-center space-x-2">
                    <img
                      src={sessionAuthor.avatarUrl}
                      alt={sessionAuthor.username}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionAuthor.username)}&background=3b82f6&color=fff&size=24`;
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {sessionAuthor.userId ? (
                        <Link href={`/users/${sessionAuthor.userId}`} className="hover:underline">
                          {sessionAuthor.username}
                        </Link>
                      ) : sessionAuthor.username}
                    </span>
                    {message.metadata?.model && (
                      <>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {message.metadata.model}
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    title="Copy prompt"
                  >
                    {copiedId === message.id ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message.content}
                </div>
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="text-xs text-orange-600 mt-2">
                    🔧 {message.toolCalls.length} tool call{message.toolCalls.length !== 1 ? 's' : ''}
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

function ToolsView({ session }) {
  const [allExpanded, setAllExpanded] = useState(true);
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
  
  const toggleAllExpanded = () => {
    setAllExpanded(!allExpanded);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tool Usage</h3>
            <p className="text-sm text-gray-600">
              {toolCalls.length} tool call{toolCalls.length !== 1 ? 's' : ''} in this session
            </p>
          </div>
          {toolCalls.length > 0 && (
            <button
              onClick={toggleAllExpanded}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {allExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                )}
              </svg>
              <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
          )}
        </div>
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
              <ToolCallDetailCard key={tool.id || index} tool={tool} allExpanded={allExpanded} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCallDetailCard({ tool, allExpanded }) {
  const [showInput, setShowInput] = useState(true);
  const [showOriginalArgs, setShowOriginalArgs] = useState(true);

  // Update local state when allExpanded changes
  useEffect(() => {
    setShowInput(allExpanded);
    setShowOriginalArgs(allExpanded);
  }, [allExpanded]);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="group flex items-center space-x-2">
          <span className="text-yellow-600">🔧</span>
          <span className="font-medium text-gray-900">{tool.name}</span>
          {tool.metadata?.orig_name && tool.metadata.orig_name !== tool.name && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              orig: {tool.metadata.orig_name}
            </span>
          )}
        </div>
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
  // Calculate token percentages for the chart
  const inputPercentage = session.stats.totalTokens > 0 ? (session.stats.inputTokens / session.stats.totalTokens) * 100 : 0;
  const outputPercentage = session.stats.totalTokens > 0 ? (session.stats.outputTokens / session.stats.totalTokens) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Message Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{session.stats.totalMessages}</div>
            <div className="text-sm text-gray-600 mt-1">Total Messages</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{session.stats.userMessages}</div>
            <div className="text-sm text-gray-600 mt-1">User Messages</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{session.stats.assistantMessages}</div>
            <div className="text-sm text-gray-600 mt-1">Assistant Messages</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{session.stats.toolCalls}</div>
            <div className="text-sm text-gray-600 mt-1">Tool Calls</div>
          </div>
        </div>
        
        {/* Additional message types if they exist */}
        {(session.stats.toolMessages > 0 || session.stats.systemMessages > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {session.stats.toolMessages > 0 && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{session.stats.toolMessages}</div>
                <div className="text-sm text-gray-600 mt-1">Tool Messages</div>
              </div>
            )}
            {session.stats.systemMessages > 0 && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{session.stats.systemMessages}</div>
                <div className="text-sm text-gray-600 mt-1">System Messages</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Token Usage Chart */}
      {session.stats.totalTokens > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Token Usage</h3>
          
          {/* Visual Chart */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Token Distribution</span>
              <span className="text-sm text-gray-600">{session.stats.totalTokens.toLocaleString()} total</span>
            </div>
            <div className="flex w-full h-8 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${inputPercentage}%` }}
              >
                {inputPercentage > 15 && `${Math.round(inputPercentage)}%`}
              </div>
              <div 
                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${outputPercentage}%` }}
              >
                {outputPercentage > 15 && `${Math.round(outputPercentage)}%`}
              </div>
            </div>
          </div>

          {/* Token Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Input Tokens</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{session.stats.inputTokens.toLocaleString()}</div>
                <div className="text-xs text-gray-600">{Math.round(inputPercentage)}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Output Tokens</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{session.stats.outputTokens.toLocaleString()}</div>
                <div className="text-xs text-gray-600">{Math.round(outputPercentage)}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Total Tokens</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{session.stats.totalTokens.toLocaleString()}</div>
                <div className="text-xs text-gray-600">100%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Session ID</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{session.id}</code>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Session Type</span>
            <span className="text-sm font-medium">{getSessionTypeLabel(session.type)}</span>
          </div>
          {session.metadata.version && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium">{session.metadata.version}</span>
            </div>
          )}
          {session.metadata.userType && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">User Type</span>
              <span className="text-sm font-medium">{session.metadata.userType}</span>
            </div>
          )}
          {session.metadata.duration && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="text-sm font-medium">{session.metadata.duration}</span>
            </div>
          )}
          {session.metadata.model && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Model</span>
              <span className="text-sm font-medium">{session.metadata.model}</span>
            </div>
          )}
          {session.metadata.cwd && (
            <div className="flex justify-between items-start py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Working Directory</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded max-w-md truncate ml-4">
                {session.metadata.cwd}
              </code>
            </div>
          )}
          {session.metadata.conversation_id && session.metadata.conversation_id !== session.id && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Conversation ID</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{session.metadata.conversation_id}</code>
            </div>
          )}
          {session.metadata.valid_history_range && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Valid History Range</span>
              <span className="text-sm font-medium">
                [{session.metadata.valid_history_range[0]}, {session.metadata.valid_history_range[1]}]
              </span>
            </div>
          )}
          {session.metadata.totalMessages && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Total Raw Messages</span>
              <span className="text-sm font-medium">{session.metadata.totalMessages}</span>
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
  const [copySuccess, setCopySuccess] = useState(false);
  
  const rawText = typeof session.rawData === 'string' 
    ? session.rawData 
    : JSON.stringify(session.rawData, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = rawText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Raw Session Data</h3>
          <p className="text-sm text-gray-600">Complete raw data representation of the session</p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
              <span>Copy</span>
            </>
          )}
        </button>
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

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function VisibilityBadge({ isPrivate, onToggle, isOwner }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isOwner) {
      onToggle(!isPrivate);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isOwner}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${
        isPrivate
          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
          : 'bg-green-100 text-green-800 hover:bg-green-200'
      } ${!isOwner ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}`}
      title={
        isOwner 
          ? (isPrivate ? 'Click to make public' : 'Click to make private')
          : 'Only the owner can change visibility'
      }
    >
      <span className="mr-1 transition-all duration-200">
        {isPrivate ? (
          // Lock icon for private (changes to unlock on hover)
          isHovered && isOwner ? (
            // Unlock icon on hover
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
            </svg>
          ) : (
            // Lock icon default
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 3c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm6 17H6V10h12v10z"/>
            </svg>
          )
        ) : (
          // Globe icon for public
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        )}
      </span>
      {isPrivate ? 'Private' : 'Public'}
    </button>
  );
}

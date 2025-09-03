import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { SESSION_TYPES } from '../utils/sessionParser';
import { useAuth } from '../contexts/AuthContext';
import { authenticatedFetch } from '../utils/auth';
import { detectCommand } from '../utils/commandDetector';
import { CommandDisplay } from './CommandDisplay';
import { groupCommandMessages, isGroupedCommand, getCombinedCommand } from '../utils/messageGrouper';

export default function UnifiedSessionViewer({ session, onSessionUpdate, sessionId }) {
  const [activeView, setActiveView] = useState('conversation');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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


  return (
    <div className={isMobile ? "px-4 py-4 overflow-hidden" : "max-w-6xl mx-auto p-6"}>
      {/* Session Header */}
      <SessionHeader 
        session={session} 
        user={user}
        onSessionUpdate={onSessionUpdate}
        sessionId={sessionId}
        isMobile={isMobile}
      />
      
      {/* View Toggle and Copy Button - Hidden on Mobile */}
      {!isMobile && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 dark:bg-slate-600 dark:bg-slate-700 p-1 rounded-lg w-fit">
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
              active={activeView === 'raw'}
              onClick={() => setActiveView('raw')}
              label="Raw Data"
            />
          </div>
        </div>
      )}

      {/* Content Views */}
      {(activeView === 'conversation' || isMobile) && <ConversationView session={session} isMobile={isMobile} />}
      {!isMobile && activeView === 'user-prompts' && <UserPromptsView session={session} />}
      {!isMobile && activeView === 'tools' && <ToolsView session={session} />}
      {!isMobile && activeView === 'raw' && <RawDataView session={session} />}
    </div>
  );
}

function ViewToggleButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-white dark:bg-slate-600 text-primary dark:text-primary-light shadow-sm'
          : 'text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:text-gray-900 dark:text-white dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function SessionHeader({ session, user, onSessionUpdate, sessionId, isMobile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    title: session.metadata?.title || session.title || '',
    summary: session.metadata?.summary || '',
    tags: session.metadata?.tags || [],
    isPrivate: session.metadata?.isPrivate === true
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if user is the owner of the session
  const isOwner = user && session.author && (
    (user.id && session.author.userId && String(user.id) === String(session.author.userId)) ||
    (user.userId && session.author.userId && String(user.userId) === String(session.author.userId)) ||
    (user.id && session.author.id && String(user.id) === String(session.author.id))
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
          tags: editedData.tags,
          isPrivate: editedData.isPrivate
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
              tags: editedData.tags,
              isPrivate: editedData.isPrivate
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
      tags: session.metadata?.tags || [],
      isPrivate: session.metadata?.isPrivate === true
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

  const handleDelete = async () => {
    if (!isOwner || !showDeleteConfirm) return;
    
    setIsDeleting(true);
    
    try {
      const endpointUrl = process.env.NEXT_PUBLIC_ENDPOINT_URL || process.env.ENDPOINT_URL;
      if (!endpointUrl) {
        throw new Error('ENDPOINT_URL environment variable is not set');
      }

      const response = await authenticatedFetch(`${endpointUrl}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to sessions page after successful deletion
        window.location.href = '/sessions';
      } else {
        const errorText = await response.text();
        console.error('Failed to delete session:', errorText);
        alert('Failed to delete session. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error deleting session. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleVisibilityToggle = (isPrivate) => {
    if (!isOwner) return;
    
    setEditedData({
      ...editedData,
      isPrivate: isPrivate
    });
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
        return <img src="/gemini-cli-logo.png" alt="Gemini CLI" className="w-8 h-8" />;
      case SESSION_TYPES.CODEX:
        return (
          <>
            <img 
              src="/openai-logo-dark.png" 
              alt="OpenAI" 
              className="w-10 h-10 dark:hidden" 
            />
            <img 
              src="/openai-logo-light.png" 
              alt="OpenAI" 
              className="w-10 h-10 hidden dark:block" 
            />
          </>
        );
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
      case SESSION_TYPES.CODEX:
        return 'OpenAI Codex';
      default:
        return 'Unknown Format';
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 mb-6 relative min-h-[160px] ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className={isMobile ? "space-y-3" : "flex items-start justify-between"}>
        <div className={isMobile ? "space-y-2" : "flex-1 pr-4"}>
          <div className="mb-2">
            {isEditing ? (
              <input
                type="text"
                value={editedData.title}
                onChange={(e) => setEditedData({...editedData, title: e.target.value})}
                className="w-full text-2xl font-bold text-gray-900 dark:text-white dark:text-white border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-slate-700"
                placeholder="Session title"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">
                {session.metadata?.title || session.title}
              </h1>
            )}
          </div>
          
          
          {/* Summary */}
          {(isEditing || session.metadata?.summary) && (
            <div className="mb-3">
              {isEditing ? (
                <textarea
                  value={editedData.summary}
                  onChange={(e) => setEditedData({...editedData, summary: e.target.value})}
                  className="w-full text-gray-700 dark:text-gray-300 dark:text-gray-300 text-sm leading-relaxed border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded px-2 py-1 resize-none bg-white dark:bg-slate-700"
                  placeholder="Session summary"
                  rows="2"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 dark:text-gray-300 text-sm leading-relaxed">
                  {session.metadata.summary}
                </p>
              )}
            </div>
          )}
          
          {/* Tags */}
          {(isEditing || (session.metadata?.tags && session.metadata.tags.length > 0)) && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {(isEditing ? editedData.tags : session.metadata.tags).map((tag) => 
                  isEditing ? (
                    <span
                      key={tag}
                      onClick={() => handleRemoveTag(tag)}
                      className="inline-flex items-center bg-primary/10 text-primary-dark dark:bg-primary-light/20 dark:text-primary-light text-sm sm:text-xs px-2 py-1 sm:px-1 sm:py-0.5 rounded hover:bg-primary/20 dark:hover:bg-primary-light/30 transition-colors cursor-pointer"
                    >
                      {tag}<span className="ml-1">×</span>
                    </span>
                  ) : (
                    <span
                      key={tag}
                      className="inline-flex items-center bg-primary/10 text-primary-dark dark:bg-primary-light/20 dark:text-primary-light text-xs px-1 py-0.5 rounded hover:bg-primary/20 dark:hover:bg-primary-light/30 transition-colors"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="text-xs border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-white dark:text-white"
                    placeholder="Add tag"
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-xs bg-primary hover:bg-primary-hover text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Visibility - Always shown, but only editable when in edit mode */}
          <div className="mb-3">
            {isEditing && (
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Visibility
              </label>
            )}
            <VisibilityBadge 
              isPrivate={isEditing ? editedData.isPrivate : (session.metadata?.isPrivate === true)} 
              onToggle={isEditing ? (isPrivate) => {
                if (isOwner) {
                  handleVisibilityToggle(isPrivate);
                }
              } : undefined}
              isOwner={isOwner && isEditing}
            />
          </div>
        </div>
        
        {/* Platform Badge - Desktop Only */}
        {!isMobile && (
          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-slate-700 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600">
            <span className="flex-shrink-0">{getSessionIcon(session.type)}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {getSessionTypeLabel(session.type)}
            </span>
          </div>
        )}
      </div>
      
      {/* Mobile: Platform Badge and Action Buttons in a row */}
      {isMobile ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 justify-between">
          {/* Platform Badge */}
          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600">
            <span className="flex-shrink-0">{getSessionIcon(session.type)}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {getSessionTypeLabel(session.type)}
            </span>
          </div>
          
          {/* Gear Icon or Save/Cancel Buttons */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-1 px-2 py-1 bg-secondary hover:bg-secondary-hover disabled:bg-secondary/50 text-white text-xs font-medium rounded transition-colors"
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
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-600 dark:bg-slate-600 hover:bg-gray-700 dark:hover:bg-slate-500 disabled:bg-gray-400 dark:disabled:bg-slate-500 text-white text-xs font-medium rounded transition-colors"
                >
                  <CancelIcon />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 dark:text-gray-300 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                  title="Edit session"
                >
                  <GearIcon />
                </button>
              )
            )}
          </div>
        </div>
      ) : (
        /* Desktop: Gear Icon - Bottom Left, Save/Cancel buttons when editing */
        <>
          {/* Gear Icon for Session Owner - Bottom Right */}
          {isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 dark:text-gray-300 rounded-full transition-colors cursor-pointer shadow-sm hover:shadow-md"
              title="Edit session"
            >
              <GearIcon />
            </button>
          )}
          
          {/* Save/Cancel/Delete Buttons - Bottom Right when editing */}
          {isEditing && (
            <div className="absolute bottom-4 right-4 flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-1 px-2 py-1 bg-secondary hover:bg-secondary-hover disabled:bg-secondary/50 text-white text-xs font-medium rounded transition-colors"
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
                className="flex items-center space-x-1 px-2 py-1 bg-gray-600 dark:bg-slate-600 hover:bg-gray-700 dark:hover:bg-slate-500 disabled:bg-gray-400 dark:disabled:bg-slate-500 text-white text-xs font-medium rounded transition-colors"
              >
                <CancelIcon />
                <span>Cancel</span>
              </button>
              {showDeleteConfirm ? (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium rounded transition-colors"
                >
                  {isDeleting ? (
                    <span className="animate-spin">⭮</span>
                  ) : (
                    <DeleteIcon />
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                >
                  <DeleteIcon />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300 dark:text-gray-300">{label}</div>
    </div>
  );
}

function ConversationView({ session, isMobile }) {
  const [allCodeBlocksCollapsed, setAllCodeBlocksCollapsed] = useState(isMobile || false);
  const [allMarkdownBlocksCollapsed, setAllMarkdownBlocksCollapsed] = useState(isMobile || false);
  const [forceCollapseToggle, setForceCollapseToggle] = useState(0);
  const [forceMarkdownCollapseToggle, setForceMarkdownCollapseToggle] = useState(0);
  const [allToolUseBlocksHidden, setAllToolUseBlocksHidden] = useState(isMobile || false);
  const [allReasoningBlocksHidden, setAllReasoningBlocksHidden] = useState(isMobile || false);

  // Update collapsed states when mobile state changes
  useEffect(() => {
    if (isMobile) {
      setAllCodeBlocksCollapsed(true);
      setAllMarkdownBlocksCollapsed(true);
      setAllToolUseBlocksHidden(true);
      setAllReasoningBlocksHidden(true);
      setForceCollapseToggle(prev => prev + 1);
      setForceMarkdownCollapseToggle(prev => prev + 1);
    }
  }, [isMobile]);

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

  const handleToggleAllReasoning = () => {
    setAllReasoningBlocksHidden(!allReasoningBlocksHidden);
  };

  if (session.messages.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 text-4xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-2">No Messages</h3>
        <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300">This session doesn't contain any messages to display.</p>
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

  // Check if there are any reasoning blocks in the session
  const hasReasoningBlocks = session.messages.some(message => 
    message.type === 'reasoning'
  );

  return (
    <div className="space-y-4">
      {/* Sticky Controls - Hidden on Mobile */}
      {!isMobile && (hasCodeBlocks || hasMarkdownBlocks || hasToolUseBlocks || hasReasoningBlocks) && (
        <div className="fixed top-20 right-4 z-30">
          <div className="flex flex-col space-y-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-2 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
            {/* Code Blocks Toggle */}
            {hasCodeBlocks && (
              <button
                onClick={handleToggleAll}
                title={`${allCodeBlocksCollapsed ? 'Expand' : 'Collapse'} all code blocks`}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  allCodeBlocksCollapsed 
                    ? 'bg-primary/10 text-primary-dark dark:bg-primary-light/20 dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary-light/30' 
                    : 'bg-gray-100 dark:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-gray-300 dark:text-gray-200 hover:bg-gray-200 dark:bg-slate-500 dark:hover:bg-slate-500'
                }`}
              >
                {allCodeBlocksCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                <span>📄 Code</span>
              </button>
            )}

            {/* Markdown Blocks Toggle */}
            {hasMarkdownBlocks && (
              <button
                onClick={handleToggleAllMarkdown}
                title={`${allMarkdownBlocksCollapsed ? 'Expand' : 'Collapse'} all markdown blocks`}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  allMarkdownBlocksCollapsed 
                    ? 'bg-secondary/10 text-secondary-dark dark:bg-secondary-light/20 dark:text-secondary-light hover:bg-secondary/20 dark:hover:bg-secondary-light/30' 
                    : 'bg-gray-100 dark:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-gray-300 dark:text-gray-200 hover:bg-gray-200 dark:bg-slate-500 dark:hover:bg-slate-500'
                }`}
              >
                {allMarkdownBlocksCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                <span>📝 Markdown</span>
              </button>
            )}
            
            {/* Tool Use Blocks Toggle */}
            {hasToolUseBlocks && (
              <button
                onClick={handleToggleAllToolUse}
                title={`${allToolUseBlocksHidden ? 'Show' : 'Hide'} all tool use blocks`}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  allToolUseBlocksHidden 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50' 
                    : 'bg-gray-100 dark:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-gray-300 dark:text-gray-200 hover:bg-gray-200 dark:bg-slate-500 dark:hover:bg-slate-500'
                }`}
              >
                {allToolUseBlocksHidden ? <ChevronRightIcon /> : <ChevronDownIcon />}
                <span>🔧 Tools</span>
              </button>
            )}
            
            {/* Reasoning Blocks Toggle */}
            {hasReasoningBlocks && (
              <button
                onClick={handleToggleAllReasoning}
                title={`${allReasoningBlocksHidden ? 'Show' : 'Hide'} all reasoning blocks`}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  allReasoningBlocksHidden 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50' 
                    : 'bg-gray-100 dark:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-gray-300 dark:text-gray-200 hover:bg-gray-200 dark:bg-slate-500 dark:hover:bg-slate-500'
                }`}
              >
                {allReasoningBlocksHidden ? <ChevronRightIcon /> : <ChevronDownIcon />}
                <span>🧠 Reasoning</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Messages */}
      {groupCommandMessages(session.messages, session.type).map((message) => {
        // Hide entire message if it contains tool calls or tool results and tool use blocks are hidden
        const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
        const hasToolResults = message.toolResults && message.toolResults.length > 0;
        if ((hasToolCalls || hasToolResults) && allToolUseBlocksHidden) {
          return null;
        }
        
        // Hide reasoning messages if reasoning blocks are hidden
        if (message.type === 'reasoning' && allReasoningBlocksHidden) {
          return null;
        }
        
        return (
          <UnifiedMessageBubble 
            key={message.groupedMessageIds ? message.groupedMessageIds.join('-') : message.id} 
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



// Helper function to determine content type based on file extension and patterns
function getContentType(content, message) {
  // Reasoning messages should never be treated as code or markdown blocks
  if (message && message.type === 'reasoning') {
    return 'text';
  }
  
  // Extract actual content from Q Chat formats first
  const actualContent = extractQChatContent(content);
  
  if (!actualContent || typeof actualContent !== 'string') return 'text';
  
  // Clean content for pattern detection first
  const cleanContent = cleanContentForMarkdown(actualContent);
  
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

// Helper function to extract actual content from Q Chat message formats
function extractQChatContent(content) {
  if (!content) return '';
  
  // Handle CancelledToolUses format
  if (typeof content === 'object' && content.CancelledToolUses && content.CancelledToolUses.prompt) {
    return content.CancelledToolUses.prompt;
  }
  
  // Return content as-is if it's already a string
  if (typeof content === 'string') {
    return content;
  }
  
  // For other object formats, return empty string to avoid displaying [object Object]
  return '';
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

function CodeBlock({ content, language, filePath, allCodeBlocksCollapsed, forceCollapseToggle }) {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize with the current theme state
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // React to global collapse/expand controls immediately
  React.useEffect(() => {
    if (forceCollapseToggle > 0) {
      setIsCollapsed(allCodeBlocksCollapsed);
    }
  }, [allCodeBlocksCollapsed, forceCollapseToggle]);

  // Track dark mode changes
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check initial state
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get appropriate syntax highlighting theme based on current theme
  const syntaxTheme = isDarkMode ? vscDarkPlus : vs;
  
  // Custom style overrides for better integration
  const customStyle = {
    margin: 0,
    padding: '1rem',
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
    <div 
      className={`rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm ${isCollapsed ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={isCollapsed ? (e) => {
        // Don't expand if clicking on the chevron button
        if (e.target.closest('button')) return;
        setIsCollapsed(false);
      } : undefined}
    >
      {/* Header with file path and controls */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sm hover:opacity-70 text-gray-500 dark:text-gray-400 cursor-pointer"
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
          </button>
          <span className="text-sm font-mono">📄</span>
          <span className="text-sm font-medium">{filePath || 'Code Block'}</span>
          {language && language !== 'text' && (
            <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-slate-500 text-gray-600 dark:text-gray-300">
              {language}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isCollapsed && (
            <>
              <button
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className="text-xs px-2 py-1 rounded transition-colors hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-600 dark:text-gray-300"
              >
                {showLineNumbers ? 'Hide' : 'Show'} Lines
              </button>
              <button
                onClick={handleCopy}
                className={`text-xs px-2 py-1 rounded flex items-center space-x-1 transition-colors ${
                  copySuccess
                    ? 'bg-secondary text-white dark:bg-secondary-light dark:text-slate-900'
                    : 'hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-600 dark:text-gray-300'
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
        className="overflow-x-auto sm:overflow-x-auto overflow-x-hidden bg-slate-50 dark:bg-slate-800"
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
        className="px-4 py-2 text-sm italic text-gray-500 dark:text-gray-400"
        style={{ display: isCollapsed ? 'block' : 'none' }}
      >
        {content.split('\n').length} lines • Click to expand
      </div>
    </div>
  );
}

function MarkdownBlock({ content, allMarkdownBlocksCollapsed, forceMarkdownCollapseToggle }) {
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
    <div 
      className={`rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm ${isCollapsed ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={isCollapsed ? (e) => {
        // Don't expand if clicking on the chevron button
        if (e.target.closest('button')) return;
        setIsCollapsed(false);
      } : undefined}
    >
      {/* Header with controls */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sm hover:opacity-70 text-gray-500 dark:text-gray-400 cursor-pointer"
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
              ? 'bg-secondary text-white dark:bg-secondary-light dark:text-slate-900'
              : 'hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-600 dark:text-gray-300'
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
        className="bg-white dark:bg-slate-800"
        style={{ display: isCollapsed ? 'none' : 'block' }}
      >
        <div className="p-4 text-gray-700 dark:text-gray-300">
          <ReactMarkdown 
            components={{
              h1: ({children}) => (
                <h1 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {children}
                </h1>
              ),
              h2: ({children}) => (
                <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  {children}
                </h2>
              ),
              h3: ({children}) => (
                <h3 className="text-base font-bold mb-1 text-gray-900 dark:text-white">
                  {children}
                </h3>
              ),
              p: ({children}) => (
                <p className="mb-2 text-gray-700 dark:text-gray-300">
                  {children}
                </p>
              ),
              strong: ({children}) => (
                <strong className="font-bold text-gray-900 dark:text-white">
                  {children}
                </strong>
              ),
              em: ({children}) => (
                <em className="italic text-gray-600 dark:text-gray-300">
                  {children}
                </em>
              ),
              ul: ({children}) => (
                <ul className="list-disc list-inside mb-2 space-y-0.5 text-gray-700 dark:text-gray-300">
                  {children}
                </ul>
              ),
              ol: ({children}) => (
                <ol className="list-decimal list-inside mb-2 space-y-0.5 text-gray-700 dark:text-gray-300">
                  {children}
                </ol>
              ),
              li: ({children}) => (
                <li className="text-gray-700 dark:text-gray-300">
                  {children}
                </li>
              ),
              code: ({node, inline, className, children, ...props}) => {
                const isInline = inline || !node || node.tagName !== 'pre';
                
                if (isInline) {
                  return (
                    <code 
                    className="px-1 py-0.5 rounded text-sm font-mono bg-gray-100 dark:bg-slate-600 text-gray-900 dark:text-white"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="p-3 rounded-lg overflow-x-auto sm:overflow-x-auto overflow-x-hidden whitespace-pre-wrap break-words mb-3 bg-gray-100 dark:bg-slate-600 text-gray-900 dark:text-white">
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
                <blockquote className="border-l-4 pl-4 italic mb-3 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                  {children}
                </blockquote>
              ),
              table: ({children}) => (
                <div className="overflow-x-auto mb-3">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    {children}
                  </table>
                </div>
              ),
              th: ({children}) => (
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                  {children}
                </th>
              ),
              td: ({children}) => (
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                  {children}
                </td>
              ),
              a: ({children, href}) => (
                <a 
                  href={href}
                  className="underline text-primary hover:text-primary-hover"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              hr: () => (
                <hr className="my-4 border-t border-gray-300 dark:border-gray-600" />
              )
            }}
          >
            {cleanContentForMarkdown(content)}
          </ReactMarkdown>
        </div>
      </div>
      
      {/* Collapsed state preview */}
      <div 
        className="px-4 py-2 text-sm italic text-gray-500 dark:text-gray-400"
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
  const isEnvironment = message.type === 'environment';
  const isReasoning = message.type === 'reasoning';
  
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
  
  // Check for commands - prioritize grouped commands first
  const isGroupedCommandMessage = isGroupedCommand(message);
  const detectedCommand = isGroupedCommandMessage 
    ? getCombinedCommand(message) 
    : detectCommand(extractQChatContent(message.content), session.type);
  const isCommand = detectedCommand !== null;

  // Special handling for environment context messages
  if (isEnvironment) {
    return <EnvironmentContextDisplay message={message} />;
  }

  // Special handling for reasoning messages
  if (isReasoning) {
    return <ReasoningMessageDisplay message={message} sessionType={sessionType} />;
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-4xl min-w-0 break-words overflow-wrap-anywhere ${isUser ? 'ml-12' : 'mr-12'}`}>
        {/* Message Header */}
        <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className="group flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
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
                  referrerPolicy="no-referrer"
                />
              ) : isSystem ? '🔧' : 
                sessionType === SESSION_TYPES.Q_CHAT ? 
                  <img src="/q-logo.png" alt="Amazon Q" className="w-4 h-4" /> :
                  sessionType === SESSION_TYPES.GEMINI_CLI ? 
                    <img src="/gemini-cli-logo.png" alt="Gemini CLI" className="w-4 h-4" /> :
                  sessionType === SESSION_TYPES.CODEX ? (
                    <>
                      <img 
                        src="/openai-logo-dark.png" 
                        alt="OpenAI" 
                        className="w-6 h-6 dark:hidden" 
                      />
                      <img 
                        src="/openai-logo-light.png" 
                        alt="OpenAI" 
                        className="w-6 h-6 hidden dark:block" 
                      />
                    </>
                  ) :
                    <img src="/claude-logo.png" alt="Claude" className="w-4 h-4" />
              }
            </span>
            <span className={`font-medium ${
              message.type === 'user' ? '' : 'capitalize'
            }`}>
              {message.type === 'assistant' && sessionType === SESSION_TYPES.CLAUDE_CODE ? 'Claude' : 
               message.type === 'assistant' && sessionType === SESSION_TYPES.Q_CHAT ? 'Amazon Q' :
               message.type === 'assistant' && sessionType === SESSION_TYPES.GEMINI_CLI ? 'Gemini' :
               message.type === 'assistant' && sessionType === SESSION_TYPES.CODEX ? 'Codex' :
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
          </div>
        </div>

        {/* Message Content */}
        <div className={`relative rounded-lg ${
          !isSystem && !shouldRenderCode && !shouldRenderMarkdown && !isCommand ? 'p-4 pr-12' : 'p-4'
        } ${
          isCommand 
            ? 'p-0 bg-transparent'
            : isUser 
            ? 'bg-primary-dark dark:bg-primary-dark text-white' 
            : isSystem
            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 shadow-sm text-gray-900 dark:text-gray-100'
            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm text-gray-900 dark:text-gray-100'
        }`}>
          {/* Copy Button - Hide for tool blocks, code blocks, markdown blocks, commands, and tool calls */}
          {!isSystem && !shouldRenderCode && !shouldRenderMarkdown && !isCommand && !(message.toolCalls && message.toolCalls.length > 0) && (
            <button
              onClick={() => copyToClipboard(extractQChatContent(message.content))}
              className={`absolute top-1 right-1 p-1.5 rounded-md transition-all ${
                copySuccess
                  ? 'bg-secondary/20 text-secondary-dark dark:bg-secondary-light/30 dark:text-secondary-light'
                  : isUser
                  ? 'hover:bg-white/20 text-white/80 hover:text-white bg-black/10 hover:bg-black/20'
                  : 'hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="Copy message"
            >
              {copySuccess ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              )}
            </button>
          )}

          {/* Main Content */}
          <div className="mb-3">
            {isCommand ? (
              <CommandDisplay 
                command={detectedCommand} 
                sessionType={session.type} 
              />
            ) : shouldRenderCode ? (
              // NOTE: User code blocks don't get language-specific syntax highlighting because
              // user messages lack metadata.toolUseResult.file.filePath that AI tool results have.
              // They use the unified CodeBlock component but render as plain text.
              <CodeBlock 
                content={cleanContentForMarkdown(extractQChatContent(message.content))}
                language={getLanguageFromPath(message?.metadata?.toolUseResult?.file?.filePath) || 'text'}
                filePath={message?.metadata?.toolUseResult?.file?.filePath}
                allCodeBlocksCollapsed={allCodeBlocksCollapsed}
                forceCollapseToggle={forceCollapseToggle}
              />
            ) : shouldRenderMarkdown ? (
              <MarkdownBlock 
                content={extractQChatContent(message.content)}
                allMarkdownBlocksCollapsed={allMarkdownBlocksCollapsed}
                forceMarkdownCollapseToggle={forceMarkdownCollapseToggle}
              />
            ) : (
              <div className="whitespace-pre-wrap">
                {extractQChatContent(message.content)}
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
                  sessionType={sessionType}
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
                ? 'bg-primary/5 dark:bg-primary-light/100 border-blue-300 text-blue-100' 
                : 'bg-primary/10 dark:bg-primary-light/20 border-blue-400 text-primary-hover'
            }`}>
              <div className="text-xs font-medium mb-1">Additional Context</div>
              <div className="text-xs whitespace-pre-wrap">
                {message.metadata.additional_context}
              </div>
            </div>
          )}
          
          {/* Environment Context - Hidden for Q Chat sessions */}
          {message.metadata?.env_context?.env_state && sessionType !== SESSION_TYPES.Q_CHAT && (
            <div className={`mt-3 p-3 rounded ${
              isUser ? 'bg-primary/5 dark:bg-primary-light/100 text-blue-100' : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
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
            className="text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 underline cursor-pointer"
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
  const [showNormalized, setShowNormalized] = useState(false);
  
  // Use original raw data if available, otherwise fall back to normalized message
  const displayData = showNormalized ? message : (message.originalRawData || message);
  const rawText = JSON.stringify(displayData, null, 2);
  const hasOriginalData = !!message.originalRawData;

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
    <div className="mt-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 rounded">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {showNormalized ? 'Normalized Message Data' : 'Original Raw Data'}
          </span>
          {hasOriginalData && (
            <button
              onClick={() => setShowNormalized(!showNormalized)}
              className="text-xs text-primary hover:text-primary-hover underline cursor-pointer"
            >
              Show {showNormalized ? 'Original' : 'Normalized'}
            </button>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all ${
            copySuccess
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 dark:bg-slate-500 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
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
        <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto">
          {rawText}
        </pre>
      </div>
    </div>
  );
}

function UnifiedToolUseDisplay({ toolUse, isUser, sessionType }) {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className={`rounded-lg p-4 ${
      isUser 
        ? 'bg-primary/5 dark:bg-primary-light/100 border border-blue-400' 
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className={isUser ? 'text-blue-100' : 'text-yellow-600'}>🔧</span>
          <span className={`font-medium break-words ${
            isUser ? 'text-blue-100' : 'text-yellow-900'
          }`}>
            Tool: {toolUse.name}
          </span>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className={`text-xs underline whitespace-nowrap flex-shrink-0 ${
            isUser 
              ? 'text-blue-200 hover:text-blue-100' 
              : 'text-yellow-600 hover:text-yellow-800'
          }`}
        >
          {showInput ? 'Hide' : 'Show'} Input
        </button>
      </div>
      
      <div className="space-y-2">

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
        <button
          onClick={onToggleDetails}
          className={`text-sm underline ${
            isUser 
              ? 'text-blue-200 hover:text-blue-100' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
                ? 'bg-primary/5 dark:bg-primary-light/10 text-blue-100' 
                : 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
            }`}>
              {/* Try to format shell command output nicely */}
              {(() => {
                if (typeof result.content === 'string') {
                  try {
                    const parsed = JSON.parse(result.content);
                    if (parsed.output) {
                      return (
                        <div className="space-y-2">
                          <pre className={`text-sm font-mono whitespace-pre-wrap overflow-auto ${
                            isUser ? 'text-blue-100' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {parsed.output}
                          </pre>
                          {parsed.metadata && (
                            <div className={`text-xs ${
                              isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              Exit code: {parsed.metadata.exit_code}, Duration: {parsed.metadata.duration_seconds}s
                            </div>
                          )}
                        </div>
                      );
                    }
                  } catch (e) {
                    // If parsing fails, show raw content
                  }
                  
                  // Show raw string content
                  return (
                    <pre className={`text-sm font-mono whitespace-pre-wrap overflow-auto ${
                      isUser ? 'text-blue-100' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {result.content}
                    </pre>
                  );
                }
                
                // Fallback to JSON display
                return (
                  <pre className={`text-xs font-mono overflow-auto ${
                    isUser ? 'text-blue-100' : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                );
              })()}
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
      isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'
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
            ? 'bg-primary/5 dark:bg-primary-light/100 text-blue-100' 
            : 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
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
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Prompts</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">All messages sent by the user in this session</p>
      </div>
      
      <div className="p-4">
        {sortedUserMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">💬</div>
            <p className="text-gray-600 dark:text-gray-300">No user messages found</p>
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
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {sessionAuthor.userId ? (
                        <Link href={`/users/${sessionAuthor.userId}`} className="hover:underline">
                          {sessionAuthor.username}
                        </Link>
                      ) : sessionAuthor.username}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(extractQChatContent(message.content), message.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600"
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
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {extractQChatContent(message.content)}
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
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tool Usage</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {toolCalls.length} tool call{toolCalls.length !== 1 ? 's' : ''} in this session
            </p>
          </div>
          {toolCalls.length > 0 && (
            <button
              onClick={toggleAllExpanded}
              className="flex items-center space-x-1 text-sm text-primary hover:text-primary-hover px-3 py-1 rounded-md hover:bg-primary/5 dark:bg-primary-light/10 transition-colors"
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
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🔧</div>
            <p className="text-gray-600 dark:text-gray-300">No tools were used in this session</p>
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
          <span className="font-medium text-gray-900 dark:text-white">{tool.name}</span>
          {tool.metadata?.orig_name && tool.metadata.orig_name !== tool.name && (
            <span className="text-xs bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
              orig: {tool.metadata.orig_name}
            </span>
          )}
        </div>
      </div>


      {/* Summary (Q Chat feature) */}
      {tool.metadata?.summary && (
        <div className="mb-3 p-3 bg-primary/5 dark:bg-primary-light/10 border border-blue-200 rounded">
          <div className="text-sm font-medium text-primary-hover mb-1">Summary:</div>
          <div className="text-sm text-blue-700">{tool.metadata.summary}</div>
        </div>
      )}

      {/* Input Parameters */}
      {tool.input && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Parameters:</div>
            <button
              onClick={() => setShowInput(!showInput)}
              className="text-xs text-yellow-600 hover:text-yellow-800 underline"
            >
              {showInput ? 'Hide' : 'Show'}
            </button>
          </div>
          {showInput && (
            <pre className="text-xs bg-gray-50 dark:bg-slate-700 p-2 rounded border overflow-auto">
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
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Original Arguments:</div>
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

  const handleDownload = () => {
    const sessionTitle = session.metadata?.title || session.title || 'session';
    const filename = `${sessionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const blob = new Blob([rawText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Raw Session Data</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Complete raw data representation of the session</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              copySuccess
                ? 'bg-secondary/20 text-secondary-dark dark:bg-secondary-light/30 dark:text-secondary-light border border-secondary/30 dark:border-secondary-light/30'
                : 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-500 border border-gray-200 dark:border-slate-600'
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
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all bg-primary/10 dark:bg-primary-light/20 text-primary-dark dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary-light/30 border border-primary/30 dark:border-primary-light/30"
          >
            <DownloadIcon />
            <span>Download</span>
          </button>
        </div>
      </div>
      <div className="p-4">
        <pre className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg overflow-auto text-xs max-h-96">
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


function ReasoningMessageDisplay({ message, sessionType }) {
  const [showRawData, setShowRawData] = useState(false);

  return (
    <div className="mb-4">
      <div className="max-w-4xl mr-12">
        {/* Message Header */}
        <div className="flex items-center mb-2 justify-start">
          <div className="group flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
              {sessionType === SESSION_TYPES.CODEX ? (
                <>
                  <img 
                    src="/openai-logo-dark.png" 
                    alt="OpenAI" 
                    className="w-5 h-5 dark:hidden" 
                  />
                  <img 
                    src="/openai-logo-light.png" 
                    alt="OpenAI" 
                    className="w-5 h-5 hidden dark:block" 
                  />
                </>
              ) : (
                <span className="text-purple-600 dark:text-purple-300">🧠</span>
              )}
            </span>
            <span className="font-medium">
              {sessionType === SESSION_TYPES.CODEX ? 'Codex' : 'Assistant'} <span className="text-xs text-gray-400">(reasoning)</span>
            </span>
          </div>
        </div>

        {/* Reasoning Content */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  // Force short code snippets to be inline
                  const codeText = String(children).trim();
                  const isShortCode = codeText.length < 50 && !codeText.includes('\n');
                  
                  if (inline || isShortCode) {
                    return <code className="bg-purple-100 dark:bg-purple-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
                  }
                  return <code className="block bg-purple-100 dark:bg-purple-800 p-2 rounded text-sm font-mono overflow-x-auto" {...props}>{children}</code>;
                },
                pre: ({ children }) => {
                  // Extract code content to check if it should be inline
                  const codeContent = children?.props?.children;
                  const codeText = String(codeContent).trim();
                  const isShortCode = codeText.length < 50 && !codeText.includes('\n');
                  
                  if (isShortCode) {
                    // Render as inline code instead of pre block
                    return <code className="bg-purple-100 dark:bg-purple-800 px-1 py-0.5 rounded text-sm font-mono">{codeContent}</code>;
                  }
                  return <div className="my-2">{children}</div>;
                },
                p: ({ children }) => {
                  // Add extra spacing for paragraphs to ensure separation
                  return <p className="mb-4">{children}</p>;
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Show Raw Data Link */}
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 underline transition-colors"
          >
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </button>
        </div>

        {/* Raw Data Display */}
        {showRawData && (
          <div className="mt-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3">
            <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(message.originalRawData || message, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function EnvironmentContextDisplay({ message }) {
  const parseEnvironmentContext = (content) => {
    const contextInfo = {};
    
    // Extract working directory - support both XML and plain text formats
    const cwdXmlMatch = content.match(/<cwd>(.+?)<\/cwd>/);
    const cwdTextMatch = content.match(/Current working directory:\s*([^\n]+)/);
    if (cwdXmlMatch) contextInfo.cwd = cwdXmlMatch[1].trim();
    else if (cwdTextMatch) contextInfo.cwd = cwdTextMatch[1].trim();
    
    // Extract approval policy - support both XML and plain text formats
    const approvalXmlMatch = content.match(/<approval_policy>(.+?)<\/approval_policy>/);
    const approvalTextMatch = content.match(/Approval policy:\s*([^\n]+)/);
    if (approvalXmlMatch) contextInfo.approvalPolicy = approvalXmlMatch[1].trim();
    else if (approvalTextMatch) contextInfo.approvalPolicy = approvalTextMatch[1].trim();
    
    // Extract sandbox mode - support both XML and plain text formats
    const sandboxXmlMatch = content.match(/<sandbox_mode>(.+?)<\/sandbox_mode>/);
    const sandboxTextMatch = content.match(/Sandbox mode:\s*([^\n]+)/);
    if (sandboxXmlMatch) contextInfo.sandboxMode = sandboxXmlMatch[1].trim();
    else if (sandboxTextMatch) contextInfo.sandboxMode = sandboxTextMatch[1].trim();
    
    // Extract network access - support both XML and plain text formats
    const networkXmlMatch = content.match(/<network_access>(.+?)<\/network_access>/);
    const networkTextMatch = content.match(/Network access:\s*([^\n]+)/);
    if (networkXmlMatch) contextInfo.networkAccess = networkXmlMatch[1].trim();
    else if (networkTextMatch) contextInfo.networkAccess = networkTextMatch[1].trim();
    
    // Extract shell from XML tags (XML format only)
    const shellMatch = content.match(/<shell>(.+?)<\/shell>/);
    if (shellMatch) contextInfo.shell = shellMatch[1].trim();
    
    return contextInfo;
  };
  
  const envInfo = parseEnvironmentContext(message.content);
  
  return (
    <div className="mb-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">Environment Context</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {envInfo.cwd && (
            <div className="flex items-start">
              <span className="font-medium text-blue-800 dark:text-blue-200 mr-2 min-w-0">Directory:</span>
              <span className="text-blue-700 dark:text-blue-300 font-mono text-xs break-all">{envInfo.cwd}</span>
            </div>
          )}
          
          {envInfo.approvalPolicy && (
            <div className="flex items-start">
              <span className="font-medium text-blue-800 dark:text-blue-200 mr-2">Approval:</span>
              <span className="text-blue-700 dark:text-blue-300">{envInfo.approvalPolicy}</span>
            </div>
          )}
          
          {envInfo.sandboxMode && (
            <div className="flex items-start">
              <span className="font-medium text-blue-800 dark:text-blue-200 mr-2">Sandbox:</span>
              <span className="text-blue-700 dark:text-blue-300">{envInfo.sandboxMode}</span>
            </div>
          )}
          
          {envInfo.networkAccess && (
            <div className="flex items-start">
              <span className="font-medium text-blue-800 dark:text-blue-200 mr-2">Network:</span>
              <span className="text-blue-700 dark:text-blue-300">{envInfo.networkAccess}</span>
            </div>
          )}
          
          {envInfo.shell && (
            <div className="flex items-start">
              <span className="font-medium text-blue-800 dark:text-blue-200 mr-2">Shell:</span>
              <span className="text-blue-700 dark:text-blue-300">{envInfo.shell}</span>
            </div>
          )}
        </div>
      </div>
    </div>
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

function GearIcon() {
  return (
    <svg className="w-5 h-5 transition-transform duration-200 hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function VisibilityBadge({ isPrivate, onToggle, isOwner }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isOwner && onToggle) {
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
      } ${!(isOwner && onToggle) ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}`}
      title={
        isOwner && onToggle
          ? (isPrivate ? 'Click to make public' : 'Click to make private')
          : (isPrivate ? 'Private session' : 'Public session')
      }
    >
      <span className="mr-1 transition-all duration-200">
        {isPrivate ? (
          // Lock icon for private (changes to unlock on hover)
          isHovered && isOwner && onToggle ? (
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
          // Globe icon for public (changes to lock on hover)
          isHovered && isOwner && onToggle ? (
            // Lock icon on hover
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 3c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm6 17H6V10h12v10z"/>
            </svg>
          ) : (
            // Globe icon default
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          )
        )}
      </span>
      {isPrivate ? 'Private' : 'Public'}
    </button>
  );
}

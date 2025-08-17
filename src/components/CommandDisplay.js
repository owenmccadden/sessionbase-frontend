/**
 * Custom UI components for displaying slash commands and bash commands
 * with distinct styling from regular message content
 */

import React, { useState } from 'react';
import { COMMAND_TYPES } from '../utils/commandDetector';

/**
 * Main command display component that renders different command types
 */
export function CommandDisplay({ command, sessionType }) {
  if (!command) return null;

  switch (command.type) {
    case COMMAND_TYPES.SLASH_COMMAND:
      return <SlashCommandDisplay command={command} />;
    case COMMAND_TYPES.BASH_COMMAND:
      return <BashCommandDisplay command={command} sessionType={sessionType} />;
    case COMMAND_TYPES.BASH_OUTPUT:
      return <BashOutputDisplay command={command} />;
    default:
      return null;
  }
}

/**
 * Display component for slash commands
 */
function SlashCommandDisplay({ command }) {
  const [copyCommand, setCopyCommand] = useState(false);
  const [copyOutput, setCopyOutput] = useState(false);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command.command);
      setCopyCommand(true);
      setTimeout(() => setCopyCommand(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(command.output || '');
      setCopyOutput(true);
      setTimeout(() => setCopyOutput(false), 2000);
    } catch (err) {
      console.error('Failed to copy output:', err);
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 my-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-mono">
            /
          </div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Slash Command
          </span>
        </div>
        <button
          onClick={handleCopyCommand}
          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded transition-colors"
        >
          {copyCommand ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      <div className="font-mono text-sm bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-600 rounded px-3 py-2">
        <span className="text-gray-900 dark:text-gray-100">{command.command}</span>
      </div>
      
      {command.message && (
        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          {command.message}
        </div>
      )}
      
      {command.output && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Output:
            </div>
            <button
              onClick={handleCopyOutput}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded transition-colors"
            >
              {copyOutput ? 'Copied!' : 'Copy Output'}
            </button>
          </div>
          <div className="font-mono text-sm bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-600 rounded px-3 py-2 max-h-64 overflow-y-auto">
            <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{command.output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Display component for bash commands
 */
function BashCommandDisplay({ command, sessionType }) {
  const [copyCommand, setCopyCommand] = useState(false);
  const [copyOutput, setCopyOutput] = useState(false);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command.command);
      setCopyCommand(true);
      setTimeout(() => setCopyCommand(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const handleCopyOutput = async () => {
    try {
      const outputText = command.stderr ? `${command.stdout}\n${command.stderr}` : (command.output || command.stdout || '');
      await navigator.clipboard.writeText(outputText);
      setCopyOutput(true);
      setTimeout(() => setCopyOutput(false), 2000);
    } catch (err) {
      console.error('Failed to copy output:', err);
    }
  };

  // Different styling based on session type
  const getCommandStyle = () => {
    switch (sessionType) {
      case 'claude-code':
      case 'gemini-cli':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300';
    }
  };

  const getIconColor = () => {
    switch (sessionType) {
      case 'claude-code':
      case 'gemini-cli':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  const getBorderColor = () => {
    switch (sessionType) {
      case 'claude-code':
      case 'gemini-cli':
        return 'border-blue-200 dark:border-blue-600';
      default:
        return 'border-green-200 dark:border-green-600';
    }
  };

  const getButtonColor = () => {
    switch (sessionType) {
      case 'claude-code':
      case 'gemini-cli':
        return 'bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-300';
    }
  };

  // Check if we have any output to display
  const hasOutput = command.output || command.stdout || command.stderr;

  return (
    <div className={`${getCommandStyle()} border rounded-lg p-4 my-3`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-5 h-5 ${getIconColor()} rounded text-white text-xs flex items-center justify-center font-mono`}>
            $
          </div>
          <span className="text-sm font-medium">
            Shell Command
          </span>
        </div>
        <button
          onClick={handleCopyCommand}
          className={`text-xs px-2 py-1 ${getButtonColor()} rounded transition-colors`}
        >
          {copyCommand ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      <div className={`font-mono text-sm bg-white dark:bg-slate-800 border ${getBorderColor()} rounded px-3 py-2`}>
        <span className="text-gray-900 dark:text-gray-100">{command.command}</span>
      </div>
      
      {hasOutput && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium">
              Output{command.isTruncated && (
                <span className="ml-1 text-orange-600 dark:text-orange-400">(truncated)</span>
              )}:
            </div>
            <button
              onClick={handleCopyOutput}
              className={`text-xs px-2 py-1 ${getButtonColor()} rounded transition-colors`}
            >
              {copyOutput ? 'Copied!' : 'Copy Output'}
            </button>
          </div>
          
          {/* Display stdout */}
          {(command.output || command.stdout) && (
            <div className={`font-mono text-sm bg-white dark:bg-slate-800 border ${getBorderColor()} rounded px-3 py-2 max-h-64 overflow-y-auto${command.stderr ? ' mb-2' : ''}`}>
              <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{command.output || command.stdout}</pre>
            </div>
          )}
          
          {/* Display stderr if present */}
          {command.stderr && (
            <div>
              <div className="text-xs text-red-600 dark:text-red-400 mb-1">stderr:</div>
              <div className="font-mono text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded px-3 py-2 max-h-64 overflow-y-auto">
                <pre className="text-red-700 dark:text-red-300 whitespace-pre-wrap">{command.stderr}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Display component for bash output (Claude Code specific)
 */
function BashOutputDisplay({ command }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = command.stderr ? `${command.stdout}\n${command.stderr}` : command.stdout;
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy output:', err);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4 my-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-500 rounded text-white text-xs flex items-center justify-center font-mono">
            →
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Command Output
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors"
        >
          {copySuccess ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      {command.stdout && (
        <div className="mb-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">stdout:</div>
          <div className="font-mono text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded px-3 py-2 max-h-64 overflow-y-auto">
            <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{command.stdout}</pre>
          </div>
        </div>
      )}
      
      {command.stderr && (
        <div>
          <div className="text-xs text-red-600 dark:text-red-400 mb-1">stderr:</div>
          <div className="font-mono text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded px-3 py-2 max-h-64 overflow-y-auto">
            <pre className="text-red-700 dark:text-red-300 whitespace-pre-wrap">{command.stderr}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
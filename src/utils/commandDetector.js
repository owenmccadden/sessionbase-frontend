/**
 * Command detection utility for identifying slash commands and bash commands
 * in different AI platform session formats
 */

import { SESSION_TYPES } from './sessionParser';

/**
 * Command types
 */
export const COMMAND_TYPES = {
  SLASH_COMMAND: 'slash_command',
  BASH_COMMAND: 'bash_command',
  BASH_OUTPUT: 'bash_output'
};

/**
 * Detect and parse commands from message content
 * @param {string} content - The message content
 * @param {string} sessionType - The session type (from SESSION_TYPES)
 * @returns {Object|null} Parsed command object or null if no command detected
 */
export function detectCommand(content, sessionType) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  switch (sessionType) {
    case SESSION_TYPES.CLAUDE_CODE:
      return detectClaudeCodeCommand(content);
    case SESSION_TYPES.GEMINI_CLI:
      return detectGeminiCommand(content);
    case SESSION_TYPES.Q_CHAT:
      return detectQChatCommand(content);
    default:
      return null;
  }
}

/**
 * Detect commands in Claude Code format
 * Claude Code slash commands: <command-name>/compact</command-name>
 * Claude Code bash commands: <bash-input>pwd</bash-input>
 * Claude Code bash output: <bash-stdout>...</bash-stdout>
 */
function detectClaudeCodeCommand(content) {
  // Check for slash commands with potential output
  const slashCommandMatch = content.match(/<command-name>([^<]+)<\/command-name>/);
  if (slashCommandMatch) {
    const commandName = slashCommandMatch[1];
    
    // Extract command message if present
    const messageMatch = content.match(/<command-message>([^<]*)<\/command-message>/);
    const argsMatch = content.match(/<command-args>([^<]*)<\/command-args>/);
    
    // Check for associated output in the same content
    const localCommandMatch = content.match(/<local-command-stdout>([^<]+)<\/local-command-stdout>/);
    
    return {
      type: COMMAND_TYPES.SLASH_COMMAND,
      command: commandName,
      message: messageMatch ? messageMatch[1] : '',
      args: argsMatch ? argsMatch[1] : '',
      output: localCommandMatch ? localCommandMatch[1] : '',
      rawContent: content
    };
  }

  // Check for bash input commands with potential output in same message
  const bashInputMatch = content.match(/<bash-input>([^<]+)<\/bash-input>/);
  if (bashInputMatch) {
    // Look for associated bash output in the same content
    const bashOutputMatch = content.match(/<bash-stdout>([^<]*)<\/bash-stdout>/);
    const bashStderrMatch = content.match(/<bash-stderr>([^<]*)<\/bash-stderr>/);
    
    return {
      type: COMMAND_TYPES.BASH_COMMAND,
      command: bashInputMatch[1],
      stdout: bashOutputMatch ? bashOutputMatch[1] : '',
      stderr: bashStderrMatch ? bashStderrMatch[1] : '',
      rawContent: content
    };
  }

  // Check for standalone bash output (fallback for separate output messages)
  const bashOutputMatch = content.match(/<bash-stdout>([^<]*)<\/bash-stdout>/);
  if (bashOutputMatch) {
    const stderr = content.match(/<bash-stderr>([^<]*)<\/bash-stderr>/);
    return {
      type: COMMAND_TYPES.BASH_OUTPUT,
      stdout: bashOutputMatch[1],
      stderr: stderr ? stderr[1] : '',
      rawContent: content
    };
  }

  // Check for standalone local command output (fallback for separate output messages)
  const localCommandMatch = content.match(/<local-command-stdout>([^<]+)<\/local-command-stdout>/);
  if (localCommandMatch) {
    return {
      type: COMMAND_TYPES.SLASH_COMMAND,
      output: localCommandMatch[1],
      rawContent: content
    };
  }

  return null;
}

/**
 * Detect commands in Gemini CLI format
 * Gemini bash commands are shown as:
 * "I ran the following shell command:\n```sh\npwd\n```\n\nThis produced the following result:\n```\n/path\n```"
 */
function detectGeminiCommand(content) {
  // Pattern for Gemini bash command with output
  const geminiCommandPattern = /I ran the following shell command:\s*```(?:sh|bash)?\s*\n([^`]+)\n```\s*\n*This produced the following result:\s*```\s*\n([^`]*?)(?:\(truncated\))?\s*\n```/s;
  
  const match = content.match(geminiCommandPattern);
  if (match) {
    const command = match[1].trim();
    const output = match[2].trim();
    const isTruncated = content.includes('(truncated)');
    
    return {
      type: COMMAND_TYPES.BASH_COMMAND,
      command: command,
      output: output,
      isTruncated: isTruncated,
      rawContent: content
    };
  }

  return null;
}

/**
 * Detect commands in Q Chat format
 * Q Chat omits slash commands, but may have bash commands in tool results
 */
function detectQChatCommand() {
  // Q Chat doesn't typically show commands in the session log
  // But we might detect bash-like patterns in tool results
  return null;
}

/**
 * Check if a message contains any type of command
 * @param {string} content - The message content
 * @param {string} sessionType - The session type
 * @returns {boolean} True if content contains a command
 */
export function hasCommand(content, sessionType) {
  return detectCommand(content, sessionType) !== null;
}

/**
 * Extract just the command part from content that contains commands
 * @param {string} content - The message content
 * @param {string} sessionType - The session type
 * @returns {string|null} The extracted command or null
 */
export function extractCommandText(content, sessionType) {
  const command = detectCommand(content, sessionType);
  return command ? command.command : null;
}

/**
 * Check if content is purely a command (no other text)
 * @param {string} content - The message content
 * @param {string} sessionType - The session type
 * @returns {boolean} True if content is purely a command
 */
export function isPureCommand(content, sessionType) {
  const command = detectCommand(content, sessionType);
  if (!command) return false;
  
  // For Claude Code, check if the raw content is just the command tags
  if (sessionType === SESSION_TYPES.CLAUDE_CODE) {
    const cleanedContent = content.trim();
    const commandTags = command.rawContent.trim();
    return cleanedContent === commandTags;
  }
  
  // For Gemini, check if it's the standard command format
  if (sessionType === SESSION_TYPES.GEMINI_CLI && command.type === COMMAND_TYPES.BASH_COMMAND) {
    return content.includes('I ran the following shell command:');
  }
  
  return false;
}
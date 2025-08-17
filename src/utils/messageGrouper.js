/**
 * Message grouping utility to combine related command messages
 * (e.g., bash input + bash output, slash command + slash output)
 */

import { detectCommand, COMMAND_TYPES } from './commandDetector';
import { SESSION_TYPES } from './sessionParser';

/**
 * Group related command messages together
 * @param {Array} messages - Array of normalized messages
 * @param {string} sessionType - The session type
 * @returns {Array} Array of messages with command groups combined
 */
export function groupCommandMessages(messages, sessionType) {
  if (sessionType !== SESSION_TYPES.CLAUDE_CODE) {
    // Only apply grouping to Claude Code sessions for now
    return messages;
  }

  const groupedMessages = [];
  let i = 0;

  while (i < messages.length) {
    const currentMessage = messages[i];
    const currentCommand = detectCommand(currentMessage.content, sessionType);

    // Check if this is a command input that might have a following output
    if (currentCommand && (currentCommand.type === COMMAND_TYPES.BASH_COMMAND || currentCommand.type === COMMAND_TYPES.SLASH_COMMAND)) {
      // Look ahead for a matching output message
      const nextMessage = i + 1 < messages.length ? messages[i + 1] : null;
      const nextCommand = nextMessage ? detectCommand(nextMessage.content, sessionType) : null;

      // Check if the next message is a matching output
      const isMatchingOutput = nextCommand && (
        (currentCommand.type === COMMAND_TYPES.BASH_COMMAND && nextCommand.type === COMMAND_TYPES.BASH_OUTPUT) ||
        (currentCommand.type === COMMAND_TYPES.SLASH_COMMAND && nextCommand.type === COMMAND_TYPES.SLASH_COMMAND && nextCommand.output)
      );

      if (isMatchingOutput) {
        // Combine the command input with its output
        const combinedCommand = {
          ...currentCommand,
          output: nextCommand.output || nextCommand.stdout || '',
          stdout: nextCommand.stdout || '',
          stderr: nextCommand.stderr || '',
          rawContent: currentMessage.content + '\n' + nextMessage.content
        };

        // Create a combined message
        const combinedMessage = {
          ...currentMessage,
          content: combinedCommand.rawContent,
          combinedCommand: combinedCommand,
          isCommandGroup: true,
          groupedMessageIds: [currentMessage.id, nextMessage.id]
        };

        groupedMessages.push(combinedMessage);
        i += 2; // Skip both messages since we combined them
      } else {
        // No matching output found, keep the original message
        groupedMessages.push(currentMessage);
        i += 1;
      }
    } else if (currentCommand && currentCommand.type === COMMAND_TYPES.BASH_OUTPUT) {
      // Check if this is an orphaned output (previous message wasn't grouped)
      const prevMessage = groupedMessages[groupedMessages.length - 1];
      if (prevMessage && !prevMessage.isCommandGroup) {
        const prevCommand = detectCommand(prevMessage.content, sessionType);
        if (prevCommand && prevCommand.type === COMMAND_TYPES.BASH_COMMAND) {
          // This output belongs to the previous command, but we missed it
          // Remove the previous message and create a combined one
          groupedMessages.pop();
          
          const combinedCommand = {
            ...prevCommand,
            output: currentCommand.stdout || '',
            stdout: currentCommand.stdout || '',
            stderr: currentCommand.stderr || '',
            rawContent: prevMessage.content + '\n' + currentMessage.content
          };

          const combinedMessage = {
            ...prevMessage,
            content: combinedCommand.rawContent,
            combinedCommand: combinedCommand,
            isCommandGroup: true,
            groupedMessageIds: [prevMessage.id, currentMessage.id]
          };

          groupedMessages.push(combinedMessage);
          i += 1;
        } else {
          // Keep as separate message
          groupedMessages.push(currentMessage);
          i += 1;
        }
      } else {
        // Keep as separate message
        groupedMessages.push(currentMessage);
        i += 1;
      }
    } else {
      // Regular message, keep as-is
      groupedMessages.push(currentMessage);
      i += 1;
    }
  }

  return groupedMessages;
}

/**
 * Check if a message is a grouped command message
 * @param {Object} message - The message object
 * @returns {boolean} True if the message is a grouped command
 */
export function isGroupedCommand(message) {
  return message.isCommandGroup === true && message.combinedCommand;
}

/**
 * Get the combined command from a grouped message
 * @param {Object} message - The grouped message
 * @returns {Object|null} The combined command object or null
 */
export function getCombinedCommand(message) {
  return message.combinedCommand || null;
}
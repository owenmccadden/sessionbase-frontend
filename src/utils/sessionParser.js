/**
 * Unified session parser that can handle multiple AI chat formats
 * and normalize them into a common structure for display
 */

// Common session structure that all formats will be normalized to
export const SESSION_TYPES = {
  Q_CHAT: 'q-chat',
  CLAUDE_CODE: 'claude-code',
  CURSOR: 'cursor',
  GEMINI_CLI: 'gemini-cli',
  UNKNOWN: 'unknown'
};

/**
 * Normalized session structure
 * @typedef {Object} NormalizedSession
 * @property {string} id - Session identifier
 * @property {string} type - Session type (from SESSION_TYPES)
 * @property {string} title - Human readable session title
 * @property {Object} metadata - Session metadata (timestamps, versions, etc.)
 * @property {Array} messages - Array of normalized messages
 * @property {Object} stats - Session statistics
 * @property {Object} rawData - Original raw data for debugging
 */

/**
 * Normalized message structure
 * @typedef {Object} NormalizedMessage
 * @property {string} id - Unique message identifier
 * @property {string} type - 'user' | 'assistant' | 'system' | 'tool'
 * @property {string} role - Message role
 * @property {string} content - Main message content
 * @property {Date} timestamp - Message timestamp
 * @property {Object} metadata - Additional message metadata
 * @property {Array} toolCalls - Array of tool calls if any
 * @property {Object} context - Environment/additional context
 */

/**
 * Detect the format of session data
 * @param {string|Object} data - Raw session data
 * @returns {string} Session type from SESSION_TYPES
 */
export function detectSessionFormat(data) {
  try {
    // Handle string data (might be JSON or JSONL)
    if (typeof data === 'string') {
      // Check if it looks like JSONL (multiple lines with JSON objects)
      if (data.includes('\n{') && data.split('\n').filter(line => line.trim()).length > 1) {
        const lines = data.trim().split('\n');
        const firstLine = JSON.parse(lines[0]);
        
        // Claude Code JSONL detection
        if (firstLine.sessionId && firstLine.type && firstLine.message && firstLine.uuid) {
          return SESSION_TYPES.CLAUDE_CODE;
        }
        
        return SESSION_TYPES.UNKNOWN;
      }
      
      // Try to parse as JSON
      data = JSON.parse(data);
    }
    
    // Claude Code wrapped format detection (new format with messages array)
    if (data.messages && Array.isArray(data.messages) && data.platform) {
      // Check if messages have Claude Code structure
      const firstMessage = data.messages[0];
      if (firstMessage && firstMessage.sessionId && firstMessage.type && firstMessage.message && firstMessage.uuid) {
        return SESSION_TYPES.CLAUDE_CODE;
      }
    }
    
    // Q Chat JSON detection
    if (data.conversation_id && data.history && Array.isArray(data.history)) {
      return SESSION_TYPES.Q_CHAT;
    }
    
    // Add more format detection logic here for other AI tools
    // Cursor detection
    if (data.cursor_session_id || (data.messages && data.workspace)) {
      return SESSION_TYPES.CURSOR;
    }
    
    // Gemini CLI detection
    if (data.gemini_session || (data.model && data.model.includes('gemini'))) {
      return SESSION_TYPES.GEMINI_CLI;
    }
    
    return SESSION_TYPES.UNKNOWN;
  } catch (error) {
    console.warn('Error detecting session format:', error);
    return SESSION_TYPES.UNKNOWN;
  }
}

/**
 * Parse and normalize session data regardless of format
 * @param {string|Object} rawData - Raw session data
 * @returns {NormalizedSession} Normalized session object
 */
export function parseSession(rawData) {
  const sessionType = detectSessionFormat(rawData);
  
  switch (sessionType) {
    case SESSION_TYPES.Q_CHAT:
      return parseQChatSession(rawData);
    case SESSION_TYPES.CLAUDE_CODE:
      return parseClaudeCodeSession(rawData);
    case SESSION_TYPES.CURSOR:
      return parseCursorSession(rawData);
    case SESSION_TYPES.GEMINI_CLI:
      return parseGeminiSession(rawData);
    default:
      return parseUnknownSession(rawData, sessionType);
  }
}

/**
 * Parse Q Chat JSON format
 */
function parseQChatSession(data) {
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  
  const messages = [];
  let messageId = 0;
  
  // Process Q Chat history structure
  data.history.forEach((exchange, exchangeIndex) => {
    exchange.forEach((message, messageIndex) => {
      const normalizedMessage = {
        id: `${exchangeIndex}-${messageIndex}-${messageId++}`,
        exchangeIndex,
        messageIndex,
        timestamp: new Date(), // Q Chat doesn't seem to have timestamps
        metadata: {
          additional_context: message.additional_context,
          env_context: message.env_context
        }
      };
      
      // Handle different message types in Q Chat
      if (message.content?.Prompt) {
        normalizedMessage.type = 'user';
        normalizedMessage.role = 'user';
        normalizedMessage.content = message.content.Prompt.prompt;
      } else if (message.ToolUse) {
        normalizedMessage.type = 'assistant';
        normalizedMessage.role = 'assistant';
        normalizedMessage.content = message.ToolUse.content || '';
        // Extract detailed tool information from Q Chat format
        normalizedMessage.toolCalls = (message.ToolUse.tool_uses || []).map(tool => ({
          id: tool.id,
          name: tool.name || tool.orig_name,
          input: tool.args || tool.orig_args,
          timestamp: new Date(), // Q Chat doesn't have individual tool timestamps
          metadata: {
            orig_name: tool.orig_name,
            orig_args: tool.orig_args,
            summary: tool.args?.summary || tool.orig_args?.summary
          }
        }));
      } else if (message.content?.ToolUseResults) {
        normalizedMessage.type = 'tool';
        normalizedMessage.role = 'tool';
        normalizedMessage.content = 'Tool execution results';
        normalizedMessage.toolResults = message.content.ToolUseResults.tool_use_results;
      } else if (message.Response) {
        normalizedMessage.type = 'assistant';
        normalizedMessage.role = 'assistant';
        normalizedMessage.content = message.Response.content;
      } else {
        normalizedMessage.type = 'system';
        normalizedMessage.role = 'system';
        normalizedMessage.content = JSON.stringify(message.content || message);
      }
      
      messages.push(normalizedMessage);
    });
  });
  
  return {
    id: data.conversation_id,
    type: SESSION_TYPES.Q_CHAT,
    title: `Q Chat Session`,
    metadata: {
      conversation_id: data.conversation_id,
      next_message: data.next_message,
      valid_history_range: data.valid_history_range,
      model: data.model,
      transcript: data.transcript
    },
    messages,
    stats: calculateStats(messages),
    rawData: data
  };
}

/**
 * Parse Claude Code JSONL format
 */
function parseClaudeCodeSession(data) {
  let messages = [];
  
  if (typeof data === 'string') {
    // Parse JSONL
    const lines = data.trim().split('\n').filter(line => line.trim());
    messages = lines.map(line => JSON.parse(line));
  } else if (Array.isArray(data)) {
    messages = data;
  } else if (data.messages && Array.isArray(data.messages)) {
    // Handle new wrapped format: {"messages": [...], "platform": "qcli"}
    messages = data.messages;
  } else if (data.rawMessages) {
    messages = data.rawMessages;
  }
  
  const sessionId = messages[0]?.sessionId || 'unknown';
  const version = messages[0]?.version || 'unknown';
  const userType = messages[0]?.userType || 'unknown';
  const cwd = messages[0]?.cwd;
  
  const normalizedMessages = messages
    .filter(msg => !msg.isMeta)
    .map((msg, index) => {
      // Determine message type based on role and content
      // Check if this contains tool use or tool results
      const hasToolUse = msg.message?.content && 
        Array.isArray(msg.message.content) && 
        msg.message.content.some(item => item.type === 'tool_use');
      
      const hasToolResult = (msg.message?.content && 
        Array.isArray(msg.message.content) && 
        msg.message.content.some(item => item.type === 'tool_result')) ||
        msg.toolUseResult; // Also check for tool results in the root level
      
      // Determine the correct message type:
      // 1. If it has tool_use or tool_result, it should be assistant (highest priority)
      // 2. If the inner message has a role, use that
      // 3. Fall back to the outer type
      let messageType, messageRole;
      
      if (hasToolUse || hasToolResult) {
        // Tool messages are always assistant messages, regardless of claimed role
        messageType = 'assistant';
        messageRole = 'assistant';
      } else if (msg.message?.role) {
        // Trust the inner message role
        messageType = msg.message.role;
        messageRole = msg.message.role;
      } else {
        // Fall back to outer type
        messageType = msg.type || 'assistant';
        messageRole = msg.type || 'assistant';
      }
      
      return {
        id: msg.uuid || `claude-${index}`,
        type: messageType,
        role: messageRole,
        content: extractClaudeMessageContent(msg),
        timestamp: new Date(msg.timestamp),
        metadata: {
          uuid: msg.uuid,
          parentUuid: msg.parentUuid,
          requestId: msg.requestId,
          model: msg.message?.model,
          usage: msg.message?.usage,
          toolUseResult: msg.toolUseResult,
          isToolResult: hasToolResult
        },
        toolCalls: extractClaudeToolCalls(msg),
        toolResults: hasToolResult ? extractClaudeToolResults(msg) : undefined,
        context: {
          cwd: msg.cwd,
          userType: msg.userType,
          version: msg.version
        }
      };
    });
  
  return {
    id: sessionId,
    type: SESSION_TYPES.CLAUDE_CODE,
    title: `Claude Code Session`,
    metadata: {
      sessionId,
      version,
      userType,
      cwd,
      totalMessages: messages.length,
      duration: calculateDuration(messages)
    },
    messages: normalizedMessages,
    stats: calculateStats(normalizedMessages),
    rawData: messages
  };
}

/**
 * Parse Cursor format (placeholder - implement based on actual Cursor format)
 */
function parseCursorSession(data) {
  // Placeholder implementation
  return {
    id: data.cursor_session_id || 'cursor-session',
    type: SESSION_TYPES.CURSOR,
    title: 'Cursor Session',
    metadata: {},
    messages: [],
    stats: { totalMessages: 0, userMessages: 0, assistantMessages: 0 },
    rawData: data
  };
}

/**
 * Parse Gemini CLI format (placeholder - implement based on actual Gemini format)
 */
function parseGeminiSession(data) {
  // Placeholder implementation
  return {
    id: data.gemini_session || 'gemini-session',
    type: SESSION_TYPES.GEMINI_CLI,
    title: 'Gemini CLI Session',
    metadata: {},
    messages: [],
    stats: { totalMessages: 0, userMessages: 0, assistantMessages: 0 },
    rawData: data
  };
}

/**
 * Handle unknown formats
 */
function parseUnknownSession(data, detectedType) {
  return {
    id: 'unknown-session',
    type: detectedType,
    title: 'Unknown Session Format',
    metadata: { detectedType },
    messages: [],
    stats: { totalMessages: 0, userMessages: 0, assistantMessages: 0 },
    rawData: data
  };
}

/**
 * Extract message content from Claude Code message
 */
function extractClaudeMessageContent(msg) {
  if (msg.type === 'user') {
    if (typeof msg.message?.content === 'string') {
      return msg.message.content;
    }
    if (Array.isArray(msg.message?.content)) {
      return msg.message.content
        .map(item => {
          if (item.type === 'text') return item.text;
          if (item.type === 'tool_result') return `Tool result: ${item.content}`;
          return JSON.stringify(item);
        })
        .join('\n');
    }
  }
  
  if (msg.type === 'assistant' || !msg.type) {
    if (typeof msg.message?.content === 'string') {
      return msg.message.content;
    }
    if (Array.isArray(msg.message?.content)) {
      return msg.message.content
        .map(item => {
          if (item.type === 'text') return item.text;
          if (item.type === 'tool_use') return `Using tool: ${item.name}`;
          return JSON.stringify(item);
        })
        .join('\n');
    }
  }
  
  return JSON.stringify(msg.message || msg);
}

/**
 * Extract tool calls from Claude Code message
 */
function extractClaudeToolCalls(msg) {
  const toolCalls = [];
  
  if (Array.isArray(msg.message?.content)) {
    msg.message.content.forEach(item => {
      if (item.type === 'tool_use') {
        toolCalls.push({
          id: item.id,
          name: item.name,
          input: item.input,
          timestamp: new Date(msg.timestamp)
        });
      }
    });
  }
  
  return toolCalls;
}

/**
 * Extract tool results from Claude Code message
 */
function extractClaudeToolResults(msg) {
  const toolResults = [];
  
  if (Array.isArray(msg.message?.content)) {
    msg.message.content.forEach(item => {
      if (item.type === 'tool_result') {
        toolResults.push({
          tool_use_id: item.tool_use_id,
          content: item.content,
          is_error: item.is_error
        });
      }
    });
  }
  
  // Also check for toolUseResult in the message root
  if (msg.toolUseResult) {
    toolResults.push(msg.toolUseResult);
  }
  
  return toolResults.length > 0 ? toolResults : undefined;
}

/**
 * Calculate session statistics
 */
function calculateStats(messages) {
  const stats = {
    totalMessages: messages.length,
    userMessages: 0,
    assistantMessages: 0,
    toolMessages: 0,
    systemMessages: 0,
    toolCalls: 0,
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0
  };
  
  messages.forEach(msg => {
    switch (msg.type) {
      case 'user':
        stats.userMessages++;
        break;
      case 'assistant':
        stats.assistantMessages++;
        break;
      case 'tool':
        stats.toolMessages++;
        break;
      case 'system':
        stats.systemMessages++;
        break;
    }
    
    if (msg.toolCalls) {
      stats.toolCalls += msg.toolCalls.length;
    }
    
    // Add token counting if available in metadata
    if (msg.metadata?.usage) {
      stats.inputTokens += msg.metadata.usage.input_tokens || 0;
      stats.outputTokens += msg.metadata.usage.output_tokens || 0;
    }
  });
  
  stats.totalTokens = stats.inputTokens + stats.outputTokens;
  
  return stats;
}

/**
 * Calculate session duration from messages
 */
function calculateDuration(messages) {
  const validMessages = messages.filter(msg => msg.timestamp);
  if (validMessages.length < 2) return 'Unknown';
  
  const timestamps = validMessages.map(msg => new Date(msg.timestamp));
  const start = new Date(Math.min(...timestamps));
  const end = new Date(Math.max(...timestamps));
  const diffMs = end - start;
  
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

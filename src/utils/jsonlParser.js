/**
 * Parse JSONL (JSON Lines) data into a structured session format
 * @param {string} jsonlText - Raw JSONL text content
 * @returns {Object} Parsed session data
 */
export function parseJsonl(jsonlText) {
  if (!jsonlText || typeof jsonlText !== 'string') {
    throw new Error('Invalid JSONL input');
  }

  const lines = jsonlText.trim().split('\n').filter(line => line.trim());
  const messages = [];
  
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      messages.push(parsed);
    } catch (error) {
      console.warn('Failed to parse JSONL line:', line, error);
      // Continue processing other lines
    }
  }

  if (messages.length === 0) {
    throw new Error('No valid JSON objects found in JSONL data');
  }

  // Extract session metadata from the first message
  const firstMessage = messages[0];
  const sessionId = firstMessage.sessionId;
  const userType = firstMessage.userType;
  const version = firstMessage.version;
  const cwd = firstMessage.cwd;

  // Group messages into conversation exchanges
  const exchanges = [];
  let currentExchange = [];
  
  for (const message of messages) {
    // Skip meta messages
    if (message.isMeta) {
      continue;
    }

    // Add message to current exchange
    currentExchange.push(message);
    
    // If this is an assistant message and the next message is a user message (or end of messages),
    // consider this exchange complete
    const currentIndex = messages.indexOf(message);
    const nextMessage = messages[currentIndex + 1];
    
    if (message.type === 'assistant' && 
        (!nextMessage || nextMessage.type === 'user' || nextMessage.isMeta)) {
      if (currentExchange.length > 0) {
        exchanges.push([...currentExchange]);
        currentExchange = [];
      }
    }
  }
  
  // Add any remaining messages as the final exchange
  if (currentExchange.length > 0) {
    exchanges.push(currentExchange);
  }

  return {
    sessionId,
    userType,
    version,
    cwd,
    messageCount: messages.length,
    exchangeCount: exchanges.length,
    timestamp: firstMessage.timestamp,
    isClaudeCode: isClaudeCodeSession(messages),
    history: exchanges,
    rawMessages: messages
  };
}

/**
 * Extract conversation messages for display
 * @param {Array} messages - Array of JSONL message objects
 * @returns {Array} Formatted conversation messages
 */
export function extractConversationMessages(messages) {
  console.log('extractConversationMessages input:', messages.length, 'messages');
  
  const filtered = messages.filter(msg => !msg.isMeta && msg.message && msg.message.role);
  console.log('After filtering:', filtered.length, 'messages');
  
  const result = filtered.map(msg => ({
    id: msg.uuid,
    type: msg.type,
    role: msg.message.role,
    content: msg.message.content,
    timestamp: msg.timestamp,
    parentUuid: msg.parentUuid,
    requestId: msg.requestId,
    toolUseResult: msg.toolUseResult,
    model: msg.message.model,
    usage: msg.message.usage,
    stopReason: msg.message.stop_reason,
    message: msg.message // Keep the full message object for the component
  }));
  
  console.log('extractConversationMessages result:', result);
  return result;
}

/**
 * Extract tool usage information from messages
 * @param {Array} messages - Array of JSONL message objects
 * @returns {Array} Tool usage information
 */
export function extractToolUsage(messages) {
  const toolUsage = [];
  
  for (const msg of messages) {
    if (msg.message?.content && Array.isArray(msg.message.content)) {
      for (const content of msg.message.content) {
        if (content.type === 'tool_use') {
          toolUsage.push({
            id: content.id,
            name: content.name,
            input: content.input,
            messageId: msg.uuid,
            timestamp: msg.timestamp
          });
        }
      }
    }
    
    // Check for tool results
    if (msg.toolUseResult) {
      const toolResult = {
        messageId: msg.uuid,
        timestamp: msg.timestamp,
        result: msg.toolUseResult
      };
      
      // Find the corresponding tool use
      const toolUseIndex = toolUsage.findIndex(tool => 
        msg.message?.content?.some(c => c.tool_use_id === tool.id)
      );
      
      if (toolUseIndex !== -1) {
        toolUsage[toolUseIndex].result = toolResult;
      }
    }
  }
  
  return toolUsage;
}

/**
 * Get session statistics
 * @param {Array} messages - Array of JSONL message objects
 * @returns {Object} Session statistics
 */
export function getSessionStats(messages) {
  const userMessages = messages.filter(msg => msg.type === 'user' && !msg.isMeta);
  const assistantMessages = messages.filter(msg => msg.type === 'assistant');
  const toolUsage = extractToolUsage(messages);
  
  // Calculate total tokens if available
  let totalTokens = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  
  for (const msg of assistantMessages) {
    if (msg.message?.usage) {
      const usage = msg.message.usage;
      inputTokens += usage.input_tokens || 0;
      outputTokens += usage.output_tokens || 0;
      totalTokens += (usage.input_tokens || 0) + (usage.output_tokens || 0);
    }
  }
  
  return {
    totalMessages: messages.filter(msg => !msg.isMeta).length,
    userMessages: userMessages.length,
    assistantMessages: assistantMessages.length,
    toolCalls: toolUsage.length,
    totalTokens,
    inputTokens,
    outputTokens,
    duration: calculateSessionDuration(messages)
  };
}

/**
 * Detect if this is a Claude Code session
 * @param {Array} messages - Array of JSONL message objects
 * @returns {boolean} True if this appears to be a Claude Code session
 */
export function isClaudeCodeSession(messages) {
  // Look for indicators that this is a Claude Code session
  const hasToolUse = messages.some(msg => 
    msg.message?.content && Array.isArray(msg.message.content) &&
    msg.message.content.some(content => content.type === 'tool_use')
  );
  
  const hasToolResults = messages.some(msg => msg.toolUseResult);
  
  const hasClaudeModel = messages.some(msg => 
    msg.message?.model && msg.message.model.includes('claude')
  );
  
  return hasToolUse || hasToolResults || hasClaudeModel;
}

/**
 * Extract readable content from a message for display
 * @param {Object} message - JSONL message object
 * @returns {string} Human-readable content summary
 */
export function extractMessageContent(message) {
  if (!message.message?.content) {
    return 'No content';
  }

  const content = message.message.content;

  // Handle string content
  if (typeof content === 'string') {
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }

  // Handle array content (tool use, text blocks, etc.)
  if (Array.isArray(content)) {
    const textParts = [];
    const toolParts = [];
    
    for (const item of content) {
      if (item.type === 'text' && item.text) {
        textParts.push(item.text);
      } else if (item.type === 'tool_use') {
        toolParts.push(`🔧 ${item.name}`);
      } else if (item.type === 'tool_result') {
        toolParts.push(`✅ Tool result`);
      }
    }
    
    const parts = [...textParts, ...toolParts];
    if (parts.length === 0) {
      return 'Complex message content';
    }
    
    const combined = parts.join(' | ');
    return combined.length > 200 ? combined.substring(0, 200) + '...' : combined;
  }

  // Handle object content
  if (typeof content === 'object') {
    const keys = Object.keys(content);
    if (keys.length === 0) {
      return 'Empty content object';
    }
    return `Object with keys: ${keys.join(', ')}`;
  }

  return 'Unknown content type';
}

/**
 * Calculate session duration
 * @param {Array} messages - Array of JSONL message objects
 * @returns {string} Formatted duration
 */
function calculateSessionDuration(messages) {
  if (messages.length < 2) return 'N/A';
  
  const validMessages = messages.filter(msg => msg.timestamp && !msg.isMeta);
  if (validMessages.length < 2) return 'N/A';
  
  const startTime = new Date(validMessages[0].timestamp);
  const endTime = new Date(validMessages[validMessages.length - 1].timestamp);
  const durationMs = endTime - startTime;
  
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${Math.round(durationMs / 1000)}s`;
  } else {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.round((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

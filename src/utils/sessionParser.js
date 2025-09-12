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
  CODEX: 'codex',
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
        
        // Gemini CLI JSONL detection
        if (firstLine.role && firstLine.parts) {
          return SESSION_TYPES.GEMINI_CLI;
        }
        
        // Codex JSONL detection (old format)
        if (firstLine.id && firstLine.timestamp && 
            (firstLine.type === 'message' || firstLine.type === 'reasoning')) {
          return SESSION_TYPES.CODEX;
        }
        
        return SESSION_TYPES.UNKNOWN;
      }
      
      // Try to parse as JSON
      data = JSON.parse(data);
    }
    
    // Check for new Codex format - array with nested structure
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      
      // New Codex format detection - has type and payload structure
      if (firstItem.type === 'session_meta' && firstItem.payload && firstItem.payload.originator === 'codex_cli_rs') {
        return SESSION_TYPES.CODEX;
      }
      
      // More generic new Codex detection - check if any item has the new structure
      const hasCodexStructure = data.some(item => 
        (item.type === 'session_meta' && item.payload?.originator === 'codex_cli_rs') ||
        (item.type === 'response_item' && item.payload?.type === 'message') ||
        (item.type === 'event_msg' && item.payload?.type)
      );
      
      if (hasCodexStructure) {
        return SESSION_TYPES.CODEX;
      }
      
      // Also check for response_item structure
      if (firstItem.type === 'response_item' && firstItem.payload) {
        return SESSION_TYPES.CODEX;
      }
      // Check for event_msg structure
      if (firstItem.type === 'event_msg' && firstItem.payload) {
        return SESSION_TYPES.CODEX;
      }
    }
    
    // Claude Code wrapped format detection (new format with messages array)
    if (data.messages && Array.isArray(data.messages)) {
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
    
    // Gemini CLI detection - array of messages with role and parts structure
    if (Array.isArray(data) && data.length > 0 && data[0].role && data[0].parts) {
      return SESSION_TYPES.GEMINI_CLI;
    }
    
    // Legacy Gemini CLI detection
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
 * @param {string} knownSessionType - Optional known session type from metadata
 * @returns {NormalizedSession} Normalized session object
 */
export function parseSession(rawData, knownSessionType = null) {
  // Use known session type if provided, otherwise detect
  const sessionType = knownSessionType || detectSessionFormat(rawData);
  
  switch (sessionType) {
    case SESSION_TYPES.Q_CHAT:
      return parseQChatSession(rawData);
    case SESSION_TYPES.CLAUDE_CODE:
      return parseClaudeCodeSession(rawData);
    case SESSION_TYPES.CURSOR:
      return parseCursorSession(rawData);
    case SESSION_TYPES.GEMINI_CLI:
      return parseGeminiSession(rawData);
    case SESSION_TYPES.CODEX:
      return parseCodexSession(rawData);
    default:
      return parseUnknownSession(rawData, sessionType);
  }
}

/**
 * Parse Q Chat JSON format
 */
function parseQChatSession(data) {
  if (typeof data === 'string') {
    // Check if this is JSONL format (CLI Q Chat upload)
    if (data.includes('\n{') && data.split('\n').filter(line => line.trim()).length > 1) {
      // Parse JSONL format - each line is a separate JSON object
      const lines = data.trim().split('\n').filter(line => line.trim());
      const messages = lines.map(line => JSON.parse(line));
      
      // Convert to the expected Q Chat format with messages array
      data = {
        messages: messages,
        conversationId: messages[0]?.sessionId || 'qchat-session',
        platform: 'q-chat'
      };
    } else {
      // Regular JSON format
      data = JSON.parse(data);
    }
  }
  
  const messages = [];
  let messageId = 0;
  
  // Handle new Q Chat format from CLI (with messages array)
  if (data.messages && Array.isArray(data.messages)) {
    data.messages.forEach((msg, index) => {
      const normalizedMessage = {
        id: msg.uuid || `qchat-${index}`,
        type: msg.type,
        role: msg.message?.role || msg.type,
        content: msg.message?.content || '',
        timestamp: new Date(msg.timestamp),
        metadata: {
          uuid: msg.uuid,
          sessionId: msg.sessionId,
          cwd: msg.cwd,
          version: msg.version,
          userType: msg.userType,
          gitBranch: msg.gitBranch,
          parentUuid: msg.parentUuid,
          isSidechain: msg.isSidechain
        },
        context: {
          cwd: msg.cwd,
          sessionId: msg.sessionId,
          version: msg.version
        }
      };
      
      // Handle toolCalls in new format
      if (msg.message?.toolCalls && Array.isArray(msg.message.toolCalls)) {
        normalizedMessage.toolCalls = msg.message.toolCalls.map(tool => ({
          id: tool.id,
          name: tool.name,
          input: tool.input,
          timestamp: new Date(tool.timestamp || msg.timestamp),
          metadata: tool.metadata || {
            orig_name: tool.metadata?.orig_name,
            orig_args: tool.metadata?.orig_args
          }
        }));
      }
      
      // Handle toolResults in new format
      if (msg.message?.toolResults && Array.isArray(msg.message.toolResults)) {
        normalizedMessage.toolResults = msg.message.toolResults.map(result => {
          let content = result.content;
          
          // Handle nested Json.content structure
          if (Array.isArray(result.content)) {
            const jsonContent = result.content.find(item => item.Json?.content);
            if (jsonContent?.Json?.content) {
              // Extract text from the nested content array
              const textContent = jsonContent.Json.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n');
              content = textContent || JSON.stringify(jsonContent.Json.content, null, 2);
            } else {
              content = JSON.stringify(result.content, null, 2);
            }
          }
          
          return {
            tool_use_id: result.tool_use_id,
            content: content,
            status: result.status,
            is_error: result.status === 'Error'
          };
        });
      }
      
      messages.push(normalizedMessage);
    });
    
    return {
      id: data.conversationId || data.sessionId || 'qchat-session',
      type: SESSION_TYPES.Q_CHAT,
      title: data.title || 'Q Chat Session',
      metadata: {
        conversationId: data.conversationId,
        platform: data.platform,
        directoryPath: data.directoryPath
      },
      messages,
      stats: calculateStats(messages),
      rawData: data
    };
  }
  
  // Process Q Chat history structure where each exchange has user/assistant properties
  data.history.forEach((exchange, exchangeIndex) => {
    // Handle user message
    if (exchange.user) {
      const userMessage = {
        id: `${exchangeIndex}-user-${messageId++}`,
        type: 'user',
        role: 'user',
        exchangeIndex,
        messageIndex: 0,
        timestamp: new Date(exchange.request_metadata?.request_start_timestamp_ms || Date.now()),
        metadata: {
          additional_context: exchange.user.additional_context,
          env_context: exchange.user.env_context,
          request_metadata: exchange.request_metadata
        }
      };

      // Extract user content
      if (exchange.user.content?.Prompt) {
        userMessage.content = exchange.user.content.Prompt.prompt;
      } else if (exchange.user.content?.ToolUseResults) {
        userMessage.type = 'tool';
        userMessage.role = 'tool';
        userMessage.content = 'Tool execution results';
        userMessage.toolResults = exchange.user.content.ToolUseResults.tool_use_results.map(result => ({
          tool_use_id: result.tool_use_id,
          content: result.content,
          status: result.status,
          is_error: result.status === 'Error'
        }));
      } else if (exchange.user.content?.CancelledToolUses) {
        userMessage.content = exchange.user.content.CancelledToolUses.prompt;
        userMessage.toolResults = exchange.user.content.CancelledToolUses.tool_use_results?.map(result => ({
          tool_use_id: result.tool_use_id,
          content: result.content,
          status: result.status,
          is_error: result.status === 'Error'
        })) || [];
      } else {
        userMessage.content = '';
      }

      messages.push(userMessage);
    }

    // Handle assistant message
    if (exchange.assistant) {
      const assistantMessage = {
        id: `${exchangeIndex}-assistant-${messageId++}`,
        type: 'assistant',
        role: 'assistant',
        exchangeIndex,
        messageIndex: 1,
        timestamp: new Date(exchange.request_metadata?.stream_end_timestamp_ms || Date.now()),
        metadata: {
          request_metadata: exchange.request_metadata
        }
      };

      if (exchange.assistant.ToolUse) {
        assistantMessage.content = exchange.assistant.ToolUse.content || '';
        assistantMessage.toolCalls = (exchange.assistant.ToolUse.tool_uses || []).map(tool => ({
          id: tool.id,
          name: tool.name || tool.orig_name,
          input: tool.args || tool.orig_args,
          timestamp: new Date(),
          metadata: {
            orig_name: tool.orig_name,
            orig_args: tool.orig_args
          }
        }));
      } else if (exchange.assistant.Response) {
        assistantMessage.content = exchange.assistant.Response.content;
      } else {
        assistantMessage.content = JSON.stringify(exchange.assistant);
      }

      messages.push(assistantMessage);
    }
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
 * Parse Gemini CLI format
 */
function parseGeminiSession(data) {
  let messages = [];
  
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      // Handle JSONL format - each line is a separate JSON object
      const lines = data.trim().split('\n').filter(line => line.trim());
      messages = lines.map(line => JSON.parse(line));
      data = messages;
    }
  }
  
  if (Array.isArray(data)) {
    messages = data;
  } else {
    // Handle wrapped format or single session object
    messages = data.messages || [data];
  }
  
  const normalizedMessages = messages.map((msg, index) => {
    const messageId = `gemini-${index}`;
    const role = msg.role || 'unknown';
    
    // Extract content from parts array
    let content = '';
    let toolCalls = [];
    let toolResults = [];
    
    if (msg.parts && Array.isArray(msg.parts)) {
      msg.parts.forEach(part => {
        if (part.text) {
          content += part.text;
        } else if (part.functionCall) {
          // Handle function calls (tool use)
          toolCalls.push({
            id: part.functionCall.id || `tool-${index}`,
            name: part.functionCall.name,
            input: part.functionCall.args,
            timestamp: new Date()
          });
          content += `Using tool: ${part.functionCall.name}`;
        } else if (part.functionResponse) {
          // Handle function responses (tool results)
          toolResults.push({
            tool_use_id: part.functionResponse.id,
            content: part.functionResponse.response?.output || JSON.stringify(part.functionResponse.response),
            is_error: part.functionResponse.response?.error ? true : false
          });
          content += `Tool result: ${part.functionResponse.name}`;
        }
      });
    }
    
    // Determine message type based on role and content
    let messageType = role;
    if (role === 'model') {
      messageType = 'assistant';
    } else if (role === 'user') {
      // Check if this is actually a tool result disguised as a user message
      const hasToolResponse = msg.parts && msg.parts.some(part => part.functionResponse);
      if (hasToolResponse) {
        messageType = 'tool';
      } else {
        messageType = 'user';
      }
    }
    
    return {
      id: messageId,
      type: messageType,
      role: messageType,
      content: content.trim() || JSON.stringify(msg),
      timestamp: new Date(), // Gemini CLI doesn't seem to include timestamps
      metadata: {
        originalRole: role,
        partsCount: msg.parts ? msg.parts.length : 0
      },
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
      originalRawData: msg
    };
  });
  
  return {
    id: data.gemini_session || `gemini-session-${Date.now()}`,
    type: SESSION_TYPES.GEMINI_CLI,
    title: 'Gemini CLI Session',
    metadata: {
      totalMessages: normalizedMessages.length,
      hasToolCalls: normalizedMessages.some(msg => msg.toolCalls && msg.toolCalls.length > 0)
    },
    messages: normalizedMessages,
    stats: calculateStats(normalizedMessages),
    rawData: data
  };
}

/**
 * Group Codex function calls with their corresponding outputs
 */
function groupCodexFunctionCalls(records) {
  const groupedRecords = [];
  const outputsMap = new Map(); // Map call_id to outputs
  
  // First pass: collect all function call outputs
  records.forEach(record => {
    if (record.type === 'function_call_output') {
      if (!outputsMap.has(record.call_id)) {
        outputsMap.set(record.call_id, []);
      }
      outputsMap.get(record.call_id).push(record);
    }
  });
  
  // Second pass: group function calls with their outputs, keep other records as-is
  records.forEach(record => {
    if (record.type === 'function_call') {
      // Attach paired outputs to the function call
      const pairedOutputs = outputsMap.get(record.call_id) || [];
      groupedRecords.push({
        ...record,
        pairedOutputs
      });
      
      // Mark outputs as grouped so we don't process them separately
      pairedOutputs.forEach(output => {
        output.isGrouped = true;
      });
    } else if (record.type === 'function_call_output') {
      // Only include if not already grouped
      if (!record.isGrouped) {
        groupedRecords.push(record);
      }
    } else {
      // Keep other record types as-is
      groupedRecords.push(record);
    }
  });
  
  return groupedRecords;
}

/**
 * Parse Codex JSONL format
 */
function parseCodexSession(data) {
  let records = [];
  let sessionMetadata = null;
  
  if (typeof data === 'string') {
    // First, try to parse as a single JSON array (new Codex format)
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        data = parsed; // Convert to array and continue processing
      } else {
        records = [parsed];
      }
    } catch (jsonError) {
      // Fall back to JSONL parsing
      try {
        const lines = data.trim().split('\n').filter(line => line.trim());
        const parsedLines = lines.map(line => JSON.parse(line));
        
        // Convert JSONL to array format for processing
        data = parsedLines;
      } catch (jsonlError) {
        throw new Error(`Unable to parse Codex session data: ${jsonlError.message}`);
      }
    }
  }
  
  // Process as array (either original array or converted from string)
  if (Array.isArray(data)) {
    // Check if this is the new nested format
    const hasNestedStructure = data.some(item => 
      (item.type === 'session_meta' || item.type === 'response_item' || item.type === 'event_msg') 
      && item.payload
    );
    
    if (hasNestedStructure) {
      // New format: extract session metadata and flatten records
      sessionMetadata = data.find(item => item.type === 'session_meta')?.payload;
      
      // Extract conversational records from the nested structure
      const filteredItems = data.filter(item => {
        // Prioritize response_item with message payloads (these are the main conversation)
        if (item.type === 'response_item' && item.payload) {
          // Include message, reasoning, function call and function output types
          return item.payload.type === 'message' || 
                 item.payload.type === 'reasoning' ||
                 item.payload.type === 'function_call' ||
                 item.payload.type === 'function_call_output';
        }
        
        // Only include event_msg for agent reasoning (not user_message or agent_message to avoid duplication)
        if (item.type === 'event_msg' && item.payload) {
          return item.payload.type === 'agent_reasoning';
        }
        
        return false;
      });
      
      records = filteredItems.map(item => {
        // Flatten the structure
        if (item.type === 'response_item') {
          // Handle response_item payload structure
          const payload = item.payload;
          
          // Convert payload.content array to the expected format for message processing
          let content = payload.content;
          if (Array.isArray(payload.content)) {
            content = payload.content.map(contentItem => {
              if (contentItem.type === 'input_text') {
                return { type: 'input_text', text: contentItem.text };
              } else if (contentItem.type === 'output_text') {
                return { type: 'output_text', text: contentItem.text };
              }
              return contentItem;
            });
          }
          
          return {
            id: `response-${item.timestamp}-${Math.random()}`,
            type: payload.type, // 'message', 'reasoning', 'function_call', or 'function_call_output'
            role: payload.role || (payload.type === 'message' ? 'user' : 'assistant'),
            content: content,
            timestamp: item.timestamp,
            originalType: item.type,
            payload: payload
          };
        } else if (item.type === 'event_msg') {
          // Convert event_msg to a message-like structure
          const isReasoning = item.payload.type === 'agent_reasoning';
          
          return {
            id: `event-${item.timestamp}-${Math.random()}`,
            type: isReasoning ? 'reasoning' : 'message',
            role: item.payload.type === 'user_message' ? 'user' : 'assistant',
            content: item.payload.type === 'user_message' ? 
              [{ type: 'input_text', text: item.payload.message }] :
              item.payload.text ? [{ type: 'output_text', text: item.payload.text }] : [],
            timestamp: item.timestamp,
            originalType: item.type,
            payload: item.payload,
            // For reasoning, store the text directly for easier access
            reasoningText: isReasoning ? item.payload.text : undefined
          };
        }
        return item;
      });
    } else {
      // Old format: use as-is
      records = data;
    }
  } else if (data.messages && Array.isArray(data.messages)) {
    // Handle wrapped format: {"messages": [...], "platform": "codex"}
    records = data.messages;
  }
  
  const sessionId = sessionMetadata?.id || records[0]?.id || 'codex-session';
  let cwd = sessionMetadata?.cwd || '';
  
  // Extract CWD from the session data if not in metadata
  if (!cwd) {
    for (const record of records) {
      if (record.type === 'message' && record.content && Array.isArray(record.content)) {
        for (const contentItem of record.content) {
          if (contentItem.type === 'input_text' && contentItem.text && !cwd) {
            // Try newer <cwd> tag format
            if (contentItem.text.includes('<cwd>')) {
              const cwdMatch = contentItem.text.match(/<cwd>(.+?)<\/cwd>/);
              if (cwdMatch) {
                cwd = cwdMatch[1];
                break;
              }
            }
            // Try older "Current working directory:" format
            else if (contentItem.text.includes('Current working directory:')) {
              const cwdMatch = contentItem.text.match(/Current working directory:\s*([^\n<]+)/);
              if (cwdMatch) {
                cwd = cwdMatch[1].trim();
                break;
              }
            }
          }
        }
        if (cwd) break;
      }
    }
  }
  
  // Filter out state records and other non-conversational records
  const conversationalRecords = records.filter(record => {
    // Include message records
    if (record.type === 'message') {
      return true;
    }
    
    // Include reasoning records from new format
    if (record.type === 'reasoning') {
      const hasSummary = record.summary && Array.isArray(record.summary) && record.summary.length > 0;
      const hasContent = record.content && typeof record.content === 'string' && record.content.trim().length > 0;
      const hasReasoningText = record.reasoningText && record.reasoningText.trim().length > 0;
      const hasPayloadText = record.payload && record.payload.text && record.payload.text.trim().length > 0;
      
      return hasSummary || hasContent || hasReasoningText || hasPayloadText;
    }
    
    // Include function_call and function_call_output records (both old and new formats)
    if (record.type === 'function_call' || record.type === 'function_call_output') {
      return true;
    }
    
    return false;
  });
  
  // Group function calls with their outputs
  const groupedRecords = groupCodexFunctionCalls(conversationalRecords);
  
  const normalizedMessages = groupedRecords.map((record, index) => {
    const messageId = record.id || `codex-${index}`;
    let content = '';
    let messageType = 'assistant';
    let messageRole = 'assistant';
    let toolCalls = [];
    let toolResults = [];
    
    if (record.type === 'message') {
      messageRole = record.role || 'user';
      messageType = record.role || 'user';
      
      // Extract content from the content array
      if (record.content && Array.isArray(record.content)) {
        const textContent = [];
        for (const contentItem of record.content) {
          if (contentItem.type === 'input_text' && contentItem.text) {
            textContent.push(contentItem.text);
          } else if (contentItem.type === 'output_text' && contentItem.text) {
            textContent.push(contentItem.text);
          }
        }
        content = textContent.join('\n');
      }
      
      // Check if this message contains only environment context
      const isEnvironmentContext = content.includes('<environment_context>') && 
                                   content.includes('</environment_context>') &&
                                   content.trim().startsWith('<environment_context>') &&
                                   content.trim().endsWith('</environment_context>');
      
      if (isEnvironmentContext) {
        messageType = 'environment';
        messageRole = 'system';
      }
    } else if (record.type === 'reasoning') {
      messageType = 'reasoning';
      messageRole = 'assistant';
      
      // Handle new format reasoning from event_msg (stored in reasoningText)
      if (record.reasoningText) {
        content = record.reasoningText;
      } 
      // Handle new format reasoning from response_item payload
      else if (record.payload && record.payload.text) {
        content = record.payload.text;
      } 
      // Handle reasoning with summary structure (both old and new formats)
      else if (record.summary && Array.isArray(record.summary)) {
        const summaryTexts = [];
        for (const summaryItem of record.summary) {
          if (summaryItem.type === 'summary_text' && summaryItem.text) {
            summaryTexts.push(summaryItem.text);
          }
        }
        content = summaryTexts.join('\n\n\n');
        
        // Also check for direct content (old format)
        if (record.content && typeof record.content === 'string' && record.content.trim().length > 0) {
          content += (content ? '\n\n' : '') + record.content;
        }
      }
    } else if (record.type === 'function_call') {
      // Function calls are assistant messages with toolCalls
      messageType = 'assistant';
      messageRole = 'assistant';
      
      // Handle new format (payload structure) vs old format (direct properties)
      const functionName = record.payload?.name || record.name;
      const functionCallId = record.payload?.call_id || record.call_id;
      const functionArgs = record.payload?.arguments || record.arguments;
      
      content = `Using tool: ${functionName}`;
      
      toolCalls = [{
        id: functionCallId,
        name: functionName,
        input: parseJSONSafely(functionArgs),
        timestamp: new Date(record.timestamp || Date.now()),
        metadata: {
          codexFunctionCallId: record.id,
          originalPayload: record.payload
        }
      }];
      
      // If this record has paired outputs, add them as toolResults
      if (record.pairedOutputs && record.pairedOutputs.length > 0) {
        toolResults = record.pairedOutputs.map(output => {
          const parsedOutput = parseJSONSafely(output.output);
          return {
            tool_use_id: output.call_id,
            content: typeof parsedOutput === 'string' ? parsedOutput : JSON.stringify(parsedOutput, null, 2),
            is_error: false,
            metadata: {
              codexOutputId: output.id
            }
          };
        });
      }
    } else if (record.type === 'function_call_output' && !record.isGrouped) {
      // Standalone function call output (shouldn't happen with proper grouping, but handle as fallback)
      messageType = 'tool';
      messageRole = 'tool';
      
      // Handle new format (payload structure) vs old format (direct properties)
      const callId = record.payload?.call_id || record.call_id;
      const output = record.payload?.output || record.output;
      
      content = `Tool result for call ${callId}`;
      
      const parsedOutput = parseJSONSafely(output);
      toolResults = [{
        tool_use_id: callId,
        content: typeof parsedOutput === 'string' ? parsedOutput : JSON.stringify(parsedOutput, null, 2),
        is_error: false,
        metadata: {
          codexOutputId: record.id,
          originalPayload: record.payload
        }
      }];
    }
    
    const normalizedMessage = {
      id: messageId,
      type: messageType,
      role: messageRole,
      content: content || JSON.stringify(record),
      timestamp: new Date(record.timestamp),
      metadata: {
        codexId: record.id,
        recordType: record.type,
        instructions: record.instructions
      },
      context: {
        cwd: cwd
      },
      originalRawData: record
    };
    
    // Add toolCalls and toolResults if present
    if (toolCalls.length > 0) {
      normalizedMessage.toolCalls = toolCalls;
    }
    if (toolResults.length > 0) {
      normalizedMessage.toolResults = toolResults;
    }
    
    return normalizedMessage;
  });
  
  return {
    id: sessionId,
    type: SESSION_TYPES.CODEX,
    title: 'Codex Session',
    metadata: {
      sessionId,
      cwd,
      totalRecords: records.length,
      conversationalRecords: conversationalRecords.length,
      originator: sessionMetadata?.originator,
      cli_version: sessionMetadata?.cli_version,
      git: sessionMetadata?.git
    },
    messages: normalizedMessages,
    stats: calculateStats(normalizedMessages),
    rawData: data // Keep original data structure
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
 * Safely parse JSON with fallback to original value
 */
function parseJSONSafely(value) {
  if (!value) return value;
  if (typeof value !== 'string') return value;
  
  try {
    return JSON.parse(value);
  } catch (error) {
    // If parsing fails, return the original string
    return value;
  }
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

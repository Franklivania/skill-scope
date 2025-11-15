/**
 * Session Storage Service
 * Manages conversation history in sessionStorage (max 5 messages)
 * Automatically cleared when tab is closed
 */

const STORAGE_KEY = 'transcript-analyzer-conversation';
const MAX_MESSAGES = 5;

/**
 * Message structure:
 * {
 *   role: 'user' | 'assistant',
 *   content: string,
 *   timestamp: number
 * }
 */

/**
 * Adds a message to the conversation history
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 */
export function addMessage(role, content) {
  if (!role || !content) {
    throw new Error('Role and content are required');
  }

  if (role !== 'user' && role !== 'assistant') {
    throw new Error('Role must be "user" or "assistant"');
  }

  try {
    const history = getHistory();
    const newMessage = {
      role,
      content: content.trim(),
      timestamp: Date.now(),
    };

    history.messages.push(newMessage);

    // Keep only the last MAX_MESSAGES messages
    if (history.messages.length > MAX_MESSAGES) {
      history.messages = history.messages.slice(-MAX_MESSAGES);
    }

    // Update timestamp
    history.lastUpdated = Date.now();

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to add message to session storage:', error);
  }
}

/**
 * Gets the conversation history
 * @returns {Object} - { messages: Array, lastUpdated: number }
 */
export function getHistory() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (parsed.messages && Array.isArray(parsed.messages)) {
        return {
          messages: parsed.messages,
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
      }
    }
  } catch (error) {
    console.error('Failed to read session storage:', error);
  }

  // Return empty history if nothing stored or error occurred
  return {
    messages: [],
    lastUpdated: Date.now(),
  };
}

/**
 * Gets the last N messages formatted for API
 * @param {number} count - Number of messages to retrieve (default: all, max: MAX_MESSAGES)
 * @returns {Array} - Array of message objects with role and content
 */
export function getMessagesForAPI(count = MAX_MESSAGES) {
  const history = getHistory();
  const messages = history.messages.slice(-count);
  
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Clears the conversation history
 */
export function clearHistory() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session storage:', error);
  }
}

/**
 * Gets the number of messages in history
 * @returns {number} - Message count
 */
export function getMessageCount() {
  return getHistory().messages.length;
}

/**
 * Checks if there are any messages in history
 * @returns {boolean} - True if history has messages
 */
export function hasHistory() {
  return getMessageCount() > 0;
}


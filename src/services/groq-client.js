/**
 * Groq API Client
 * Handles communication with Groq API for AI responses
 */

const API_URL = import.meta.env.VITE_GROQ_API_URL;
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
// const MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/**
 * Sends a request to Groq API and returns the response
 * @param {Array} messages - Array of message objects with role and content
 * @param {boolean} stream - Whether to stream the response
 * @param {Function} onChunk - Callback for streaming chunks (optional)
 * @returns {Promise<string>} - Complete response text
 */
export async function sendGroqRequest(messages, stream = false, onChunk = null) {
  if (!API_URL || !API_KEY) {
    throw new Error('Groq API credentials are not configured. Please check your environment variables.');
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and cannot be empty');
  }

  try {
    if (stream) {
      return await sendStreamingRequest(messages, onChunk);
    } else {
      return await sendNonStreamingRequest(messages);
    }
  } catch (error) {
    if (error.response) {
      const errorData = await error.response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${error.response.status}`);
    }
    throw new Error(`Failed to communicate with Groq API: ${error.message}`);
  }
}

/**
 * Sends a non-streaming request to Groq API
 * @param {Array} messages - Array of message objects
 * @returns {Promise<string>} - Response text
 */
async function sendNonStreamingRequest(messages) {
  const response = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Sends a streaming request to Groq API
 * @param {Array} messages - Array of message objects
 * @param {Function} onChunk - Callback function for each chunk
 * @returns {Promise<string>} - Complete response text
 */
async function sendStreamingRequest(messages, onChunk) {
  const response = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 8000,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            continue;
          }

          try {
            const json = JSON.parse(data);
            const chunk = json.choices[0]?.delta?.content || '';
            
            if (chunk) {
              fullText += chunk;
              if (onChunk && typeof onChunk === 'function') {
                onChunk(chunk);
              }
            }
          } catch (err) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6);
      if (data !== '[DONE]') {
        try {
          const json = JSON.parse(data);
          const chunk = json.choices[0]?.delta?.content || '';
          if (chunk) {
            fullText += chunk;
            if (onChunk && typeof onChunk === 'function') {
              onChunk(chunk);
            }
          }
        } catch (err) {
          // Ignore parsing errors
        }
      }
    }

    return fullText;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Validates Groq API configuration
 * @returns {boolean} - True if configuration is valid
 */
export function validateGroqConfig() {
  return !!(API_URL && API_KEY);
}


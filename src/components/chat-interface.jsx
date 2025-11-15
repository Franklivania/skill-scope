import { useEffect, useRef } from 'react';
import { parseMarkdown } from '../utils/markdown-renderer';

export default function ChatInterface({ messages, isStreaming, streamingText }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-8" style={{ color: 'hsl(var(--color-text-muted))' }}>
            <p>No messages yet. Upload a transcript to get started!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'rounded-br-none'
                  : 'rounded-bl-none'
              }`}
              style={{
                backgroundColor:
                  message.role === 'user'
                    ? `hsl(var(--color-primary))`
                    : `hsl(var(--color-surface))`,
                color:
                  message.role === 'user'
                    ? 'white'
                    : `hsl(var(--color-text))`,
              }}
            >
              {message.role === 'user' ? (
                <div className="whitespace-pre-wrap wrap-break-word">
                  {message.content}
                </div>
              ) : (
                <div className="wrap-break-word markdown-content">
                  {parseMarkdown(message.content)}
                </div>
              )}
              <div
                className="text-xs mt-2 opacity-70"
              >
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
            </div>
          </div>
        ))}

        {isStreaming && streamingText && (
          <div className="flex justify-start">
            <div
              className="max-w-[80%] rounded-lg rounded-bl-none px-4 py-3"
              style={{
                backgroundColor: `hsl(var(--color-surface))`,
                color: `hsl(var(--color-text))`,
              }}
            >
              <div className="wrap-break-word markdown-content">
                {parseMarkdown(streamingText)}
                <span className="animate-pulse ml-1">▊</span>
              </div>
              <div className="text-xs mt-2 opacity-70">AI (typing...)</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}


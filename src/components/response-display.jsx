/**
 * Response Display Component
 * Formats and displays AI responses with markdown support
 * (Basic markdown rendering - can be enhanced with a library if needed)
 */

export default function ResponseDisplay({ content }) {
  if (!content) return null;

  // Basic markdown-like formatting
  const formatText = (text) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((para, idx) => {
      // Check for headers
      if (para.match(/^#{1,6}\s/)) {
        const level = para.match(/^(#{1,6})/)[1].length;
        const text = para.replace(/^#{1,6}\s/, '');
        const Tag = `h${Math.min(level, 6)}`;
        return <Tag key={idx} className="font-bold mt-4 mb-2">{text}</Tag>;
      }
      
      // Check for bullet points
      if (para.match(/^[-*]\s/)) {
        const items = para.split(/\n/).filter(line => line.trim());
        return (
          <ul key={idx} className="list-disc list-inside my-2 space-y-1">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-*]\s/, '')}</li>
            ))}
          </ul>
        );
      }
      
      // Check for numbered lists
      if (para.match(/^\d+\.\s/)) {
        const items = para.split(/\n/).filter(line => line.trim());
        return (
          <ol key={idx} className="list-decimal list-inside my-2 space-y-1">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s/, '')}</li>
            ))}
          </ol>
        );
      }
      
      // Regular paragraph
      return (
        <p key={idx} className="my-2">
          {para.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < para.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };

  return (
    <div className="prose max-w-none">
      {formatText(content)}
    </div>
  );
}


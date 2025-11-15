/**
 * Markdown Renderer Utility
 * Converts markdown text to React elements
 * Native JS implementation without external libraries
 */

/**
 * Parses markdown text and converts to React elements
 * @param {string} text - Markdown text to parse
 * @returns {Array} - Array of React elements
 */
export function parseMarkdown(text) {
  if (!text) return [];

  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split by double newlines to get paragraphs/blocks
  const blocks = text.split(/\n\n+/);
  const elements = [];

  blocks.forEach((block, blockIdx) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    // Headers (# ## ### #### ##### ######) - check first line only
    const firstLine = trimmedBlock.split('\n')[0].trim();
    const headerMatch = firstLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch && trimmedBlock.split('\n').length === 1) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const HeaderTag = `h${Math.min(level, 6)}`;
      
      // Create header element based on level
      const headerProps = {
        key: `header-${blockIdx}`,
        className: `font-bold mb-3 mt-4 ${getHeaderClass(level)}`,
        style: { color: 'hsl(var(--color-text))' },
        children: parseInlineMarkdown(headerText),
      };

      switch (level) {
        case 1:
          elements.push(<h1 {...headerProps} />);
          break;
        case 2:
          elements.push(<h2 {...headerProps} />);
          break;
        case 3:
          elements.push(<h3 {...headerProps} />);
          break;
        case 4:
          elements.push(<h4 {...headerProps} />);
          break;
        case 5:
          elements.push(<h5 {...headerProps} />);
          break;
        case 6:
          elements.push(<h6 {...headerProps} />);
          break;
        default:
          elements.push(<h2 {...headerProps} />);
      }
      return;
    }

    // Code blocks (```code```) - handle multi-line
    if (trimmedBlock.startsWith('```')) {
      const codeEndIndex = trimmedBlock.indexOf('```', 3);
      if (codeEndIndex !== -1) {
        const codeBlock = trimmedBlock.substring(3, codeEndIndex);
        const lines = codeBlock.split('\n');
        const firstLine = lines[0] || '';
        const languageMatch = firstLine.match(/^(\w+)$/);
        const language = languageMatch ? languageMatch[1] : null;
        const codeContent = language 
          ? lines.slice(1).join('\n').trim()
          : codeBlock.trim();

        elements.push(
          <pre
            key={`code-${blockIdx}`}
            className="bg-surface rounded p-3 my-3 overflow-x-auto"
            style={{
              backgroundColor: 'hsl(var(--color-surface))',
              border: '1px solid hsl(var(--color-border))',
            }}
          >
            {language && (
              <div
                className="text-xs mb-2 opacity-70"
                style={{ color: 'hsl(var(--color-text-muted))' }}
              >
                {language}
              </div>
            )}
            <code className="text-sm font-mono block whitespace-pre" style={{ color: 'hsl(var(--color-text))' }}>
              {codeContent}
            </code>
          </pre>
        );
        return;
      }
    }

    // Horizontal rule (---)
    if (trimmedBlock.match(/^[-*_]{3,}$/)) {
      elements.push(
        <hr
          key={`hr-${blockIdx}`}
          className="my-4"
          style={{ borderColor: 'hsl(var(--color-border))' }}
        />
      );
      return;
    }

    // Blockquote (> text)
    if (trimmedBlock.startsWith('>')) {
      const quoteText = trimmedBlock
        .split('\n')
        .map(line => line.replace(/^>\s?/, ''))
        .join('\n');
      elements.push(
        <blockquote
          key={`quote-${blockIdx}`}
          className="border-l-4 pl-4 my-3 italic"
          style={{
            borderColor: 'hsl(var(--color-primary))',
            color: 'hsl(var(--color-text-muted))',
          }}
        >
          {parseInlineMarkdown(quoteText)}
        </blockquote>
      );
      return;
    }

    // Lists (unordered and ordered) - improved detection
    const listMatch = detectList(trimmedBlock);
    if (listMatch) {
      const { type, items } = listMatch;
      const ListTag = type === 'ordered' ? 'ol' : 'ul';
      const listClass = type === 'ordered' ? 'list-decimal' : 'list-disc';

      elements.push(
        <ListTag
          key={`list-${blockIdx}`}
          className={`${listClass} list-inside my-3 space-y-2 ml-4`}
        >
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className="pl-2">
              {parseInlineMarkdown(item.trim())}
            </li>
          ))}
        </ListTag>
      );
      return;
    }

    // Regular paragraph - handle inline markdown and preserve line breaks
    const lines = trimmedBlock.split('\n');
    const paragraphContent = lines
      .filter(line => line.trim() !== '')
      .map((line, lineIdx, filteredLines) => {
        const parsed = parseInlineMarkdown(line);
        return (
          <span key={lineIdx}>
            {parsed}
            {lineIdx < filteredLines.length - 1 && <br />}
          </span>
        );
      });

    if (paragraphContent.length > 0) {
      elements.push(
        <p key={`para-${blockIdx}`} className="my-3 leading-relaxed">
          {paragraphContent}
        </p>
      );
    }
  });

  return elements;
}

/**
 * Parses inline markdown (bold, italic, code, links)
 * @param {string} text - Text with inline markdown
 * @returns {Array|string} - Array of React elements and strings, or plain string
 */
function parseInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return text;

  const parts = [];
  let currentIndex = 0;
  let keyCounter = 0;

  // Pattern to match: **bold**, *italic*, `code`, [link](url)
  // Order matters: code and links first, then bold, then italic
  const patterns = [
    { regex: /`([^`\n]+)`/g, type: 'code' },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
    { regex: /\*\*([^*\n]+?)\*\*/g, type: 'bold' },
    { regex: /\*([^*\s\n][^*\n]*?[^*\s\n]|[^*\s\n])\*/g, type: 'italic' },
  ];

  // Find all matches
  const matches = [];
  patterns.forEach(({ regex, type }) => {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type,
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        url: match[2],
      });
    }
  });

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep first, prioritize code and links)
  const validMatches = [];
  let lastEnd = 0;
  matches.forEach(match => {
    if (match.start >= lastEnd) {
      validMatches.push(match);
      lastEnd = match.end;
    }
  });

  // Build elements
  validMatches.forEach(match => {
    // Add text before match
    if (match.start > currentIndex) {
      const beforeText = text.substring(currentIndex, match.start);
      if (beforeText) {
        parts.push(beforeText);
      }
    }

    // Add match element
    switch (match.type) {
      case 'bold':
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-bold">
            {match.content}
          </strong>
        );
        break;
      case 'italic':
        parts.push(
          <em key={`italic-${keyCounter++}`} className="italic">
            {match.content}
          </em>
        );
        break;
      case 'code':
        parts.push(
          <code
            key={`code-${keyCounter++}`}
            className="bg-surface px-1.5 py-0.5 rounded text-sm font-mono"
            style={{
              backgroundColor: 'hsl(var(--color-surface))',
              color: 'hsl(var(--color-primary))',
            }}
          >
            {match.content}
          </code>
        );
        break;
      case 'link':
        parts.push(
          <a
            key={`link-${keyCounter++}`}
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: 'hsl(var(--color-primary))' }}
          >
            {match.content}
          </a>
        );
        break;
    }

    currentIndex = match.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? (parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts) : text;
}

/**
 * Detects if a block is a list and extracts items
 * @param {string} block - Text block to check
 * @returns {Object|null} - List info or null
 */
function detectList(block) {
  const lines = block.split('\n').filter(line => line.trim());
  if (lines.length === 0) return null;

  // Check for unordered list (- or *)
  const unorderedMatch = lines[0].match(/^[-*]\s+(.+)$/);
  if (unorderedMatch) {
    const items = [];
    for (const line of lines) {
      const match = line.match(/^[-*]\s+(.+)$/);
      if (match) {
        items.push(match[1]);
      } else {
        // If we hit a non-list line, stop (unless it's indented continuation)
        if (line.match(/^\s{2,}/)) {
          // Continuation of previous item
          if (items.length > 0) {
            items[items.length - 1] += ' ' + line.trim();
          }
        } else {
          break;
        }
      }
    }

    if (items.length > 0) {
      return { type: 'unordered', items };
    }
  }

  // Check for ordered list (1. 2. 3.)
  const orderedMatch = lines[0].match(/^\d+\.\s+(.+)$/);
  if (orderedMatch) {
    const items = [];
    for (const line of lines) {
      const match = line.match(/^\d+\.\s+(.+)$/);
      if (match) {
        items.push(match[1]);
      } else {
        // If we hit a non-list line, stop (unless it's indented continuation)
        if (line.match(/^\s{2,}/)) {
          // Continuation of previous item
          if (items.length > 0) {
            items[items.length - 1] += ' ' + line.trim();
          }
        } else {
          break;
        }
      }
    }

    if (items.length > 0) {
      return { type: 'ordered', items };
    }
  }

  return null;
}

/**
 * Gets CSS class for header based on level
 * @param {number} level - Header level (1-6)
 * @returns {string} - CSS classes
 */
function getHeaderClass(level) {
  const classes = {
    1: 'text-3xl',
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm',
  };
  return classes[level] || 'text-base';
}

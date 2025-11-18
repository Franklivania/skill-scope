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
  
  // Pre-process: Extract tables from text and replace with placeholders
  const tablePlaceholders = [];
  // More flexible regex: matches header row, separator row, and data rows
  const tableRegex = /(\|[^\n]+\|\s*\n\|[\s\-:|]+\|\s*\n(?:\|[^\n]+\|\s*\n?)+)/g;
  let processedText = text;
  let match;
  const matches = [];
  
  // Collect all matches first
  while ((match = tableRegex.exec(text)) !== null) {
    matches.push({
      fullMatch: match[0],
      index: match.index,
      tableBlock: match[1].trim(),
    });
  }
  
  // Process matches in reverse order to preserve indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const placeholder = `__TABLE_PLACEHOLDER_${i}__`;
    tablePlaceholders[i] = { placeholder, tableBlock: match.tableBlock };
    processedText = processedText.substring(0, match.index) + 
                   `\n\n${placeholder}\n\n` + 
                   processedText.substring(match.index + match.fullMatch.length);
  }
  
  // Split by double newlines to get paragraphs/blocks
  const blocks = processedText.split(/\n\n+/);
  const elements = [];

  blocks.forEach((block, blockIdx) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    // Check if this is a table placeholder
    const placeholderMatch = trimmedBlock.match(/^__TABLE_PLACEHOLDER_(\d+)__$/);
    if (placeholderMatch) {
      const placeholderIdx = parseInt(placeholderMatch[1], 10);
      const tableData = tablePlaceholders[placeholderIdx];
      if (tableData) {
        const tableMatch = detectTable(tableData.tableBlock);
        if (tableMatch) {
          const { headers, rows } = tableMatch;
          elements.push(
            <div
              key={`table-placeholder-${placeholderIdx}`}
              className="my-6 overflow-x-auto rounded-lg"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              }}
            >
              <table
                className="w-full border-collapse min-w-full"
                style={{
                  backgroundColor: 'hsl(var(--color-background))',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'hsl(var(--color-surface))',
                      borderBottom: '2px solid hsl(var(--color-border))',
                    }}
                  >
                    {headers.map((header, headerIdx) => (
                      <th
                        key={`header-${headerIdx}`}
                        className="px-5 py-3.5 text-left font-semibold text-sm uppercase tracking-wide"
                        style={{
                          borderRight: headerIdx < headers.length - 1 
                            ? '1px solid hsl(var(--color-border))' 
                            : 'none',
                          color: 'hsl(var(--color-text))',
                        }}
                      >
                        {parseInlineMarkdown(header.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr
                      key={`row-${rowIdx}`}
                      className="transition-colors duration-150"
                      style={{
                        backgroundColor: rowIdx % 2 === 0 
                          ? 'hsl(var(--color-background))' 
                          : 'hsl(var(--color-surface))',
                        borderBottom: rowIdx < rows.length - 1 
                          ? '1px solid hsl(var(--color-border))' 
                          : 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--color-surface))';
                        e.currentTarget.style.opacity = '0.95';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = rowIdx % 2 === 0 
                          ? 'hsl(var(--color-background))' 
                          : 'hsl(var(--color-surface))';
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {row.map((cell, cellIdx) => {
                        const cellContent = parseInlineMarkdown(cell.trim());
                        const strengthValue = cell.trim().toLowerCase();
                        const isStrengthColumn = headers[cellIdx]?.toLowerCase().includes('strength');
                        
                        let strengthClass = '';
                        let strengthStyle = {};
                        let badgeStyle = null;
                        
                        if (isStrengthColumn) {
                          if (strengthValue === 'strong') {
                            strengthClass = 'font-semibold';
                            badgeStyle = {
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.375rem',
                              backgroundColor: 'hsl(142, 71%, 45%, 0.1)',
                              color: 'hsl(142, 71%, 45%)',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                            };
                          } else if (strengthValue === 'weak') {
                            strengthClass = 'font-semibold';
                            badgeStyle = {
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.375rem',
                              backgroundColor: 'hsl(0, 84%, 60%, 0.1)',
                              color: 'hsl(0, 84%, 60%)',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                            };
                          } else if (strengthValue === 'average') {
                            strengthClass = 'font-semibold';
                            badgeStyle = {
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.375rem',
                              backgroundColor: 'hsl(38, 92%, 50%, 0.1)',
                              color: 'hsl(38, 92%, 50%)',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                            };
                          }
                        }
                        
                        return (
                          <td
                            key={`cell-${rowIdx}-${cellIdx}`}
                            className={`px-5 py-3.5 text-sm ${strengthClass}`}
                            style={{
                              borderRight: cellIdx < row.length - 1 
                                ? '1px solid hsl(var(--color-border))' 
                                : 'none',
                              color: isStrengthColumn && badgeStyle 
                                ? badgeStyle.color 
                                : 'hsl(var(--color-text))',
                            }}
                          >
                            {isStrengthColumn && badgeStyle ? (
                              <span style={badgeStyle}>
                                {cell.trim()}
                              </span>
                            ) : (
                              cellContent
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }
      return;
    }

    // Headers (# ## ### #### ##### ######) - check first line only
    const firstLine = trimmedBlock.split('\n')[0].trim();
    // Support headers with or without a space after #'s
    const headerMatch = firstLine.match(/^(#{1,6})\s*(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const HeaderTag = `h${Math.min(level, 6)}`;
      
      // Create header element based on level
      const headerProps = {
        className: `font-bold mb-3 mt-4 ${getHeaderClass(level)}`,
        style: { color: 'hsl(var(--color-text))' },
        children: parseInlineMarkdown(headerText),
      };

      elements.push(<HeaderTag key={`header-${blockIdx}`} {...headerProps} />);

      // If there is additional content after the header on subsequent lines,
      // parse that content as its own block (lists/paragraphs).
      const newlineIndex = trimmedBlock.indexOf('\n');
      if (newlineIndex !== -1) {
        const rest = trimmedBlock.slice(newlineIndex + 1).trim();
        if (rest) {
          // Try list first
          const nestedList = detectList(rest);
          if (nestedList) {
            const { type, items } = nestedList;
            const ListTag = type === 'ordered' ? 'ol' : 'ul';
            const listClass = type === 'ordered' ? 'list-decimal' : 'list-disc';

            const renderItems = (nodes, parentIdxPrefix = '') => (
              nodes.map((node, idx) => {
                const key = `${parentIdxPrefix}${idx}`;
                return (
                  <li key={key} className="pl-2">
                    {parseInlineMarkdown((node.text || '').trim())}
                    {node.children && node.children.length > 0 && (
                      <ul className="list-disc list-inside my-2 ml-6 space-y-1">
                        {renderItems(node.children, `${key}-`)}
                      </ul>
                    )}
                  </li>
                );
              })
            );

            elements.push(
              <ListTag
                key={`list-after-header-${blockIdx}`}
                className={`${listClass} list-inside my-3 space-y-2 ml-4`}
              >
                {renderItems(items)}
              </ListTag>
            );
          } else {
            // Fallback: render as paragraph with preserved line breaks
            const lines = rest.split('\n');
            const paragraphContent = lines
              .filter(line => line.trim() !== '')
              .map((line, lineIdx, filteredLines) => {
                const parsed = parseInlineMarkdown(line);
                return (
                  <span key={`after-header-${blockIdx}-${lineIdx}`}>
                    {parsed}
                    {lineIdx < filteredLines.length - 1 && <br />}
                  </span>
                );
              });

            if (paragraphContent.length > 0) {
              elements.push(
                <p key={`para-after-header-${blockIdx}`} className="my-3 leading-relaxed">
                  {paragraphContent}
                </p>
              );
            }
          }
        }
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

    // Tables (| col1 | col2 |) - check before other content
    const tableMatch = detectTable(trimmedBlock);
    if (tableMatch) {
      const { headers, rows } = tableMatch;
      elements.push(
        <div
          key={`table-${blockIdx}`}
          className="my-6 overflow-x-auto rounded-lg"
          style={{
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          }}
        >
          <table
            className="w-full border-collapse min-w-full"
            style={{
              backgroundColor: 'hsl(var(--color-background))',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'hsl(var(--color-surface))',
                  borderBottom: '2px solid hsl(var(--color-border))',
                }}
              >
                {headers.map((header, headerIdx) => (
                  <th
                    key={`header-${headerIdx}`}
                    className="px-5 py-3.5 text-left font-semibold text-sm uppercase tracking-wide"
                    style={{
                      borderRight: headerIdx < headers.length - 1 
                        ? '1px solid hsl(var(--color-border))' 
                        : 'none',
                      color: 'hsl(var(--color-text))',
                    }}
                  >
                    {parseInlineMarkdown(header.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={`row-${rowIdx}`}
                  className="transition-colors duration-150"
                  style={{
                    backgroundColor: rowIdx % 2 === 0 
                      ? 'hsl(var(--color-background))' 
                      : 'hsl(var(--color-surface))',
                    borderBottom: rowIdx < rows.length - 1 
                      ? '1px solid hsl(var(--color-border))' 
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--color-surface))';
                    e.currentTarget.style.opacity = '0.95';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = rowIdx % 2 === 0 
                      ? 'hsl(var(--color-background))' 
                      : 'hsl(var(--color-surface))';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {row.map((cell, cellIdx) => {
                    const cellContent = parseInlineMarkdown(cell.trim());
                    const strengthValue = cell.trim().toLowerCase();
                    const isStrengthColumn = headers[cellIdx]?.toLowerCase().includes('strength');
                    
                    // Apply strength-based styling with badges
                    let strengthClass = '';
                    let strengthStyle = {};
                    let badgeStyle = null;
                    
                    if (isStrengthColumn) {
                      if (strengthValue === 'strong') {
                        strengthClass = 'font-semibold';
                        strengthStyle = { 
                          color: 'hsl(142, 71%, 45%)',
                        };
                        badgeStyle = {
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'hsl(142, 71%, 45%, 0.1)',
                          color: 'hsl(142, 71%, 45%)',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                        };
                      } else if (strengthValue === 'weak') {
                        strengthClass = 'font-semibold';
                        strengthStyle = { 
                          color: 'hsl(0, 84%, 60%)',
                        };
                        badgeStyle = {
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'hsl(0, 84%, 60%, 0.1)',
                          color: 'hsl(0, 84%, 60%)',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                        };
                      } else if (strengthValue === 'average') {
                        strengthClass = 'font-semibold';
                        strengthStyle = { 
                          color: 'hsl(38, 92%, 50%)',
                        };
                        badgeStyle = {
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'hsl(38, 92%, 50%, 0.1)',
                          color: 'hsl(38, 92%, 50%)',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                        };
                      }
                    }
                    
                    return (
                      <td
                        key={`cell-${rowIdx}-${cellIdx}`}
                        className={`px-5 py-3.5 text-sm ${strengthClass}`}
                        style={{
                          borderRight: cellIdx < row.length - 1 
                            ? '1px solid hsl(var(--color-border))' 
                            : 'none',
                          color: isStrengthColumn && strengthStyle.color 
                            ? strengthStyle.color 
                            : 'hsl(var(--color-text))',
                        }}
                      >
                        {isStrengthColumn && badgeStyle ? (
                          <span style={badgeStyle}>
                            {cell.trim()}
                          </span>
                        ) : (
                          cellContent
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      return;
    }

    // Lists (unordered and ordered) - improved detection
  const listMatch = detectList(trimmedBlock);
  if (listMatch) {
    const { type, items } = listMatch;
    const ListTag = type === 'ordered' ? 'ol' : 'ul';
    const listClass = type === 'ordered' ? 'list-decimal' : 'list-disc';

    const renderItems = (nodes, parentIdxPrefix = '') => (
      nodes.map((node, idx) => {
        const key = `${parentIdxPrefix}${idx}`;
        return (
          <li key={key} className="pl-2">
            {parseInlineMarkdown((node.text || '').trim())}
            {node.children && node.children.length > 0 && (
              <ul className="list-disc list-inside my-2 ml-6 space-y-1">
                {renderItems(node.children, `${key}-`)}
              </ul>
            )}
          </li>
        );
      })
    );

    elements.push(
      <ListTag
        key={`list-${blockIdx}`}
        className={`${listClass} list-inside my-3 space-y-2 ml-4`}
      >
        {renderItems(items)}
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
    // Auto-link plain URLs not already part of markdown links
    { regex: /\b(https?:\/\/[^\s<>()]+)\b/g, type: 'autolink' },
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
      case 'autolink':
        parts.push(
          <a
            key={`auto-${keyCounter++}`}
            href={match.content}
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
 * Detects if a block is a markdown table and extracts data
 * @param {string} block - Text block to check
 * @returns {Object|null} - Table data with headers and rows, or null
 */
function detectTable(block) {
  const lines = block.split('\n').map(line => line.trim());
  if (lines.length < 2) return null;

  // Find the start of a potential table (line with |)
  let tableStartIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && lines[i].split('|').length >= 2) {
      tableStartIdx = i;
      break;
    }
  }

  if (tableStartIdx === -1) return null;

  // Check if next line is a separator (more flexible matching)
  if (tableStartIdx + 1 >= lines.length) return null;
  
  const separatorLine = lines[tableStartIdx + 1];
  // More flexible separator: must contain | and dashes/colons/spaces
  const hasSeparator = separatorLine.includes('|') && 
    (separatorLine.includes('-') || separatorLine.includes(':') || separatorLine.match(/^\|[\s\-:|]+\|$/));
  
  if (!hasSeparator) return null;

  // Parse header row
  const parseRow = (line) => {
    // Remove leading and trailing | if present, but keep empty cells
    const cleaned = line.trim();
    if (!cleaned.includes('|')) return [];
    
    // Split by | and trim each cell
    const cells = cleaned.split('|').map(cell => cell.trim());
    
    // Remove empty first/last if they're just from leading/trailing |
    if (cells.length > 0 && cells[0] === '') cells.shift();
    if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
    
    return cells;
  };

  const headers = parseRow(lines[tableStartIdx]);
  if (headers.length === 0 || headers.length < 2) return null;

  // Parse data rows (skip separator line)
  const rows = [];
  for (let i = tableStartIdx + 2; i < lines.length; i++) {
    const line = lines[i];
    
    // Stop if we hit a non-table line (no | or doesn't look like table data)
    if (!line.includes('|')) break;
    
    // Skip if it looks like another separator
    if (line.match(/^[\s\-:|]+$/) && line.includes('-')) break;
    
    const row = parseRow(line);
    if (row.length === 0) break; // Empty row means end of table
    
    // Normalize row length to match headers
    if (row.length === headers.length) {
      rows.push(row);
    } else if (row.length > 0) {
      // Handle rows with different column counts
      const normalizedRow = [...row];
      while (normalizedRow.length < headers.length) {
        normalizedRow.push('');
      }
      rows.push(normalizedRow.slice(0, headers.length));
    }
  }

  // Need at least one data row to be a valid table
  if (rows.length === 0) return null;

  return { headers, rows };
}

/**
 * Detects if a block is a list and extracts items
 * @param {string} block - Text block to check
 * @returns {Object|null} - List info or null
 */
function detectList(block) {
  const lines = block
    .split('\n')
    .filter(line => line.trim().length > 0);
  if (lines.length === 0) return null;

  // Determine list type from first token
  // Support -, *, + for unordered; 1., 1), 1- for ordered
  const isUnordered = /^[-*+]\s+/.test(lines[0]);
  const isOrdered = /^\d+([.)-])\s+/.test(lines[0]);
  if (!isUnordered && !isOrdered) return null;

  const root = [];
  const stack = []; // stack of {indent, nodeArray}

  const getIndent = (line) => {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  };

  const parseItemText = (line) => {
    // remove bullet/token and leading spaces
    return line
      .replace(/^(\s*)([-*+]|\d+([.)-]))\s+/, '')
      .trim();
  };

  lines.forEach((line) => {
    const indent = getIndent(line);
    const isBullet = /^(\s*)([-*+]|\d+([.)-]))\s+/.test(line);

    if (!isBullet) {
      // Treat as continuation text for the last item at current depth
      const currentList = stack.length > 0 ? stack[stack.length - 1].nodeArray : root;
      if (currentList.length > 0) {
        const last = currentList[currentList.length - 1];
        last.text = `${last.text} ${line.trim()}`.trim();
      }
      return;
    }

    // Adjust stack to current indent (allow simple 2-space multiples)
    while (stack.length > 0 && indent < stack[stack.length - 1].indent) {
      stack.pop();
    }

    let parentArray;
    if (stack.length === 0 || indent === stack[stack.length - 1].indent) {
      parentArray = stack.length === 0 ? root : stack[stack.length - 1].nodeArray;
    } else if (indent > stack[stack.length - 1].indent) {
      // new nested level
      const lastAtPrev = stack[stack.length - 1].nodeArray[stack[stack.length - 1].nodeArray.length - 1];
      lastAtPrev.children = lastAtPrev.children || [];
      parentArray = lastAtPrev.children;
      stack.push({ indent, nodeArray: parentArray });
    } else {
      parentArray = root;
    }

    parentArray.push({ text: parseItemText(line), children: [] });
    if (stack.length === 0) {
      stack.push({ indent, nodeArray: root });
    }
  });

  const clean = (nodes) => nodes.map(n => ({
    text: n.text,
    children: (n.children && n.children.length > 0) ? clean(n.children) : [],
  }));

  const items = clean(root);
  return { type: isOrdered ? 'ordered' : 'unordered', items };
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

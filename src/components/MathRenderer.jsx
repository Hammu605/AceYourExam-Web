import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * High-performance Math & LaTeX renderer for competitive exam questions.
 * Supports inline `$math$` and block `$$math$$` expressions, plus raw LaTeX strings.
 */
export default function MathRenderer({ text = '', className = '' }) {
  const renderedContent = useMemo(() => {
    if (!text || typeof text !== 'string') return text;

    // Check if text contains math delimiters or common LaTeX tokens
    const hasMath = text.includes('$') || text.includes('\\frac') || text.includes('\\sqrt') || text.includes('^');
    if (!hasMath) return text;

    try {
      // Replace $$...$$ block math
      let formatted = text.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
        try {
          return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
        } catch (_) {
          return `$$${math}$$`;
        }
      });

      // Replace $...$ inline math
      formatted = formatted.replace(/\$([^$]+)\$/g, (_, math) => {
        try {
          return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
        } catch (_) {
          return `$${math}$`;
        }
      });

      return formatted;
    } catch (_) {
      return text;
    }
  }, [text]);

  if (typeof renderedContent === 'string' && renderedContent.includes('<span class="katex">')) {
    return (
      <span 
        className={`inline-block ${className}`} 
        dangerouslySetInnerHTML={{ __html: renderedContent }} 
      />
    );
  }

  return <span className={className}>{text}</span>;
}

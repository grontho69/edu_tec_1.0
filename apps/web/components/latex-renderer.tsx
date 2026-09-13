"use client";

import React, { useEffect, useState } from "react";
import katex from "katex";

interface LatexRendererProps {
  content: string;
  className?: string;
}

/**
 * Client-safe LaTeX equation renderer using KaTeX.
 * Prevents SSR hydration mismatch by rendering initial plain text on the server
 * and upgrading to KaTeX mathematical markup upon client mount.
 */
export const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = "" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Initial SSR pass: render plain text safely without hydration mismatch
    return <span className={className}>{content}</span>;
  }

  // Parse text into plain text segments and LaTeX equations ($...$ and $$...$$)
  const parts: React.ReactNode[] = [];
  const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(<span key={`text-${lastIndex}`}>{textBefore}</span>);
    }

    const rawMatch = match[0];
    const isDisplayMode = rawMatch.startsWith("$$") && rawMatch.endsWith("$$");
    const formula = isDisplayMode ? rawMatch.slice(2, -2) : rawMatch.slice(1, -1);

    try {
      const html = katex.renderToString(formula, {
        displayMode: isDisplayMode,
        throwOnError: false,
      });

      parts.push(
        <span
          key={`math-${match.index}`}
          dangerouslySetInnerHTML={{ __html: html }}
          className={isDisplayMode ? "block my-2 text-center" : "inline-block px-0.5"}
        />
      );
    } catch {
      parts.push(<span key={`err-${match.index}`}>{rawMatch}</span>);
    }

    lastIndex = match.index + rawMatch.length;
  }

  const textAfter = content.slice(lastIndex);
  if (textAfter) {
    parts.push(<span key={`text-end-${lastIndex}`}>{textAfter}</span>);
  }

  return <span className={className}>{parts}</span>;
};

export default LatexRenderer;

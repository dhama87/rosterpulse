"use client";

import { useState, useCallback } from "react";

interface ShareButtonProps {
  text?: string;
  title?: string;
}

export function ShareButton({ text, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    // Try native share on mobile
    if (navigator.share) {
      try {
        await navigator.share({ url, title, text });
        return;
      } catch {
        // User cancelled or not supported, fall through to copy
      }
    }

    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [title, text]);

  return (
    <button
      onClick={handleShare}
      className="text-xs text-text-muted hover:text-text-secondary transition-colors"
    >
      {copied ? "Copied!" : "Share →"}
    </button>
  );
}

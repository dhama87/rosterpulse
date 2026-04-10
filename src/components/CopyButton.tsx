"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-text-secondary hover:text-text-secondary"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

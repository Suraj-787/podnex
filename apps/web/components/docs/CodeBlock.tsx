"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ code, language, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border/50 bg-background overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-surface/40">
        <span className="text-xs font-light text-muted-foreground">
          {filename || language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-surface transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed">
        <code className="text-foreground/90">{code}</code>
      </pre>
    </div>
  );
}

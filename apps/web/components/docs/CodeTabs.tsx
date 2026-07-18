"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeTab {
  label: string;
  code: string;
}

export function CodeTabs({ tabs, className }: { tabs: CodeTab[]; className?: string }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tabs[active]!.code);
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
      <div className="flex items-center justify-between border-b border-border/50 bg-surface/40">
        <div className="flex">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "px-4 py-2.5 text-xs font-light transition-colors border-b-2 -mb-px",
                active === i
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 mr-3 rounded hover:bg-surface transition-colors"
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
        <code className="text-foreground/90">{tabs[active]!.code}</code>
      </pre>
    </div>
  );
}

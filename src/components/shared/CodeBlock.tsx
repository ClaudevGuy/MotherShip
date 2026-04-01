import React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: number;
  showCopy?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  maxHeight = 300,
  showCopy = true,
  className,
}: CodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Header */}
      {(language || showCopy) && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
          {language && (
            <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
              {language}
            </span>
          )}
          {showCopy && <CopyButton code={code} />}
        </div>
      )}

      {/* Code */}
      <ScrollArea style={{ maxHeight }}>
        <pre className="p-3 text-sm font-mono leading-relaxed overflow-x-auto">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="inline-block w-8 shrink-0 text-right mr-4 text-muted-foreground/40 select-none text-xs leading-relaxed">
                  {i + 1}
                </span>
                <span className="text-foreground/90 whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </ScrollArea>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? (
        <>
          <Check className="size-3" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="size-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

import { Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Source } from "@/types/research";

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) {
    return (
      <div className="py-6 text-center">
        <Globe className="mx-auto size-7 text-muted-foreground/30" strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground mt-2">No sources yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sources.map((source, i) => {
        const hostname = (() => {
          try { return new URL(source.url).hostname.replace("www.", ""); }
          catch { return source.url; }
        })();
        return (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-start gap-3 rounded-lg p-2.5",
              "hover:bg-muted/60 transition-all group"
            )}
          >
            <div className="size-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-border/50">
              <Globe className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {source.title || hostname}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground/60">{hostname}</span>
                <ExternalLink className="size-3 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

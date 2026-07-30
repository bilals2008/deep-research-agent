"use client";

import ReactMarkdown from "react-markdown";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogPopup,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ResearchFile } from "@/types/research";

function downloadFile(file: ResearchFile) {
  const blob = new Blob([file.content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.path.split("/").pop() || "file.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function FileViewerModal({
  file,
  onClose,
}: {
  file: ResearchFile | null;
  onClose: () => void;
}) {
  if (!file) return null;

  const filename = file.path.split("/").pop() || file.path;

  return (
    <Dialog open={!!file} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogBackdrop />
      <DialogPopup className="max-w-3xl p-0 gap-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <FileText className="size-4.5 text-primary" />
            </div>
            <DialogTitle className="text-sm font-semibold truncate">
              {filename}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => downloadFile(file)}
              title="Download"
            >
              <Download className="size-4" />
            </Button>
            <DialogClose />
          </div>
        </div>

        <div className="overflow-y-auto p-6 max-h-[65vh] scrollbar-thin">
          <div className="prose prose-sm prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-primary/80 prose-code:bg-primary/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary/30 prose-blockquote:text-foreground/70 max-w-none">
            <ReactMarkdown>{file.content}</ReactMarkdown>
          </div>
        </div>

        <div className="px-5 py-2.5 border-t shrink-0 bg-muted/30">
          <code className="text-xs text-muted-foreground/60">{file.path}</code>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

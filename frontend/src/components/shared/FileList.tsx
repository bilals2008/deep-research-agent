import { FileText, Download } from "lucide-react";
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

export function FileList({
  files,
  onFileClick,
}: {
  files: ResearchFile[];
  onFileClick: (file: ResearchFile) => void;
}) {
  if (files.length === 0) {
    return (
      <div className="py-6 text-center">
        <FileText className="mx-auto size-7 text-muted-foreground/30" strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground mt-2">No files yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {files.map((file, i) => {
        const filename = file.path.split("/").pop() || "file";
        const folder = file.path.split("/").slice(0, -1).join("/");
        return (
          <div
            key={`${file.path}-${i}`}
            className="flex items-center justify-between rounded-lg p-2.5 hover:bg-muted/60 transition-all cursor-pointer group"
            onClick={() => onFileClick(file)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/10">
                <FileText className="size-4 text-primary/60" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{filename}</p>
                {folder && (
                  <p className="text-xs text-muted-foreground/50 truncate">{folder}</p>
                )}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
              className="size-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted transition-all shrink-0"
              title="Download"
            >
              <Download className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

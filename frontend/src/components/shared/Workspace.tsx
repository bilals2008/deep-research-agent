"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ListTodo, FileText, Globe, Archive, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ResearchState, ResearchFile } from "@/types/research";
import { TodoList } from "./TodoList";
import { SourceList } from "./SourceList";
import { FileList } from "./FileList";
import { FileViewerModal } from "./FileViewerModal";

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
  disabled,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: number;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={cn("mb-3 overflow-hidden", disabled && "opacity-40")}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 transition-colors hover:bg-muted/30"
        disabled={disabled}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-4.5 font-medium">
              {badge}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="size-3.5 text-muted-foreground/60 transition-transform" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground/60 transition-transform" />
        )}
      </button>
      {isOpen && (
        <>
          <Separator />
          <div className="p-3.5">{children}</div>
        </>
      )}
    </Card>
  );
}

function EmptyWorkspace() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-12">
      <div className="size-24 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/10">
        <Archive className="size-10 text-primary/30" />
      </div>
      <p className="text-lg font-medium mb-1.5">No active research</p>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Ask a question in the chat to start researching. Results, sources, and reports will appear here.
      </p>
    </div>
  );
}

export function Workspace({ state }: { state: ResearchState }) {
  const [selectedFile, setSelectedFile] = useState<ResearchFile | null>(null);
  const hasContent = state.todos.length > 0 || state.sources.length > 0 || state.files.length > 0;

  if (!hasContent && state.status === "idle") {
    return <EmptyWorkspace />;
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Workspace</h2>
            <p className="text-xs text-muted-foreground">Research progress and artifacts</p>
          </div>
        </div>

        <Section
          title="Research Plan"
          icon={ListTodo}
          badge={state.todos.length}
          disabled={state.todos.length === 0}
        >
          <TodoList todos={state.todos} />
        </Section>

        <Section
          title="Sources"
          icon={Globe}
          badge={state.sources.length}
          disabled={state.sources.length === 0}
        >
          <SourceList sources={state.sources} />
        </Section>

        <Section
          title="Files"
          icon={FileText}
          badge={state.files.length}
          disabled={state.files.length === 0}
        >
          <FileList files={state.files} onFileClick={setSelectedFile} />
        </Section>

        <FileViewerModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      </div>
    </div>
  );
}

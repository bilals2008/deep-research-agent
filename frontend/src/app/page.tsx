"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { researchStream } from "@/lib/api";
import { FileViewerModal } from "@/components/shared/FileViewerModal";
import type { ResearchState, Todo, Source, ResearchFile } from "@/types/research";
import {
  Bot,
  SendHorizontal,
  Square,
  User,
  Sun,
  Moon,
  Settings,
  Brain,
  ListTodo,
  FileText,
  Globe,
  Archive,
  X,
  Trash2,
  PanelRightClose,
  PanelRightOpen,
  Check,
  Circle,
  CircleDot,
  ExternalLink,
  Download,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const INITIAL_STATE: ResearchState = {
  todos: [], sources: [], files: [], status: "idle",
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

const STATUS_CONFIG: Record<ResearchState["status"], { label: string; color: string; pulse?: boolean }> = {
  idle: { label: "Idle", color: "bg-muted-foreground/30" },
  planning: { label: "Planning", color: "bg-status-planning", pulse: true },
  researching: { label: "Researching", color: "bg-status-researching", pulse: true },
  synthesizing: { label: "Synthesizing", color: "bg-status-planning", pulse: true },
  done: { label: "Complete", color: "bg-status-done" },
  error: { label: "Error", color: "bg-status-error" },
  awaiting_confirmation: { label: "Awaiting", color: "bg-warning", pulse: true },
};

function StatusDot({ status, className }: { status: ResearchState["status"]; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full shrink-0",
        config.color,
        config.pulse && "animate-pulse",
        className
      )}
    />
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-1.5">
      <span className="size-1.5 rounded-full bg-current animate-typing-dot" />
      <span className="size-1.5 rounded-full bg-current animate-typing-dot [animation-delay:0.15s]" />
      <span className="size-1.5 rounded-full bg-current animate-typing-dot [animation-delay:0.3s]" />
    </span>
  );
}

const SUGGESTIONS = [
  "What are the latest breakthroughs in quantum computing?",
  "Compare React, Vue, and Svelte performance in 2026",
  "Explain the transformer architecture in detail",
  "How does climate change affect global supply chains?",
];

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

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [state, setState] = useState<ResearchState>(INITIAL_STATE);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string; isReport?: boolean }[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<ResearchFile | null>(null);
  const sessionId = useRef(genId());
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!streaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [streaming]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const query = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setStreaming(true);
    setSidebarOpen(true);

    if (state.status !== "awaiting_confirmation") {
      setState(INITIAL_STATE);
    }

    const controller = await researchStream(
      query,
      sessionId.current,
      (event, raw) => {
        const data = raw as { todos: Todo[]; sources: Source[]; files: ResearchFile[]; content?: string; status?: string };
        switch (event) {
          case "message": {
            const content = (raw as { content: string }).content || "";
            setMessages((prev) => [...prev, { role: "assistant", content }]);
            setState((prev) => ({ ...prev, status: "awaiting_confirmation" }));
            setStreaming(false);
            break;
          }
          case "status":
            if (data.status === "planning") {
              setMessages((prev) => [...prev, { role: "assistant", content: "Creating research plan..." }]);
            }
            break;
          case "plan":
            setState((prev) => ({ ...prev, todos: data.todos, status: "planning" }));
            break;
          case "plan_update":
            setState((prev) => ({ ...prev, todos: data.todos }));
            break;
          case "sources":
            setState((prev) => ({ ...prev, sources: data.sources, status: "researching" }));
            break;
          case "report": {
            const files = data.files || [];
            setState((prev) => ({ ...prev, files: [...prev.files, ...files], status: "done" }));
            const reportContent = files.length > 0 ? files.map((f) => f.content).join("\n\n---\n\n") : "Research complete!";
            setMessages((prev) => [...prev, { role: "assistant", content: reportContent, isReport: true }]);
            break;
          }
          case "complete":
            setStreaming(false);
            break;
        }
      },
      (err) => {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
        setState((prev) => ({ ...prev, status: "error" }));
        setStreaming(false);
      },
      () => setStreaming(false),
    );

    abortRef.current = controller;
  }, [input, streaming, state.status]);

  function handleCancel() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  const handleConfirm = useCallback(async (msg: string) => {
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setStreaming(true);

    const controller = await researchStream(
      msg,
      sessionId.current,
      (event, raw) => {
        const data = raw as { todos: Todo[]; sources: Source[]; files: ResearchFile[]; content?: string; status?: string };
        switch (event) {
          case "plan":
            setState((prev) => ({ ...prev, todos: data.todos, status: "planning" }));
            break;
          case "plan_update":
            setState((prev) => ({ ...prev, todos: data.todos }));
            break;
          case "sources":
            setState((prev) => ({ ...prev, sources: data.sources, status: "researching" }));
            break;
          case "report": {
            const files = data.files || [];
            setState((prev) => ({ ...prev, files: [...prev.files, ...files], status: "done" }));
            const reportContent = files.length > 0 ? files.map((f) => f.content).join("\n\n---\n\n") : "Research complete!";
            setMessages((prev) => [...prev, { role: "assistant", content: reportContent, isReport: true }]);
            break;
          }
          case "message": {
            const content = (raw as { content: string }).content || "";
            setMessages((prev) => [...prev, { role: "assistant", content }]);
            setState((prev) => ({ ...prev, status: "awaiting_confirmation" }));
            setStreaming(false);
            break;
          }
          case "complete":
            setStreaming(false);
            break;
        }
      },
      (err) => {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
        setState((prev) => ({ ...prev, status: "error" }));
        setStreaming(false);
      },
      () => setStreaming(false),
    );

    abortRef.current = controller;
  }, []);

  const hasMessages = messages.length > 0;
  const hasSidebarContent = state.todos.length > 0 || state.sources.length > 0 || state.files.length > 0;

  return (
    <div className="h-screen flex bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="shrink-0 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shrink-0">
                <Brain className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold leading-tight truncate">Deep Research</h1>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={state.status} />
                  <span className="text-[11px] text-muted-foreground">
                    {STATUS_CONFIG[state.status]?.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {hasSidebarContent && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {sidebarOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
                </Button>
              )}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  title="Toggle theme"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                title="Settings"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center text-center px-6 py-16 min-h-[60vh]">
                <div className="size-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-5 ring-1 ring-primary/10">
                  <Search className="size-8 text-primary/50" />
                </div>
                <h1 className="text-xl font-semibold mb-1.5">What do you want to research?</h1>
                <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
                  Ask me about any topic and I&apos;ll search the web, analyze sources, and generate a comprehensive report.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-left text-sm px-4 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted hover:border-border transition-all text-muted-foreground hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3 w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role === "assistant" && (
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-primary/20">
                        <Bot className="size-4 text-primary" />
                      </div>
                    )}
                    {msg.isReport ? (
                      <div className="max-w-[85%] bg-muted/30 border border-border/60 rounded-2xl px-5 py-4 shadow-sm">
                        <div className="prose prose-sm prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-primary/80 prose-code:bg-primary/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary/30 prose-blockquote:text-foreground/70 max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md shadow-sm"
                          : "bg-muted/70 text-foreground rounded-bl-md border border-border/40"
                      )}>
                        {msg.content}
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <User className="size-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {streaming && (
                  <div className="flex gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-primary/20">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-muted/70 px-4 py-3 border border-border/40">
                      <div className="flex items-center gap-2">
                        <StatusDot status={state.status} />
                        <span className="text-sm text-muted-foreground font-medium">
                          {STATUS_CONFIG[state.status]?.label || "Working"}
                        </span>
                        <TypingDots />
                      </div>
                    </div>
                  </div>
                )}

                {!streaming && state.status === "awaiting_confirmation" && (
                  <div className="flex gap-2 pt-2 pb-2 justify-start ml-11">
                    <Button
                      onClick={() => handleConfirm("yes")}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Check className="size-3.5" />
                      Yes, research this
                    </Button>
                    <Button
                      onClick={() => handleConfirm("no")}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                    >
                      <X className="size-3.5" />
                      No, skip
                    </Button>
                  </div>
                )}

                {!streaming && hasMessages && state.status !== "awaiting_confirmation" && (
                  <div className="flex flex-wrap gap-2 pt-4 pb-2">
                    {SUGGESTIONS.slice(0, 2).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-card hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
                      >
                        {s.length > 40 ? s.slice(0, 40) + "..." : s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <form onSubmit={handleSubmit}>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      state.status === "awaiting_confirmation"
                        ? "Confirm above or type a new message..."
                        : "Ask me to research anything..."
                    }
                    disabled={streaming || state.status === "awaiting_confirmation"}
                    className="h-11 bg-muted/30 border-border/60 focus-visible:ring-primary/30 text-sm px-4"
                  />
                </div>
                {streaming ? (
                  <Button type="button" size="icon" variant="destructive" onClick={handleCancel} title="Cancel" className="size-11 shrink-0">
                    <Square className="size-4 fill-current" />
                  </Button>
                ) : (
                  <Button type="submit" size="icon" disabled={!input.trim() || state.status === "awaiting_confirmation"} title="Send" className="size-11 shrink-0">
                    <SendHorizontal className="size-4" />
                  </Button>
                )}
              </div>
            </form>
            <p className="text-[11px] text-muted-foreground/50 text-center mt-2">
              AI responses may be inaccurate. Verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Workspace */}
      {hasSidebarContent && sidebarOpen && (
        <div className="w-[380px] xl:w-[420px] h-full border-l border-border bg-background flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Archive className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Workspace</span>
            </div>
            <Button variant="ghost" size="icon-xs" onClick={() => setSidebarOpen(false)} className="text-muted-foreground">
              <X className="size-3.5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            {/* Research Plan */}
            {state.todos.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <ListTodo className="size-3.5" />
                  Research Plan
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-auto">{state.todos.length}</Badge>
                </div>
                <div className="space-y-0.5">
                  {state.todos.map((todo) => (
                    <div key={todo.id} className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                      todo.status === "in_progress" && "bg-primary/5"
                    )}>
                      <span className="shrink-0 flex items-center justify-center size-4">
                        {todo.status === "completed" ? (
                          <span className="flex items-center justify-center size-4 rounded-full bg-status-done/15">
                            <Check size={10} className="text-status-done" strokeWidth={3} />
                          </span>
                        ) : todo.status === "in_progress" ? (
                          <CircleDot size={14} className="text-status-researching" />
                        ) : (
                          <Circle size={14} className="text-muted-foreground/30" />
                        )}
                      </span>
                      <span className={cn("text-sm leading-snug", todo.status === "completed" && "line-through text-muted-foreground/50")}>
                        {todo.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {state.sources.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Globe className="size-3.5" />
                  Sources
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-auto">{state.sources.length}</Badge>
                </div>
                <div className="space-y-1">
                  {state.sources.map((source, i) => {
                    const hostname = (() => {
                      try { return new URL(source.url).hostname.replace("www.", ""); }
                      catch { return source.url; }
                    })();
                    return (
                      <a key={i} href={source.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted/60 transition-all group"
                      >
                        <div className="size-6 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <Globe className="size-3 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                            {source.title || hostname}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[11px] text-muted-foreground/60">{hostname}</span>
                            <ExternalLink className="size-2.5 text-muted-foreground/30" />
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reports / Files - Claude/ChatGPT-style artifacts section */}
            {state.files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <FileText className="size-3.5" />
                  Reports
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-auto">{state.files.length}</Badge>
                </div>
                <div className="space-y-2">
                  {state.files.map((file, i) => {
                    const filename = file.path.split("/").pop() || "report.md";
                    const isLatest = i === state.files.length - 1;
                    return (
                      <div
                        key={`${file.path}-${i}`}
                        onClick={() => setSelectedFile(file)}
                        className={cn(
                          "rounded-xl border transition-all cursor-pointer group",
                          isLatest
                            ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                            : "border-border/60 bg-card hover:bg-muted/60"
                        )}
                      >
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={cn(
                                "size-8 rounded-lg flex items-center justify-center shrink-0",
                                isLatest ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted"
                              )}>
                                <FileText className={cn("size-4", isLatest ? "text-primary" : "text-muted-foreground")} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{filename}</p>
                                <p className="text-[11px] text-muted-foreground/60">
                                  {isLatest ? "Latest report" : `Report ${i + 1}`}
                                </p>
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
                          <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">
                            {file.content.split("\n").slice(0, 3).join(" ").slice(0, 150)}...
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-primary/70">
                            <span>View report</span>
                            <ChevronRight className="size-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border px-4 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
              <StatusDot status={state.status} />
              <span>{STATUS_CONFIG[state.status]?.label}</span>
              {state.status === "researching" && <TypingDots />}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button when sidebar is hidden but has content */}
      {hasSidebarContent && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 size-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-all"
          title="Open workspace"
        >
          <PanelRightOpen className="size-4 text-muted-foreground" />
        </button>
      )}

      {/* File Viewer Modal */}
      <FileViewerModal file={selectedFile} onClose={() => setSelectedFile(null)} />

      {/* Settings Dialog */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="size-3.5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold">Settings</h2>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={() => setSettingsOpen(false)}>
                <X className="size-3.5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Theme</p>
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <Button
                      key={t}
                      variant={mounted && theme === t ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme(t)}
                      className="flex-1 capitalize text-xs h-8"
                    >
                      {t === "light" ? <Sun className="size-3.5 mr-1" /> : t === "dark" ? <Moon className="size-3.5 mr-1" /> : null}
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground text-sm">Deep Research Agent</p>
                <p>v0.1.0 · Outfit Font</p>
                <p>Powered by LangGraph + Tavily</p>
              </div>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive text-xs"
                onClick={() => { if (confirm("Reset session?")) window.location.reload(); }}
              >
                <Trash2 className="size-3.5" />
                Reset Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

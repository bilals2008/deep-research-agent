"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBackdrop,
  SheetPopup,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Sun, Moon, Monitor, Brain, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function ThemeOption({
  label,
  value,
  icon: Icon,
  current,
  onSelect,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  current: string;
  onSelect: (v: string) => void;
}) {
  const isActive = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all",
        isActive
          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
          : "hover:bg-muted text-foreground"
      )}
    >
      <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
      <span className="font-medium">{label}</span>
      {isActive && (
        <span className="ml-auto size-2 rounded-full bg-primary" />
      )}
    </button>
  );
}

export function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentTheme: string = mounted ? (theme ?? "dark") : "dark";

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetBackdrop />
      <SheetPopup side="right" className="p-0 gap-0 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="size-4 text-primary" />
            </div>
            <SheetHeader>
              <SheetTitle className="text-sm font-semibold">Settings</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Customize your experience
              </SheetDescription>
            </SheetHeader>
          </div>
          <SheetClose />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Appearance
            </h3>
            <div className="space-y-1">
              <ThemeOption
                label="Light"
                value="light"
                icon={Sun}
                current={currentTheme}
                onSelect={setTheme}
              />
              <ThemeOption
                label="Dark"
                value="dark"
                icon={Moon}
                current={currentTheme}
                onSelect={setTheme}
              />
              <ThemeOption
                label="System"
                value="system"
                icon={Monitor}
                current={currentTheme}
                onSelect={setTheme}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              About
            </h3>
            <div className="rounded-xl bg-muted/50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-medium">Deep Research Agent</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-powered research assistant powered by OpenCode Zen API and LangGraph.
                Conducts deep, multi-step research using web search and LLM synthesis.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>v0.1.0</span>
                <span className="text-border">|</span>
                <span>Outfit Font</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Actions
            </h3>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm("This will clear all current research data. Continue?")) {
                  window.location.reload();
                }
              }}
            >
              <Trash2 className="size-4" />
              Reset Session
            </Button>
          </div>
        </div>

        <div className="shrink-0 border-t px-5 py-3">
          <p className="text-[11px] text-muted-foreground text-center">
            Built with Next.js + LangGraph
          </p>
        </div>
      </SheetPopup>
    </Sheet>
  );
}

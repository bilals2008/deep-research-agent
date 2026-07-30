import { Check, Circle, CircleDot, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from "@/types/research";

export function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) {
    return (
      <div className="py-6 text-center">
        <ListTodo className="mx-auto size-7 text-muted-foreground/30" strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground mt-2">No tasks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
            todo.status === "in_progress" && "bg-primary/5"
          )}
        >
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
          <span
            className={cn(
              "text-sm leading-snug",
              todo.status === "completed" && "line-through text-muted-foreground/50"
            )}
          >
            {todo.content}
          </span>
        </div>
      ))}
    </div>
  );
}

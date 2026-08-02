export interface Todo {
  id: string
  content: string
  status: "pending" | "in_progress" | "completed"
}

export interface Source {
  url: string
  title: string
  content: string
}

export interface ResearchFile {
  path: string
  content: string
}

export type Depth = "quick" | "balanced" | "thorough"

export interface ResearchState {
  todos: Todo[]
  sources: Source[]
  files: ResearchFile[]
  status: "idle" | "planning" | "researching" | "synthesizing" | "done" | "error" | "awaiting_confirmation"
  depth?: Depth
}

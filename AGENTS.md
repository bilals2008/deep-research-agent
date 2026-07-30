# AGENTS
EveryTime when you read this file Say Bilal!

This file helps any AI agent understand this project's history, decisions, and conventions.

## Environment

- Never force the user to share, reveal, or grant access to their .env file or its credentials. This is extremely dangerous.
- Always use .env.example as the reference for required environment variables.
- If a .env.example file does not exist, create one with placeholder values and ask the user to add the actual environment variables themselves.
- Never generate, expose, modify, or commit real secrets, API keys, tokens, passwords, or credentials on the user's behalf.

## Design Tokens

- NEVER use hardcoded colors (`bg-orange-500`, `text-white`, `bg-zinc-900`)
- ALWAYS use semantic tokens (`bg-primary`, `text-foreground`, `bg-card`)

## Components

- Import from `@/components/ui/` not custom implementations
- Use `cn()` utility for conditional classes
- shadcn/ui v4 uses **Base UI React** — `asChild` is NOT supported on triggers, use `render` or `className` instead
- ALWAYS check official docs (https://ui.shadcn.com/docs/components/) before using a component

## Data Fetching

- NEVER use `useEffect` for data fetching
- ALWAYS use TanStack Query (`useQuery`, `useMutation`) for all server state
- Never put fetch logic in components — abstract into custom hooks in `lib/hooks/`
- `queryFn` must be a pure function that returns data — never call `setState` inside it

## Icons

- NEVER use the `Sparkles` icon from lucide-react — it does not exist and will cause a runtime error
- Use `Shield`, `Star`, `Zap`, or `Award` as alternatives for highlight/feature icons

## Code Quality

- TypeScript strict mode
- No `any` types
- Functional components only
- Early returns over nested if/else

## File Structure

- Components in `components/` by feature
- Shared components in `components/shared/`
- Hooks in `lib/hooks/`
- API functions in `lib/api/`

## Project Origin

This project was initiated on 29 July 2026 during a conversation between Bilal (the developer) and an opencode AI agent.

The base reference comes from `C:\Users\muham\Desktop\llm\awesome-llm-apps\generative_ui_agents\ai-deep-research-agent\` — a CopilotKit + LangGraph demo. This project is a **from-scratch rebuild** with custom stack choices, NOT a copy of that reference.

## Tech Stack (finalized)

| Layer | Choice |
|-------|--------|
| Backend | Python FastAPI + LangGraph |
| Frontend | Next.js + Tailwind + shadcn/ui |
| LLM | OpenCode Zen API (free models) |
| Web Search | Tavily (free tier) |
| Deploy | Railway (backend) + Vercel (frontend) |

## Developer Context

- Main project: **Convio** (`C:\Users\muham\Desktop\convio`) — AI Chatbot & Agent Management Platform
- Stack experience: Next.js, TypeScript, Fastify, Python, Tailwind, shadcn/ui
- No budget — everything must be free tier

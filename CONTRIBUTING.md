# Contributing

Thanks for your interest in contributing to Deep Research Agent!

## How to Contribute

1. **Fork** the repository
2. **Create a branch** — `git checkout -b feature/your-feature`
3. **Make changes** — Follow the conventions below
4. **Test** — Ensure the app builds and runs
5. **Commit** — Use clear, concise commit messages
6. **Push** — `git push origin feature/your-feature`
7. **Open a Pull Request**

## Development Conventions

### Code Style

- **Frontend**: TypeScript strict mode, functional components, early returns
- **Backend**: Python type hints, async/await, pydantic models
- **No `any` types** — use proper TypeScript types
- **No `useEffect` for data fetching** — use TanStack Query

### Design Tokens

- Never use hardcoded colors — use semantic tokens (`bg-primary`, `text-foreground`, `bg-card`)
- See `src/app/globals.css` for the HSL design token system

### Components

- Components in `src/components/` by feature
- Shared components in `src/components/shared/`
- Import from `@/components/ui/` for shadcn components
- Use `cn()` utility for conditional class merging

### shadcn/ui v4

This project uses **shadcn/ui v4 with Base UI React**. Note that `asChild` is NOT supported on triggers — use `render` or `className` instead.

## Project Structure

```
frontend/          — Next.js application
  src/
    app/           — Pages, layout, globals
    components/    — React components
      ui/          — shadcn/ui primitives
      shared/      — Shared components
    lib/           — Hooks, API clients, utilities
    types/         — TypeScript type definitions
backend/           — Python FastAPI server
  agent/           — LangGraph state machine
  main.py          — FastAPI entry point
```

## Questions?

Open a [Discussion](https://github.com/yourusername/deep-research-agent/discussions) or check existing issues.

# Deep Research Agent

An AI-powered research assistant that autonomously plans, searches the web, analyzes sources, and generates comprehensive research reports — all through a clean ChatGPT/Claude-style chat interface.

Built from scratch with **Next.js 16** + **Python FastAPI/LangGraph** using free-tier services.

## Features

- **Full-page chat interface** — ChatGPT/Claude-style layout with collapsible workspace sidebar
- **Autonomous research planning** — AI breaks down any question into actionable research steps
- **Web search & analysis** — Searches multiple sources via Tavily, extracts relevant content
- **Markdown report generation** — Synthesizes findings into structured, well-cited reports
- **Inline report rendering** — Reports appear directly in the chat with proper headings, tables, code blocks
- **Confirmation buttons** — Click "Yes, research this" instead of typing
- **Live progress** — Real-time workspace showing plan, sources, and artifacts
- **Dark mode** — Light / Dark / System theme support
- **Export reports** — Download reports as markdown files
- **Responsive sidebar** — Collapsible workspace with research plan, sources, and reports

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui v4 + Outfit Font |
| Backend | Python FastAPI + LangGraph |
| LLM | OpenCode Zen API (free: `deepseek-v4-flash-free`) |
| Web Search | Tavily API (free tier: 1000 searches/month) |
| Deploy | Railway (backend) + Vercel (frontend) |

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- [Tavily API Key](https://tavily.com) (free tier — 1000 searches/month)

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your TAVILY_API_KEY
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if needed (defaults to http://localhost:8123)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start researching.

## Project Structure

```
deep-research-agent/
├── backend/
│   ├── agent/
│   │   ├── graph.py        # LangGraph state machine
│   │   ├── state.py        # Research state types
│   │   ├── tools.py        # Web search tools
│   │   └── prompts.py      # LLM system prompts
│   ├── main.py             # FastAPI server + SSE streaming
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx    # Main chat + workspace UI
│   │   │   ├── layout.tsx  # Root layout with theme provider
│   │   │   └── globals.css # Design system + theme tokens
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   └── shared/     # FileViewerModal
│   │   ├── lib/
│   │   │   ├── api.ts      # SSE research stream client
│   │   │   └── utils.ts    # cn() utility
│   │   └── types/
│   │       └── research.ts # TypeScript types
│   ├── package.json
│   └── .env.example
├── AGENTS.md               # AI agent conventions
├── ARCHITECTURE.md         # Architecture documentation
├── TECH-STACK.md           # Technology decisions
├── FRONTEND-SPECS.md       # Frontend specifications
├── BACKEND-SPECS.md        # Backend specifications
├── ROADMAP.md              # Development roadmap
└── PHASES.md               # Implementation phases
```

## Architecture

```
User → Chat UI → SSE Stream → FastAPI → LangGraph Agent
                                        ├── Classify intent
                                        ├── Plan research steps
                                        ├── Search web (Tavily)
                                        └── Synthesize report
```

The agent runs a state machine with these steps:
1. **Classify** — Determines if input is a chat, confirmation, or research query
2. **Confirm** — Asks user to confirm before starting research
3. **Plan** — Breaks the query into searchable sub-questions
4. **Research** — Executes web searches for each sub-question
5. **Synthesize** — Generates a comprehensive markdown report

## Design System



- **Primary**: Deep forest green (`hsl(142 71% 28%)` / `hsl(136 76% 45%)` dark)
- **Background**: Warm off-white / deep teal-black in dark mode
- **Font**: Outfit Variable (clean, modern sans-serif)
- **Components**: shadcn/ui v4 with Base UI React primitives

## Deployment

- **Backend**: Railway — `railway deploy` from the `backend/` directory
- **Frontend**: Vercel — `vercel deploy` from the `frontend/` directory

## License

MIT — see [LICENSE](./LICENSE).



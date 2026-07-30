import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent.graph import build_agent
from agent.state import ResearchState

os.chdir(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

app = FastAPI(title="Deep Research Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = build_agent()

# In-memory session store for pending queries
sessions: dict = {}


@app.get("/health")
def health():
    return {"status": "ok", "agent": "deep-research", "version": "1.0.0"}


class ResearchRequest(BaseModel):
    query: str
    session_id: str = "default"


def initial_state(query: str) -> ResearchState:
    return {
        "messages": [],
        "query": query,
        "plan": [],
        "sources": [],
        "files": [],
        "current_step": 0,
        "status": "idle",
        "intent": "",
        "chat_message": "",
        "pending_query": "",
    }


@app.post("/api/research")
async def research_endpoint(req: ResearchRequest):
    sid = req.session_id
    pending = sessions.get(sid, "")

    # Build state with pending query from session
    state = initial_state(req.query)
    state["pending_query"] = pending

    thread_id = f"session_{sid}"
    config = {"configurable": {"thread_id": thread_id}}

    async def event_stream():
        nonlocal pending
        completed = False

        async for update in agent.astream(state, config, stream_mode="updates"):
            for node_name, output in update.items():
                chat_msg = output.get("chat_message", "")
                status = output.get("status", "")

                if node_name == "chat":
                    yield f"event: message\ndata: {json.dumps({'content': chat_msg})}\n\n"
                    yield "event: complete\ndata: {}\n\n"
                    completed = True

                elif node_name == "confirm":
                    sessions[sid] = req.query  # save pending query
                    yield f"event: message\ndata: {json.dumps({'content': chat_msg})}\n\n"
                    yield "event: complete\ndata: {}\n\n"
                    completed = True

                elif node_name == "plan":
                    sessions[sid] = ""  # clear pending - research started
                    yield f"event: status\ndata: {json.dumps({'status': 'planning'})}\n\n"
                    yield f"event: plan\ndata: {json.dumps({'todos': output.get('plan', [])})}\n\n"

                elif node_name == "research":
                    yield f"event: sources\ndata: {json.dumps({'sources': output.get('sources', [])})}\n\n"
                    yield f"event: plan_update\ndata: {json.dumps({'todos': output.get('plan', [])})}\n\n"

                elif node_name == "synthesize":
                    yield f"event: report\ndata: {json.dumps({'files': output.get('files', [])})}\n\n"
                    yield "event: complete\ndata: {}\n\n"
                    completed = True

        if not completed:
            yield "event: complete\ndata: {}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def main():
    import uvicorn
    host = os.environ.get("SERVER_HOST", "0.0.0.0")
    port = int(os.environ.get("SERVER_PORT", "8123"))
    uvicorn.run("main:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()

import json
import os
import uuid

from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from agent.state import ResearchState, Todo, Source, ResearchFile
from agent.tools import research
from agent.prompts import (
    CLASSIFIER_PROMPT,
    CHAT_RESPONSE_PROMPT,
    CONFIRMATION_PROMPT,
    PLANNER_PROMPT,
    SYNTHESIZER_PROMPT,
)


def get_llm():
    return ChatOpenAI(
        model=os.environ.get("MODEL_NAME", "deepseek-v4-flash-free"),
        base_url="https://opencode.ai/zen/v1",
        api_key=os.environ.get("OPENCODE_API_KEY") or "",
        temperature=0.7,
    )


def classify_intent(state: ResearchState) -> dict:
    llm = get_llm()
    response = llm.invoke([
        {"role": "system", "content": CLASSIFIER_PROMPT},
        {"role": "user", "content": state["query"]},
    ])
    intent = response.content.strip().lower()
    if intent not in ("chat", "confirm", "research"):
        intent = "research"

    return {
        "intent": intent,
        "messages": state["messages"],
    }


def route_after_classify(state: ResearchState) -> str:
    intent = state.get("intent", "research")
    if intent == "chat":
        return "chat"
    elif intent == "confirm":
        pending = state.get("pending_query", "")
        if pending:
            return "plan"
        return "chat"
    return "confirm"


def chat_response(state: ResearchState) -> dict:
    llm = get_llm()
    response = llm.invoke([
        {"role": "system", "content": CHAT_RESPONSE_PROMPT.format(user_message=state["query"])},
    ])

    msg = response.content
    return {
        "chat_message": msg,
        "status": "done",
        "messages": state["messages"] + [{"role": "assistant", "content": msg}],
    }


def ask_confirmation(state: ResearchState) -> dict:
    llm = get_llm()
    response = llm.invoke([
        {"role": "system", "content": CONFIRMATION_PROMPT.format(query=state["query"])},
    ])

    msg = response.content
    return {
        "chat_message": msg,
        "status": "awaiting_confirmation",
        "pending_query": state["query"],
        "messages": state["messages"] + [{"role": "assistant", "content": msg}],
    }


def plan_research(state: ResearchState) -> dict:
    llm = get_llm()
    query = state.get("pending_query") or state["query"]

    response = llm.invoke([
        {"role": "system", "content": PLANNER_PROMPT},
        {"role": "user", "content": query},
    ])

    try:
        steps = json.loads(response.content)
    except json.JSONDecodeError:
        steps = [query]

    todos = [
        Todo(id=str(uuid.uuid4())[:8], content=step, status="pending")
        for step in steps
    ]

    return {
        "plan": todos,
        "status": "planning",
        "pending_query": "",
        "messages": state["messages"] + [
            {"role": "assistant", "content": f"I'll research: {query}"}
        ],
    }


def execute_research(state: ResearchState) -> dict:
    plan = list(state["plan"])
    step_idx = state["current_step"]

    if step_idx >= len(plan):
        return {"status": "synthesizing"}

    plan[step_idx]["status"] = "in_progress"
    query = plan[step_idx]["content"]

    result = research(query)

    sources = list(state["sources"])
    for s in result.get("sources", []):
        sources.append(Source(url=s["url"], title=s["title"], content=s["content"]))

    plan[step_idx]["status"] = "completed"

    return {
        "plan": plan,
        "sources": sources,
        "current_step": step_idx + 1,
        "status": "researching",
    }


def synthesize_findings(state: ResearchState) -> dict:
    llm = get_llm()

    sources_text = "\n\n".join(
        f"- {s['title']}: {s['content'][:500]}" for s in state["sources"]
    )

    query = state.get("pending_query") or state["query"]

    response = llm.invoke([
        {"role": "system", "content": SYNTHESIZER_PROMPT},
        {"role": "user", "content": f"Question: {query}\n\nResearch Findings:\n{sources_text}"},
    ])

    file = ResearchFile(
        path="/reports/final_report.md",
        content=response.content,
    )

    return {
        "files": [file],
        "status": "done",
        "pending_query": "",
        "messages": state["messages"] + [
            {"role": "assistant", "content": "Research complete! Report generated."}
        ],
    }


def should_continue(state: ResearchState) -> str:
    if state["current_step"] < len(state["plan"]):
        return "research"
    return "synthesize"


def build_agent():
    workflow = StateGraph(ResearchState)

    workflow.add_node("classify", classify_intent)
    workflow.add_node("chat", chat_response)
    workflow.add_node("confirm", ask_confirmation)
    workflow.add_node("plan", plan_research)
    workflow.add_node("research", execute_research)
    workflow.add_node("synthesize", synthesize_findings)

    workflow.set_entry_point("classify")

    workflow.add_conditional_edges(
        "classify",
        route_after_classify,
        {"chat": "chat", "confirm": "confirm", "plan": "plan"},
    )
    workflow.add_edge("chat", END)
    workflow.add_edge("confirm", END)
    workflow.add_edge("plan", "research")
    workflow.add_conditional_edges(
        "research",
        should_continue,
        {"research": "research", "synthesize": "synthesize"},
    )
    workflow.add_edge("synthesize", END)

    return workflow.compile(checkpointer=MemorySaver())

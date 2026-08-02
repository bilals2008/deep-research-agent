from typing import TypedDict, List, Optional


class Todo(TypedDict):
    id: str
    content: str
    status: str  # pending | in_progress | completed


class Source(TypedDict):
    url: str
    title: str
    content: str


class ResearchFile(TypedDict):
    path: str
    content: str


class ResearchState(TypedDict):
    messages: List[dict]
    query: str
    plan: List[Todo]
    sources: List[Source]
    files: List[ResearchFile]
    current_step: int
    status: str  # idle | planning | researching | synthesizing | done | awaiting_confirmation
    intent: str  # chat | research | confirmation
    chat_message: str
    pending_query: str
    depth: str  # quick | balanced | thorough

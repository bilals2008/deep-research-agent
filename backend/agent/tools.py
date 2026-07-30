import os
from typing import Any, List
from tavily import TavilyClient


def research(query: str, max_results: int = 5) -> dict:
    """
    Search the web using Tavily and return structured results.
    """
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return {"summary": "Tavily API key not configured", "sources": []}

    try:
        client = TavilyClient(api_key=api_key)
        results = client.search(
            query=query,
            max_results=max_results,
            topic="general",
        )

        sources = []
        for r in results.get("results", []):
            sources.append({
                "url": r.get("url", ""),
                "title": r.get("title", ""),
                "content": (r.get("content") or "")[:3000],
            })

        summary = f"Found {len(sources)} results about: {query}"
        return {"summary": summary, "sources": sources}

    except Exception as e:
        return {"summary": f"Search failed: {str(e)}", "sources": []}

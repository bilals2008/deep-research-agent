import ast
import os
import re
from typing import Any

import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from tavily import TavilyClient


def research(query: str, max_results: int = 5) -> dict:
    """Search the web using Tavily and return structured results."""
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return search_duckduckgo(query, max_results)

    try:
        client = TavilyClient(api_key=api_key)
        results = client.search(query=query, max_results=max_results, topic="general")
        sources = []
        for r in results.get("results", []):
            sources.append({
                "url": r.get("url", ""),
                "title": r.get("title", ""),
                "content": (r.get("content") or "")[:3000],
            })
        return {"summary": f"Found {len(sources)} results about: {query}", "sources": sources}
    except Exception:
        return search_duckduckgo(query, max_results)


def search_duckduckgo(query: str, max_results: int = 5) -> dict:
    """Fallback web search using DuckDuckGo."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        sources = []
        for r in results:
            sources.append({
                "url": r.get("href", ""),
                "title": r.get("title", ""),
                "content": (r.get("body") or "")[:3000],
            })
        return {"summary": f"DuckDuckGo: found {len(sources)} results", "sources": sources}
    except Exception as e:
        return {"summary": f"DuckDuckGo search failed: {str(e)}", "sources": []}


def search_wikipedia(query: str) -> dict:
    """Search Wikipedia for a given topic and return structured summary."""
    try:
        import wikipedia
        summary = wikipedia.summary(query, sentences=5, auto_suggest=True)
        page = wikipedia.page(query, auto_suggest=True)
        return {
            "sources": [{
                "url": page.url,
                "title": page.title,
                "content": summary[:3000],
            }],
        }
    except Exception as e:
        return {"sources": []}


def scrape_url(url: str) -> dict:
    """Fetch and extract readable text content from a URL."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        title = soup.title.string.strip() if soup.title else url
        text = soup.get_text(separator="\n", strip=True)
        lines = [l for l in text.split("\n") if len(l) > 40]
        content = "\n\n".join(lines[:50])[:5000]

        return {"sources": [{"url": url, "title": title, "content": content}]}
    except Exception as e:
        return {"sources": [{"url": url, "title": url, "content": f"Failed to scrape: {str(e)}"}]}


SAFE_NODES = {
    ast.Expression, ast.BinOp, ast.UnaryOp, ast.Constant, ast.Name, ast.Load,
    ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow,
    ast.USub, ast.UAdd, ast.Mod, ast.FloorDiv,
}

SAFE_OPS = {
    ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow,
    ast.USub, ast.UAdd, ast.Mod, ast.FloorDiv,
}

SAFE_NAMES = {"pi": 3.141592653589793, "e": 2.718281828459045}


def calculate(expression: str) -> dict:
    """Safely evaluate a mathematical expression."""
    try:
        tree = ast.parse(expression.strip(), mode="eval")
        for node in ast.walk(tree):
            if isinstance(node, ast.Name):
                if node.id not in SAFE_NAMES:
                    return {"result": f"Error: '{node.id}' is not allowed"}
            elif isinstance(node, (ast.BinOp, ast.UnaryOp)):
                if type(node.op) not in SAFE_OPS:
                    return {"result": "Error: Unsupported operation"}
            elif type(node) not in SAFE_NODES:
                return {"result": "Error: Unsupported operation"}

        compiled = compile(tree, "<string>", "eval")
        result = eval(compiled, {"__builtins__": {}}, SAFE_NAMES)
        return {"result": str(result)}
    except Exception as e:
        return {"result": f"Error: {str(e)}"}


def deep_research(query: str, max_results: int = 5) -> dict:
    """Run multiple tools in parallel for a given query and merge all results."""
    all_sources = []

    web = research(query, max_results)
    all_sources.extend(web.get("sources", []))

    wiki = search_wikipedia(query)
    all_sources.extend(wiki.get("sources", []))

    seen = set()
    unique = []
    for s in all_sources:
        key = s.get("url", "")
        if key and key not in seen:
            seen.add(key)
            unique.append(s)

    return {"summary": f"Deep research: found {len(unique)} sources", "sources": unique[:max_results + 2]}

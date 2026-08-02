const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8123";

export async function researchStream(
  query: string,
  sessionId: string,
  onEvent: (event: string, data: unknown) => void,
  onError: (err: Error) => void,
  onComplete: () => void,
  depth: string = "balanced",
): Promise<AbortController> {
  const controller = new AbortController();

  try {
    const res = await fetch(`${API_BASE}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, session_id: sessionId, depth }),
      signal: controller.signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Server error: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let eventType = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            onEvent(eventType, JSON.parse(data));
          } catch {
            // ignore parse errors
          }
          eventType = "";
        }
      }
    }

    onComplete();
  } catch (err: unknown) {
    if (err instanceof Error && err.name !== "AbortError") {
      onError(err);
    }
  }

  return controller;
}

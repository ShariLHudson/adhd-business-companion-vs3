/** NDJSON stream from /api/companion-chat when stream: true. */

export type CompanionChatStreamEvent =
  | { delta: string }
  | { done: true; relationshipResponseId?: string; message?: string }
  | { error: string };

export async function consumeCompanionChatStream(
  response: Response,
  onText: (fullText: string) => void,
): Promise<{ fullText: string; relationshipResponseId?: string }> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response stream");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let relationshipResponseId: string | undefined;

  const processLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let event: CompanionChatStreamEvent;
    try {
      event = JSON.parse(trimmed) as CompanionChatStreamEvent;
    } catch {
      return;
    }
    if ("error" in event && event.error) {
      throw new Error(event.error);
    }
    if ("delta" in event && typeof event.delta === "string") {
      fullText += event.delta;
      onText(fullText);
    }
    if ("done" in event && event.done) {
      relationshipResponseId = event.relationshipResponseId;
      if (event.message && event.message !== fullText) {
        fullText = event.message;
        onText(fullText);
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      processLine(line);
    }
  }

  if (buffer.trim()) {
    processLine(buffer);
  }

  return { fullText, relationshipResponseId };
}

export function isCompanionChatStreamResponse(response: Response): boolean {
  const type = response.headers.get("content-type") ?? "";
  return type.includes("application/x-ndjson");
}

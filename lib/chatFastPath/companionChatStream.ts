/** NDJSON stream from /api/companion-chat when stream: true. */

import { CHAT_COMPLETION_TIMEOUT_MS } from "./chatTurnGuarantee";

export type CompanionChatStreamEvent =
  | { delta: string }
  | { done: true; relationshipResponseId?: string; message?: string }
  | { error: string };

export class CompanionChatStreamTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`companion-chat-stream-timeout:${timeoutMs}`);
    this.name = "CompanionChatStreamTimeoutError";
  }
}

function readWithTimeout(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  timeoutMs: number,
): Promise<ReadableStreamReadResult<Uint8Array>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      void reader.cancel().catch(() => undefined);
      reject(new CompanionChatStreamTimeoutError(timeoutMs));
    }, timeoutMs);
    reader
      .read()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function consumeCompanionChatStream(
  response: Response,
  onText: (fullText: string) => void,
  options?: { timeoutMs?: number },
): Promise<{ fullText: string; relationshipResponseId?: string }> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response stream");
  }

  const timeoutMs = options?.timeoutMs ?? CHAT_COMPLETION_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;

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
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      void reader.cancel().catch(() => undefined);
      throw new CompanionChatStreamTimeoutError(timeoutMs);
    }
    const { done, value } = await readWithTimeout(reader, remaining);
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

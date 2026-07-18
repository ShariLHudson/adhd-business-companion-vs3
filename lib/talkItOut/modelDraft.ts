/**
 * Talk It Out — model draft via companion-chat with Shari Response Engine system prompt.
 */

import {
  TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT,
  buildShariResponseEngineLlmContext,
} from "./shariResponseEngine";
import type { TalkItOutSession } from "./types";

export async function fetchTalkItOutModelDraft(input: {
  session: TalkItOutSession;
  userText: string;
  signal?: AbortSignal;
}): Promise<{ draft: string; usedModel: boolean }> {
  const history = input.session.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  // Include the latest user turn (may already be appended to session)
  const last = history[history.length - 1];
  const messages =
    last?.role === "user" && last.content === input.userText
      ? history
      : [...history, { role: "user" as const, content: input.userText }];

  const ctx = buildShariResponseEngineLlmContext({
    messages,
    verbatimUsed: input.session.verbatimUsed,
  });

  try {
    const res = await fetch("/api/companion-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: input.signal,
      body: JSON.stringify({
        messages: ctx.messages,
        inputType: "text",
        coachingMode: "focus",
        talkItOutShariEngine: true,
        systemPromptOverride: TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT,
      }),
    });
    if (!res.ok) {
      return { draft: "", usedModel: false };
    }
    const data = (await res.json()) as {
      message?: string;
      usedCoachingFallback?: boolean;
    };
    const draft = data.message?.trim() ?? "";
    if (!draft || data.usedCoachingFallback) {
      return { draft: "", usedModel: false };
    }
    return { draft, usedModel: true };
  } catch {
    return { draft: "", usedModel: false };
  }
}

"use client";

import { FormEvent, useRef, useState } from "react";

import type {
  FounderGuidanceSuggestedAction,
  FounderGuidanceWorkspaceSnapshot,
} from "@/lib/founderGuidance/types";
import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";
import { logApiUsage } from "@/lib/founderWorkspace/analytics/apiUsageStore";

type GuidanceMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  suggestedAction?: FounderGuidanceSuggestedAction | null;
};

const STARTER_PROMPTS = [
  "What should I work on?",
  "Help me fix this.",
  "Research this.",
  "Create an experiment.",
  "Create a Cursor prompt.",
  "Turn this into a project.",
];

type FounderGuidanceChatProps = {
  workspace: FounderGuidanceWorkspaceSnapshot | null;
  activeTab: string;
  selectedItem: FounderWorkspaceItem | null;
  intelligenceSummary?: string;
  trackingSummary?: string;
  briefingSummary?: string;
  productIntelligenceSummary?: string;
  businessHealthSummary?: string;
  analyticsSummary?: string;
  experimentMetricsSummary?: string;
  dashboardSummary?: string;
  activeTrackedExperimentId?: string | null;
  onSuggestedAction: (action: FounderGuidanceSuggestedAction) => void;
};

/** Session-only founder guidance — not saved to user chat history. */
export function FounderGuidanceChat({
  workspace,
  activeTab,
  selectedItem,
  intelligenceSummary,
  trackingSummary,
  briefingSummary,
  productIntelligenceSummary,
  businessHealthSummary,
  analyticsSummary,
  experimentMetricsSummary,
  dashboardSummary,
  activeTrackedExperimentId,
  onSuggestedAction,
}: FounderGuidanceChatProps) {
  const [messages, setMessages] = useState<GuidanceMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: GuidanceMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setError(null);
    setLoading(true);
    scrollToBottom();

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/founder/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: history.slice(0, -1),
          workspace: workspace ?? { projects: [], experiments: [], notes: [] },
          activeTab,
          selectedItem,
          intelligenceSummary,
          trackingSummary,
          briefingSummary,
          productIntelligenceSummary,
          businessHealthSummary,
          analyticsSummary,
          experimentMetricsSummary,
          dashboardSummary,
        }),
      });

      const data = (await res.json()) as {
        message?: string;
        suggestedAction?: FounderGuidanceSuggestedAction | null;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Could not reach Shari. Try again.");
        return;
      }

      const reply = data.message ?? "I'm here — try asking again.";
      logApiUsage({
        endpoint: "/api/founder/guidance",
        promptText: trimmed,
        completionText: reply,
        experimentId: activeTrackedExperimentId ?? undefined,
        projectId: selectedItem?.kind === "project" ? selectedItem.id : undefined,
      });

      const assistantMsg: GuidanceMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: reply,
        suggestedAction: data.suggestedAction ?? null,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      scrollToBottom();
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  function confirmAction(action: FounderGuidanceSuggestedAction) {
    const ok = window.confirm(
      `Shari suggests: ${action.label}\n\nApply this to your workspace?`,
    );
    if (ok) onSuggestedAction(action);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-[#d4cdc3] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#1e4f4f]">Guidance</h2>
        <p className="text-xs text-[#6b635a]">
          Private Shari — session only, not saved to user chat.
        </p>
        {selectedItem ? (
          <p className="mt-1 text-[11px] text-[#1e4f4f]">
            Focused: {selectedItem.title}
          </p>
        ) : null}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-[#6b635a]">
              Ask what to work on, what&apos;s broken, or what can wait.
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void send(prompt)}
                  disabled={loading}
                  className="rounded-full border border-[#d4cdc3] bg-white px-2.5 py-1 text-[11px] font-medium text-[#2d2926] hover:bg-[#f5f0e8] disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((m) => (
              <li key={m.id}>
                <div
                  className={`max-w-[95%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-[#1e4f4f] text-white"
                      : "bg-[#ebe4d9] text-[#2d2926]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.role === "assistant" && m.suggestedAction ? (
                    <button
                      type="button"
                      onClick={() => confirmAction(m.suggestedAction!)}
                      className="mt-2 rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#163d3d]"
                    >
                      {m.suggestedAction.label}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
            {loading ? (
              <li className="text-xs text-[#6b635a]">Shari is thinking…</li>
            ) : null}
          </ul>
        )}
        {error ? (
          <p className="mt-2 text-xs font-medium text-[#a85c4a]">{error}</p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="border-t border-[#d4cdc3] p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask Shari for guidance…"
            disabled={loading}
            className="min-w-0 flex-1 rounded-lg border border-[#d4cdc3] px-3 py-2 text-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!draft.trim() || loading}
            className="shrink-0 rounded-lg bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

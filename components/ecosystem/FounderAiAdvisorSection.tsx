"use client";

import { FormEvent, useState } from "react";

import type {
  FounderAdvisorHistoryMessage,
  FounderAdvisorRecommendation,
  FounderAdvisorResponse,
} from "@/lib/ecosystem/founderAiAdvisor";
import type { BusinessEcosystemPeriod } from "@/lib/ecosystem/businessEcosystemDashboard";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { ActionChip, DASHBOARD, DashboardSection } from "./ecosystemDashboardUi";

const STARTER_QUESTIONS = [
  "What's my morning briefing?",
  "How are we doing?",
  "What content is scheduled?",
  "What failed?",
  "What performed best?",
  "How healthy is revenue?",
  "Which users need attention?",
];

type AdvisorMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  recommendations?: FounderAdvisorRecommendation[];
  nextStep?: string;
};

type FounderAiAdvisorSectionProps = {
  accessToken: string;
  period: BusinessEcosystemPeriod;
};

function RecommendationCard({ rec }: { rec: FounderAdvisorRecommendation }) {
  return (
    <li className="rounded-xl border border-[#e8e2d8] bg-white p-3 text-sm">
      <p className={`text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
        Priority {rec.priority}
      </p>
      <p className={`mt-1 font-medium ${DASHBOARD.body}`}>{rec.observation}</p>
      <p className={`mt-1 text-xs ${DASHBOARD.muted}`}>
        <span className="font-semibold">Why:</span> {rec.reason}
      </p>
      <p className={`mt-2 text-xs ${DASHBOARD.body}`}>
        <span className={`font-semibold ${DASHBOARD.heading}`}>Action:</span>{" "}
        {rec.suggestedAction}
      </p>
      <p className={`mt-1 text-xs ${DASHBOARD.gold}`}>
        <span className="font-semibold">Impact:</span> {rec.expectedImpact}
      </p>
    </li>
  );
}

export function FounderAiAdvisorSection({
  accessToken,
  period,
}: FounderAiAdvisorSectionProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(question: string) {
    if (!accessToken || !question.trim() || loading) return;
    setError(null);
    setLoading(true);

    const userMsg: AdvisorMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: question.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const history: FounderAdvisorHistoryMessage[] = messages
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.text }));

    try {
      const res = await fetch("/api/ecosystem/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
        },
        body: JSON.stringify({ message: question.trim(), period, history }),
      });
      const data = (await res.json()) as FounderAdvisorResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Advisor request failed.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: data.message,
          recommendations: data.recommendations,
          nextStep: data.nextStep,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach advisor.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <DashboardSection
      id="founder-ai-advisor"
      title="Founder AI Advisor"
      subtitle="Interprets ecosystem intelligence — aggregated data only, no user conversations"
      accent="gold"
    >
      <p className={`mb-3 text-xs ${DASHBOARD.muted}`}>
        Ask about business health, opportunities, risks, content, and retention. Every
        answer includes observation, reason, action, and expected impact.
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {STARTER_QUESTIONS.map((q) => (
          <ActionChip
            key={q}
            label={q}
            variant="outline"
            disabled={loading}
            onClick={() => void ask(q)}
          />
        ))}
      </div>

      {messages.length > 0 ? (
        <ul className="mb-3 max-h-80 space-y-3 overflow-y-auto">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-6 bg-[#1e4f4f]/10 text-[#1e4f4f]"
                  : "mr-6 border border-[#ebe4d9] bg-[#faf8f5] text-[#2d2926]"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.recommendations && m.recommendations.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {m.recommendations.map((rec, i) => (
                    <RecommendationCard key={`${m.id}-rec-${i}`} rec={rec} />
                  ))}
                </ul>
              ) : null}
              {m.nextStep ? (
                <p className={`mt-2 rounded-lg ${DASHBOARD.goldBg} px-2 py-1.5 text-xs ${DASHBOARD.gold}`}>
                  <span className="font-semibold">Next step:</span> {m.nextStep}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p className="mb-2 text-xs text-[#a85c4a]">{error}</p>
      ) : null}

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the advisor…"
          disabled={loading || !accessToken}
          className="min-w-0 flex-1 rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 text-sm text-[#2d2926] placeholder:text-[#9a9289] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !accessToken}
          className={`${DASHBOARD.tealBtn} shrink-0 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>
    </DashboardSection>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

import type { CrossSystemIntelligenceHub } from "@/lib/ecosystem/crossSystemIntelligenceHub";
import type { BusinessEcosystemPeriod } from "@/lib/ecosystem/businessEcosystemDashboard";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { ActionChip, DASHBOARD, DashboardSection } from "./ecosystemDashboardUi";

const FOUNDER_QUESTIONS = [
  "What should I work on next?",
  "What should we improve?",
  "What should we create?",
  "What is hurting growth?",
  "What is helping retention?",
];

type CrossSystemIntelligenceHubSectionProps = {
  accessToken: string;
  period: BusinessEcosystemPeriod;
  refreshToken?: number;
};

function statusColor(status: string): string {
  if (status === "live") return "text-[#1e4f4f] bg-[#1e4f4f]/10";
  if (status === "partial") return "text-[#7a5c00] bg-[#f5edd4]";
  if (status === "waiting") return "text-[#6b635a] bg-[#ebe4d9]";
  return "text-[#9a9289] bg-[#f3ede4]";
}

export function CrossSystemIntelligenceHubSection({
  accessToken,
  period,
  refreshToken = 0,
}: CrossSystemIntelligenceHubSectionProps) {
  const [hub, setHub] = useState<CrossSystemIntelligenceHub | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ecosystem/intelligence-hub?period=${period}`, {
        headers: { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken },
      });
      if (!res.ok) throw new Error("Could not load hub.");
      setHub((await res.json()) as CrossSystemIntelligenceHub);
      setAnswer(null);
      setActiveQuestion(null);
    } catch {
      setHub(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, period]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  async function askQuestion(question: string) {
    if (!accessToken) return;
    setActiveQuestion(question);
    setAnswer(null);
    try {
      const res = await fetch(
        `/api/ecosystem/intelligence-hub?period=${period}&question=${encodeURIComponent(question)}`,
        { headers: { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken } },
      );
      const data = (await res.json()) as { answer?: string; error?: string };
      setAnswer(data.answer ?? data.error ?? "No answer available.");
    } catch {
      setAnswer("Could not load answer.");
    }
  }

  return (
    <DashboardSection
      id="intelligence-hub"
      title="Cross-System Intelligence Hub"
      subtitle="Companion · GHL · PostCraft · Google — summarized insights only"
      accent="teal"
    >
      {loading ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>Unifying intelligence…</p>
      ) : !hub ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>Hub unavailable. Check access token.</p>
      ) : (
        <>
          <div className={`mb-3 flex flex-wrap gap-2 text-[10px] ${DASHBOARD.muted}`}>
            {hub.received.userIntelligence ? <span>User ✓</span> : null}
            {hub.received.productIntelligence ? <span>Product ✓</span> : null}
            {hub.received.contentIntelligence ? <span>Content ✓</span> : null}
            {hub.received.businessIntelligence ? <span>Business ✓</span> : null}
            {hub.received.revenueIntelligence ? <span>Revenue ✓</span> : null}
            {hub.received.retentionIntelligence ? <span>Retention ✓</span> : null}
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {hub.sources.map((s) => (
              <span
                key={s.source}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColor(s.status)}`}
                title={s.summary}
              >
                {s.label}: {s.status.replace("_", " ")}
              </span>
            ))}
          </div>

          {hub.recommendedActions[0] ? (
            <div className={`mb-4 rounded-xl border ${DASHBOARD.goldBorder} ${DASHBOARD.goldBg} p-3`}>
              <p className={`text-[10px] font-bold uppercase ${DASHBOARD.gold}`}>
                Top recommended action
              </p>
              <p className={`mt-1 text-sm font-medium ${DASHBOARD.body}`}>
                {hub.recommendedActions[0].action}
              </p>
              <p className={`mt-1 text-xs ${DASHBOARD.muted}`}>
                Impact: {hub.recommendedActions[0].impact}
              </p>
            </div>
          ) : null}

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {hub.categories.map((cat) => (
              <div
                key={cat.category}
                className="rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3"
              >
                <p className={`text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                  {cat.label}
                  {cat.insightCount > 0 ? ` · ${cat.insightCount} insights` : ""}
                </p>
                <p className={`mt-0.5 text-sm font-medium ${DASHBOARD.body}`}>{cat.headline}</p>
                <ul className={`mt-2 space-y-0.5 text-xs ${DASHBOARD.muted}`}>
                  {cat.highlights.slice(0, 3).map((h) => (
                    <li key={h}>· {h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {(hub.proactive.problems.length > 0 ||
            hub.proactive.opportunities.length > 0 ||
            hub.proactive.risks.length > 0) ? (
            <div className={`mb-4 grid gap-2 sm:grid-cols-3 text-xs`}>
              {hub.proactive.problems.length > 0 ? (
                <div className="rounded-lg border border-[#ebe4d9] bg-white p-2">
                  <p className={`font-bold ${DASHBOARD.heading}`}>Problems</p>
                  <ul className={`mt-1 ${DASHBOARD.muted}`}>
                    {hub.proactive.problems.slice(0, 2).map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {hub.proactive.opportunities.length > 0 ? (
                <div className="rounded-lg border border-[#ebe4d9] bg-white p-2">
                  <p className={`font-bold ${DASHBOARD.heading}`}>Opportunities</p>
                  <ul className={`mt-1 ${DASHBOARD.muted}`}>
                    {hub.proactive.opportunities.slice(0, 2).map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {hub.proactive.risks.length > 0 ? (
                <div className="rounded-lg border border-[#ebe4d9] bg-white p-2">
                  <p className={`font-bold ${DASHBOARD.heading}`}>Risks</p>
                  <ul className={`mt-1 ${DASHBOARD.muted}`}>
                    {hub.proactive.risks.slice(0, 2).map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {hub.insights.length > 0 ? (
            <div className="mb-4">
              <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                Proactive insights
              </p>
              <ul className="space-y-2">
                {hub.insights.slice(0, 4).map((insight) => (
                  <li
                    key={insight.id}
                    className="rounded-xl border border-[#e8e2d8] bg-white p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
                        {insight.type.replace("_", " ")}
                      </span>
                      <span className={`text-[10px] ${DASHBOARD.muted}`}>
                        {insight.sources.join(" · ")}
                      </span>
                    </div>
                    <p className={`mt-1 font-medium ${DASHBOARD.body}`}>{insight.title}</p>
                    <p className={`mt-0.5 text-xs ${DASHBOARD.muted}`}>{insight.summary}</p>
                    <p className={`mt-1 text-xs ${DASHBOARD.body}`}>
                      <span className="font-semibold">Action:</span> {insight.suggestedAction}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hub.correlations.length > 0 ? (
            <div className={`mb-4 rounded-xl ${DASHBOARD.goldBg} p-3`}>
              <p className={`text-[10px] font-bold uppercase ${DASHBOARD.gold}`}>
                Cross-system correlations
              </p>
              <ul className={`mt-1 space-y-1 text-xs ${DASHBOARD.body}`}>
                {hub.correlations.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className={`mb-2 text-[10px] font-bold uppercase ${DASHBOARD.heading}`}>
            Ask the hub
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {FOUNDER_QUESTIONS.map((q) => (
              <ActionChip
                key={q}
                label={q}
                variant={activeQuestion === q ? "teal" : "outline"}
                onClick={() => void askQuestion(q)}
              />
            ))}
          </div>
          {answer ? (
            <p className={`rounded-xl border border-[#d4cdc3] bg-white p-3 text-sm ${DASHBOARD.body}`}>
              {answer}
            </p>
          ) : null}

          <p className={`mt-3 text-[10px] ${DASHBOARD.muted}`}>
            Summarized intelligence only · no conversation content stored or displayed
          </p>
        </>
      )}
    </DashboardSection>
  );
}

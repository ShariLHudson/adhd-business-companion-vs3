"use client";

import { useCallback, useMemo, useState } from "react";

import { composeResearchSession } from "@/lib/founder/researchCenter";
import { getResearchCenterBootstrap } from "@/lib/founder/researchCenter/services/researchCenterService";
import type { ResearchSessionView } from "@/lib/research/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { ResearchAlertsPanel } from "./research/ResearchAlertsPanel";
import { ResearchPrepOffers } from "./research/ResearchPrepOffers";
import { ResearchReportView } from "./research/ResearchReportView";
import { ResearchSearchZone } from "./research/ResearchSearchZone";

export function FounderExecutiveResearch() {
  const bootstrap = useMemo(() => getResearchCenterBootstrap(), []);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<ResearchSessionView | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const runResearch = useCallback((phrase: string) => {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    const result = composeResearchSession(trimmed);
    if (!result) {
      setStatus("That finding didn’t pass the So What? test — try a more specific question.");
      setSession(null);
      return;
    }
    setStatus(null);
    setSession(result);
    setQuery(trimmed);
  }, []);

  return (
    <div className="founder-research">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Research Center"
        title="Your Private Executive Research Department"
        question="What does Shari actually need to know?"
        purpose="Answer, evidence, Spark application, and prepared next steps — not another search engine."
      />

      {!session ? (
        <>
          <ResearchSearchZone
            query={query}
            onQueryChange={setQuery}
            onSubmit={() => runResearch(query)}
            suggestedQueries={bootstrap.suggestedQueries}
            onSelectSuggested={runResearch}
          />

          <ResearchAlertsPanel alerts={bootstrap.significantAlerts} />

          <section className="founder-research__categories" aria-labelledby="research-categories-title">
            <h2 className="founder-research__section-title" id="research-categories-title">
              Research categories
            </h2>
            <ul className="founder-research__category-grid">
              {bootstrap.categories.map((cat) => (
                <li key={cat.id} className="founder-research__category-card">
                  <span className="founder-research__category-label">{cat.label}</span>
                  <span className="founder-research__category-desc">{cat.description}</span>
                </li>
              ))}
            </ul>
          </section>

          {status ? <p className="founder-research__status" role="status">{status}</p> : null}
        </>
      ) : (
        <>
          <ResearchReportView report={session.report} onClose={() => setSession(null)} />
          <ResearchPrepOffers offers={session.report.prepOffers} />
        </>
      )}
    </div>
  );
}

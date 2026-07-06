import type { ReactNode } from "react";

import type { BusinessOpportunity } from "@/lib/opportunities/types";

import { ExecutivePanel } from "../executive";
import { OpportunityPrepOffers } from "./OpportunityPrepOffers";

type OpportunityDetailViewProps = {
  opportunity: BusinessOpportunity;
  onClose: () => void;
};

function Panel({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

const REC_LABEL: Record<BusinessOpportunity["recommendation"], string> = {
  build: "Build",
  prototype: "Prototype",
  "research-further": "Research further",
  watch: "Watch",
  ignore: "Ignore",
  delay: "Delay",
  partner: "Partner",
  automate: "Automate",
};

export function OpportunityDetailView({ opportunity, onClose }: OpportunityDetailViewProps) {
  return (
    <article className="founder-opportunity__detail">
      <button type="button" className="founder-opportunity__back" onClick={onClose}>
        ← All opportunities
      </button>

      <header className="founder-opportunity__detail-header">
        <p className="founder-opportunity__detail-meta">
          {opportunity.typeLabel} · Confidence: {opportunity.confidence} · Impact: {opportunity.potentialImpact}
        </p>
        <h2 className="founder-opportunity__detail-name">{opportunity.name}</h2>
      </header>

      <div className="founder-opportunity__recommendation-block">
        <p className="founder-opportunity__rec-label">Founder recommends</p>
        <p className="founder-opportunity__rec-value">
          <span className={`founder-opportunity__rec founder-opportunity__rec--${opportunity.recommendation}`}>
            {REC_LABEL[opportunity.recommendation]}
          </span>
          — {opportunity.recommendationRationale}
        </p>
      </div>

      <Panel title="Executive summary" defaultOpen>
        <p className="founder-opportunity__prose">{opportunity.executiveSummary}</p>
        <p className="founder-opportunity__prose">
          <strong>Why this opportunity exists:</strong> {opportunity.whyExists}
        </p>
      </Panel>

      <Panel title="Why now?" defaultOpen>
        <p className="founder-opportunity__prose"><strong>Why now?</strong> {opportunity.whyNow.whyNow}</p>
        <p className="founder-opportunity__prose"><strong>Why not six months ago?</strong> {opportunity.whyNow.whyNotSixMonthsAgo}</p>
        <p className="founder-opportunity__prose"><strong>What changed?</strong> {opportunity.whyNow.whatChanged}</p>
        <p className="founder-opportunity__prose"><strong>Evidence:</strong> {opportunity.whyNow.evidenceSummary}</p>
      </Panel>

      <Panel title="So what? — Why Spark should care" defaultOpen>
        <p className="founder-opportunity__prose">{opportunity.soWhat.whySparkShouldCare}</p>
        <p className="founder-opportunity__prose"><strong>Why members care:</strong> {opportunity.soWhat.whyMembersShouldCare}</p>
        <ul className="founder-opportunity__bullets">
          {opportunity.soWhat.ecosystemImpact.map((item) => (
            <li key={item.target}>
              <strong>{item.target}:</strong> {item.summary}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Supporting evidence">
        <ul className="founder-opportunity__bullets">
          {opportunity.evidence.map((ev) => (
            <li key={ev.id}>
              <strong>{ev.title}</strong> ({ev.kind}) — {ev.summary}
            </li>
          ))}
        </ul>
        <p className="founder-opportunity__muted">{opportunity.confidenceRationale}</p>
      </Panel>

      <Panel title="Estimates">
        <ul className="founder-opportunity__metrics-grid">
          <li>Effort: {opportunity.estimatedEffort}</li>
          <li>Time: ~{opportunity.estimatedTimeWeeks} weeks</li>
          <li>Revenue: {opportunity.estimatedRevenue}</li>
          <li>Member impact: {opportunity.estimatedMemberImpact}</li>
          <li>Strategic importance: {opportunity.strategicImportance}</li>
          <li>Automation potential: {opportunity.automationPotential}</li>
        </ul>
      </Panel>

      <Panel title="If you ignore this">
        <p className="founder-opportunity__prose">{opportunity.ifIgnored}</p>
      </Panel>

      {opportunity.boardPerspectives && opportunity.boardRecommendation ? (
        <Panel title="Executive board summary">
          <ul className="founder-opportunity__bullets">
            {opportunity.boardPerspectives.map((p) => (
              <li key={p.id}>
                <strong>{p.label}:</strong> {p.summary} — <em>{p.stance}</em>
              </li>
            ))}
          </ul>
          <p className="founder-opportunity__prose">
            <strong>Founder recommends:</strong> {opportunity.boardRecommendation}
          </p>
        </Panel>
      ) : null}

      <Panel title="Outside the box">
        <p className="founder-opportunity__subhead">Unexpected applications</p>
        <ul className="founder-opportunity__bullets">
          {opportunity.outsideTheBox.unexpectedApplications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="founder-opportunity__subhead">Questions worth exploring</p>
        <ul className="founder-opportunity__bullets">
          {opportunity.outsideTheBox.questionsWorthExploring.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Related work">
        <p className="founder-opportunity__subhead">Missions</p>
        <p className="founder-opportunity__prose">{opportunity.relatedMissions.join(" · ")}</p>
        <p className="founder-opportunity__subhead">Products</p>
        <p className="founder-opportunity__prose">{opportunity.relatedProducts.join(" · ")}</p>
        {opportunity.relatedResearch.length > 0 ? (
          <>
            <p className="founder-opportunity__subhead">Research</p>
            <p className="founder-opportunity__prose">{opportunity.relatedResearch.join(" · ")}</p>
          </>
        ) : null}
      </Panel>

      <OpportunityPrepOffers offers={opportunity.prepOffers} />
    </article>
  );
}

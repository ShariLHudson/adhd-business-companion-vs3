"use client";

import type { ReactNode } from "react";

import type { DiscoveryFindingDetailView } from "@/lib/executiveDiscoveryEngine/types";

import { ExecutivePanel } from "../executive";

type FindingDetailPanelProps = {
  view: DiscoveryFindingDetailView;
  onBack: () => void;
};

function Panel({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

export function FindingDetailPanel({ view, onBack }: FindingDetailPanelProps) {
  const { finding, founderAlert } = view;
  const rec = finding.executiveRecommendation;

  return (
    <article className="founder-discovery-engine__detail">
      <button type="button" className="founder-discovery-engine__back" onClick={onBack}>
        ← Back to brief
      </button>

      <header className="founder-discovery-engine__header">
        <p className="founder-discovery-engine__meta">{finding.category.replace(/-/g, " ")}</p>
        <h2 className="founder-discovery-engine__title">{finding.headline}</h2>
        <p className="founder-discovery-engine__prose">{finding.summary}</p>
      </header>

      {founderAlert ? (
        <section className="founder-discovery-engine__alert-detail">
          <h3 className="founder-discovery-engine__section-title">Founder Alert</h3>
          <span className="founder-discovery-engine__urgency">{founderAlert.urgency}</span>
          <p className="founder-discovery-engine__prose"><strong>{founderAlert.title}</strong></p>
          <ul className="founder-discovery-engine__metrics">
            <li><strong>Business impact:</strong> {founderAlert.businessImpact}</li>
            <li><strong>Member impact:</strong> {founderAlert.memberImpact}</li>
            <li><strong>Revenue impact:</strong> {founderAlert.revenueImpact}</li>
            <li><strong>Time savings:</strong> {founderAlert.timeSavings}</li>
          </ul>
          <p className="founder-discovery-engine__prose">{founderAlert.suggestedImplementation}</p>
        </section>
      ) : null}

      <Panel title="The Shari Rule — why care?" defaultOpen>
        <ul className="founder-discovery-engine__metrics">
          <li><strong>Why important:</strong> {finding.whyImportant}</li>
          <li><strong>Why today:</strong> {finding.whyToday}</li>
          <li><strong>Why not six months ago:</strong> {finding.whyNotSixMonthsAgo}</li>
          <li><strong>Helps you:</strong> {finding.helpsShari}</li>
          <li><strong>Helps Spark:</strong> {finding.helpsSpark}</li>
          <li><strong>Helps members:</strong> {finding.helpsMembers}</li>
          <li><strong>If we ignore it:</strong> {finding.ifIgnored}</li>
          <li><strong>Confidence:</strong> {finding.confidence}</li>
        </ul>
        <p className="founder-discovery-engine__subhead">Evidence</p>
        <ul className="founder-discovery-engine__bullets">
          {finding.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <p className="founder-discovery-engine__subhead">Sources analyzed</p>
        <ul className="founder-discovery-engine__bullets">
          {finding.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Discovery pathways">
        <ul className="founder-discovery-engine__metrics">
          <li><strong>Missions:</strong> {finding.pathways.missions.join(", ") || "—"}</li>
          <li><strong>Products:</strong> {finding.pathways.products.join(", ") || "—"}</li>
          <li><strong>Research:</strong> {finding.pathways.research.join(", ") || "—"}</li>
          <li><strong>Decisions:</strong> {finding.pathways.decisions.join(", ") || "—"}</li>
          <li><strong>Marketing:</strong> {finding.pathways.marketing.join(", ") || "—"}</li>
          <li><strong>Playbooks:</strong> {finding.pathways.playbooks.join(", ") || "—"}</li>
          <li><strong>Lessons:</strong> {finding.pathways.lessons.join(", ") || "—"}</li>
        </ul>
      </Panel>

      <Panel title="Executive board review">
        <ul className="founder-discovery-engine__board">
          {finding.boardPerspectives.map((b) => (
            <li key={b.id}>
              <strong>{b.label}</strong>
              <p className="founder-discovery-engine__prose">{b.insight}</p>
              <p className="founder-discovery-engine__muted">Opportunity: {b.opportunity} · Concern: {b.concern}</p>
            </li>
          ))}
        </ul>
        <ul className="founder-discovery-engine__metrics">
          <li><strong>Most important:</strong> {finding.boardSummary.mostImportantInsight}</li>
          <li><strong>Strongest opportunity:</strong> {finding.boardSummary.strongestOpportunity}</li>
          <li><strong>Greatest concern:</strong> {finding.boardSummary.greatestConcern}</li>
          <li><strong>Recommended:</strong> {finding.boardSummary.recommendedAction}</li>
        </ul>
      </Panel>

      <Panel title="My recommendation" defaultOpen>
        <p className="founder-discovery-engine__prose"><strong>{rec.myRecommendation}</strong></p>
        <p className="founder-discovery-engine__subhead">Alternative options</p>
        <ul className="founder-discovery-engine__bullets">
          {rec.alternativeOptions.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <p className="founder-discovery-engine__prose"><strong>Tradeoffs:</strong> {rec.tradeoffs}</p>
        <p className="founder-discovery-engine__prose"><strong>Implementation:</strong> {rec.implementationIdeas}</p>
        <p className="founder-discovery-engine__subhead">Prepared next steps</p>
        <ul className="founder-discovery-engine__bullets">
          {rec.preparedNextSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="founder-discovery-engine__muted">{finding.learningNote}</p>
      </Panel>

      <ExecutivePanel title="Prepared outputs — drafts only" subtitle="Nothing executes until you approve" defaultOpen>
        <ul className="founder-discovery-engine__prep-list">
          {finding.prepOffers.map((offer) => (
            <li key={offer.id} className="founder-discovery-engine__prep-item">
              <span className="founder-discovery-engine__prep-label">{offer.label}</span>
              <span className="founder-discovery-engine__prep-desc">{offer.description}</span>
              <span className="founder-discovery-engine__prep-status">{offer.status}</span>
            </li>
          ))}
        </ul>
      </ExecutivePanel>
    </article>
  );
}

"use client";

import type { ReactNode } from "react";

import type { DiscoveryDetailView } from "@/lib/executiveRelationshipIntelligence/types";

import { ExecutivePanel } from "../executive";

type DiscoveryDetailPanelProps = {
  view: DiscoveryDetailView;
  onBack: () => void;
};

function Panel({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

export function DiscoveryDetailPanel({ view, onBack }: DiscoveryDetailPanelProps) {
  const { discovery, founderAlert } = view;

  return (
    <article className="founder-relationship-intel__detail">
      <button type="button" className="founder-relationship-intel__back" onClick={onBack}>
        ← Back to discoveries
      </button>

      <header className="founder-relationship-intel__header">
        <p className="founder-relationship-intel__meta">{discovery.nobodyAskedOpener}</p>
        <h2 className="founder-relationship-intel__title">{discovery.headline}</h2>
        <p className="founder-relationship-intel__prose">{discovery.summary}</p>
      </header>

      {founderAlert ? (
        <section className="founder-relationship-intel__alert-detail">
          <h3 className="founder-relationship-intel__section-title">Founder Alert</h3>
          <p className="founder-relationship-intel__prose"><strong>{founderAlert.title}</strong></p>
          <ul className="founder-relationship-intel__metrics">
            <li><strong>Urgency:</strong> {founderAlert.urgency}</li>
            <li><strong>Business impact:</strong> {founderAlert.businessImpact}</li>
            <li><strong>Member impact:</strong> {founderAlert.memberImpact}</li>
            <li><strong>Revenue impact:</strong> {founderAlert.revenueImpact}</li>
            <li><strong>Time savings:</strong> {founderAlert.timeSavings}</li>
          </ul>
          <p className="founder-relationship-intel__prose">{founderAlert.suggestedImplementation}</p>
        </section>
      ) : null}

      <Panel title="Why this matters" defaultOpen>
        <ul className="founder-relationship-intel__metrics">
          <li><strong>Why you should care:</strong> {discovery.whyShariShouldCare}</li>
          <li><strong>Why now:</strong> {discovery.whyNow}</li>
          <li><strong>Opportunity:</strong> {discovery.opportunity}</li>
          <li><strong>Risk:</strong> {discovery.risk}</li>
          <li><strong>Confidence:</strong> {discovery.confidence}</li>
        </ul>
        <p className="founder-relationship-intel__subhead">Evidence</p>
        <ul className="founder-relationship-intel__bullets">
          {discovery.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        {discovery.remindsMeOf ? (
          <p className="founder-relationship-intel__prose"><strong>This reminds me of…</strong> {discovery.remindsMeOf}</p>
        ) : null}
      </Panel>

      {discovery.butterflyChain ? (
        <Panel title="Butterfly Connections" defaultOpen>
          <ol className="founder-relationship-intel__butterfly">
            {discovery.butterflyChain.map((step) => (
              <li key={step.id}>
                <strong>{step.label}</strong> — {step.summary}
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}

      <Panel title="Executive board review">
        <ul className="founder-relationship-intel__board">
          {discovery.boardPerspectives.map((b) => (
            <li key={b.id}>
              <strong>{b.label}</strong>
              <p className="founder-relationship-intel__prose">{b.insight}</p>
              <p className="founder-relationship-intel__muted">Opportunity: {b.opportunity} · Concern: {b.concern}</p>
            </li>
          ))}
        </ul>
        <ul className="founder-relationship-intel__metrics">
          <li><strong>Most important:</strong> {discovery.boardSummary.mostImportantInsight}</li>
          <li><strong>Strongest opportunity:</strong> {discovery.boardSummary.strongestOpportunity}</li>
          <li><strong>Greatest concern:</strong> {discovery.boardSummary.greatestConcern}</li>
          <li><strong>Recommended:</strong> {discovery.boardSummary.recommendedAction}</li>
        </ul>
      </Panel>

      <Panel title="Spark ecosystem impact">
        <ul className="founder-relationship-intel__bullets">
          {discovery.ecosystemImpact.map((e) => (
            <li key={e.area}>
              <strong>{e.area}</strong> ({e.direction}) — {e.summary}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Recommended action" defaultOpen>
        <p className="founder-relationship-intel__prose">
          <strong>{discovery.recommendedAction.replace(/-/g, " ")}</strong> — {discovery.recommendedActionWhy}
        </p>
        <p className="founder-relationship-intel__muted">{discovery.learningNote}</p>
      </Panel>

      <ExecutivePanel title="Prepared outputs — drafts only" subtitle="Nothing executes until you approve" defaultOpen>
        <ul className="founder-relationship-intel__prep-list">
          {discovery.prepOffers.map((offer) => (
            <li key={offer.id} className="founder-relationship-intel__prep-item">
              <span className="founder-relationship-intel__prep-label">{offer.label}</span>
              <span className="founder-relationship-intel__prep-desc">{offer.description}</span>
              <span className="founder-relationship-intel__prep-status">{offer.status}</span>
            </li>
          ))}
        </ul>
      </ExecutivePanel>
    </article>
  );
}

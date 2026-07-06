"use client";

import type { ReactNode } from "react";

import type { JudgmentDetailView } from "@/lib/executiveJudgmentEngine/types";

import { ExecutivePanel } from "../executive";

type JudgmentDetailPanelProps = {
  view: JudgmentDetailView;
  onBack: () => void;
};

function Panel({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

export function JudgmentDetailPanel({ view, onBack }: JudgmentDetailPanelProps) {
  const { recommendation: rec } = view;

  return (
    <article className="founder-judgment__detail">
      <button type="button" className="founder-judgment__back" onClick={onBack}>
        ← Back to pyramid
      </button>

      <header className="founder-judgment__header">
        <p className="founder-judgment__meta">Composite score {rec.compositeScore}</p>
        <h2 className="founder-judgment__title">{rec.headline}</h2>
        <p className="founder-judgment__prose">{rec.summary}</p>
      </header>

      <Panel title="The Shari Rule" defaultOpen>
        <ul className="founder-judgment__metrics">
          <li><strong>Why this?</strong> {rec.whyThis}</li>
          <li><strong>Why now?</strong> {rec.whyNow}</li>
          <li><strong>Why not the others?</strong> {rec.whyNotOthers}</li>
          <li><strong>If we ignore this?</strong> {rec.ifIgnored}</li>
          <li><strong>What would change your mind?</strong> {rec.whatWouldChange}</li>
        </ul>
      </Panel>

      {rec.discipline ? (
        <section className="founder-judgment__discipline">
          <h3 className="founder-judgment__section-title">Executive Discipline — {rec.discipline.kind}</h3>
          <p className="founder-judgment__prose"><strong>{rec.discipline.title}</strong></p>
          <p className="founder-judgment__prose">{rec.discipline.summary}</p>
          <p className="founder-judgment__muted">{rec.discipline.why}</p>
        </section>
      ) : null}

      <Panel title="Executive Filter — every score explained" defaultOpen>
        <ul className="founder-judgment__score-list">
          {rec.scores.map((s) => (
            <li key={s.dimension}>
              <strong>{s.label} ({s.score})</strong> — {s.explanation}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Executive Scorecard">
        <ul className="founder-judgment__metrics">
          {rec.scorecard.map((entry) => (
            <li key={entry.dimension}>
              <strong>{entry.label} ({entry.rating})</strong> — {entry.summary}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Executive Reasoning">
        <p className="founder-judgment__subhead">Evidence</p>
        <ul className="founder-judgment__bullets">
          {rec.reasoning.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <p className="founder-judgment__subhead">Assumptions</p>
        <ul className="founder-judgment__bullets">
          {rec.reasoning.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="founder-judgment__prose"><strong>Tradeoffs:</strong> {rec.reasoning.tradeoffs}</p>
        <p className="founder-judgment__subhead">Alternatives</p>
        <ul className="founder-judgment__bullets">
          {rec.reasoning.alternatives.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="founder-judgment__prose"><strong>Risks:</strong> {rec.reasoning.risks.join(" · ")}</p>
        <p className="founder-judgment__prose"><strong>Confidence:</strong> {rec.reasoning.confidence}</p>
      </Panel>

      <Panel title="The Shari Lens">
        <ul className="founder-judgment__metrics">
          <li><strong>Energy:</strong> {rec.shariLens.currentEnergy}</li>
          <li><strong>Mission:</strong> {rec.shariLens.currentMission}</li>
          <li><strong>Workload:</strong> {rec.shariLens.currentWorkload}</li>
          <li><strong>Priorities:</strong> {rec.shariLens.currentPriorities}</li>
          <li><strong>Vision:</strong> {rec.shariLens.longTermVision}</li>
          <li><strong>Strengths:</strong> {rec.shariLens.personalStrengths}</li>
          <li><strong>Season:</strong> {rec.shariLens.businessSeason}</li>
        </ul>
        <p className="founder-judgment__prose"><strong>Fit:</strong> {rec.shariLens.fitSummary}</p>
      </Panel>

      <ExecutivePanel title="Prepared outputs — drafts only" subtitle="Nothing executes until you approve" defaultOpen>
        <ul className="founder-judgment__prep-list">
          {rec.prepOffers.map((offer) => (
            <li key={offer.id} className="founder-judgment__prep-item">
              <span className="founder-judgment__prep-label">{offer.label}</span>
              <span className="founder-judgment__prep-desc">{offer.description}</span>
              <span className="founder-judgment__prep-status">{offer.status}</span>
            </li>
          ))}
        </ul>
        <p className="founder-judgment__muted">{rec.learningNote}</p>
      </ExecutivePanel>
    </article>
  );
}

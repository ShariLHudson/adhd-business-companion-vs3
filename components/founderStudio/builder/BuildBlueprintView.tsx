import type { ReactNode } from "react";

import type { BuildBlueprint } from "@/lib/executiveBuilder/types";

import { ExecutivePanel } from "../executive";

type BuildBlueprintViewProps = {
  blueprint: BuildBlueprint;
  onClose: () => void;
};

function Panel({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

export function BuildBlueprintView({ blueprint, onClose }: BuildBlueprintViewProps) {
  return (
    <article className="founder-builder__blueprint">
      <button type="button" className="founder-builder__back" onClick={onClose}>
        ← New build
      </button>

      <header className="founder-builder__header">
        <p className="founder-builder__meta">
          {blueprint.buildMode.replace(/-/g, " ")} · {blueprint.estimatedTimeWeeks} weeks · Impact: {blueprint.estimatedImpact}
        </p>
        <h2 className="founder-builder__title">{blueprint.title}</h2>
        <p className="founder-builder__recommendation">
          <strong>Founder recommends:</strong> {blueprint.founderRecommendation}
        </p>
      </header>

      <Panel title="Executive summary" defaultOpen>
        <p className="founder-builder__prose">{blueprint.executiveSummary}</p>
        <ul className="founder-builder__grid-metrics">
          <li><strong>Business goal:</strong> {blueprint.businessGoal}</li>
          <li><strong>Customer problem:</strong> {blueprint.customerProblem}</li>
          <li><strong>Desired outcome:</strong> {blueprint.desiredOutcome}</li>
          <li><strong>Mission alignment:</strong> {blueprint.missionAlignment}</li>
          <li><strong>Revenue:</strong> {blueprint.estimatedRevenue}</li>
          <li><strong>Difficulty:</strong> {blueprint.estimatedDifficulty}</li>
        </ul>
      </Panel>

      <Panel title="Why this approach" defaultOpen>
        <p className="founder-builder__prose"><strong>Purpose:</strong> {blueprint.purpose}</p>
        <p className="founder-builder__prose"><strong>Why now:</strong> {blueprint.whyNow}</p>
        <p className="founder-builder__prose"><strong>Business value:</strong> {blueprint.businessValue}</p>
        <p className="founder-builder__prose"><strong>Customer value:</strong> {blueprint.customerValue}</p>
        <p className="founder-builder__prose"><strong>Founder value:</strong> {blueprint.founderValue}</p>
        <p className="founder-builder__prose"><strong>What can wait:</strong> {blueprint.whatCanWait.join(" · ")}</p>
        <p className="founder-builder__prose"><strong>Founder prepares next:</strong> {blueprint.whatFounderPreparesNext}</p>
      </Panel>

      <Panel title="Three implementation options" defaultOpen>
        <ul className="founder-builder__options">
          {blueprint.implementationOptions.map((opt) => (
            <li key={opt.id} className={opt.recommended ? "founder-builder__option--rec" : undefined}>
              <p className="founder-builder__option-label">
                {opt.label}
                {opt.recommended ? " (Recommended)" : ""}
              </p>
              <p className="founder-builder__prose">{opt.summary}</p>
              <p className="founder-builder__muted">~{opt.estimatedWeeks} weeks · Trade-offs: {opt.tradeoffs.join("; ")}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Automatic build plan">
        <ol className="founder-builder__phases">
          {blueprint.phases.map((phase) => (
            <li key={phase.id}>
              <strong>{phase.label}</strong> — {phase.summary}
              <span className="founder-builder__draft-badge">{phase.status}</span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Executive work packets" defaultOpen>
        <ul className="founder-builder__packets">
          {blueprint.workPackets.map((pkt) => (
            <li key={pkt.id} className="founder-builder__packet">
              <p className="founder-builder__packet-objective">{pkt.objective}</p>
              <p className="founder-builder__prose">{pkt.whyItMatters}</p>
              <p className="founder-builder__muted">
                {pkt.estimatedTime} · Impact: {pkt.estimatedImpact}
                {pkt.readyForCursor ? " · Ready for Cursor" : ""}
                {pkt.approvalRequired ? " · Approval required" : ""}
              </p>
              <ol className="founder-builder__steps">
                {pkt.implementationSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Executive questions answered">
        <ul className="founder-builder__questions">
          {blueprint.executiveQuestions.map((eq) => (
            <li key={eq.id}>
              <strong>{eq.question}</strong> {eq.answer}
            </li>
          ))}
        </ul>
      </Panel>

      {blueprint.boardPerspectives && blueprint.boardSummary ? (
        <Panel title="Executive board review">
          <ul className="founder-builder__bullets">
            {blueprint.boardPerspectives.map((p) => (
              <li key={p.id}>
                <strong>{p.label}:</strong> {p.summary} — <em>{p.concern}</em>
              </li>
            ))}
          </ul>
          <p className="founder-builder__prose"><strong>Summary:</strong> {blueprint.boardSummary}</p>
        </Panel>
      ) : null}

      <Panel title="Risks, milestones & ROI">
        <p className="founder-builder__subhead">Risks</p>
        <ul className="founder-builder__bullets">
          {blueprint.potentialRisks.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="founder-builder__subhead">Milestones</p>
        <ul className="founder-builder__bullets">
          {blueprint.milestones.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p className="founder-builder__prose"><strong>ROI:</strong> {blueprint.roiSummary}</p>
      </Panel>

      <Panel title="Executive leverage">
        <ul className="founder-builder__grid-metrics">
          <li>Founder hours saved: ~{blueprint.leverage.founderHoursSaved}h</li>
          <li>Research saved: {blueprint.leverage.researchSaved}</li>
          <li>Planning saved: {blueprint.leverage.planningSaved}</li>
          <li>Strategic value: {blueprint.leverage.strategicValue}</li>
        </ul>
      </Panel>

      <ExecutivePanel title="Prepared outputs — drafts only" subtitle="Nothing executes until you approve" defaultOpen>
        <ul className="founder-builder__prep-list">
          {blueprint.prepOutputs.map((out) => (
            <li key={out.id} className="founder-builder__prep-item">
              <span className="founder-builder__prep-label">{out.label}</span>
              <span className="founder-builder__prep-desc">{out.description}</span>
              <span className="founder-builder__prep-status">{out.status}</span>
            </li>
          ))}
        </ul>
      </ExecutivePanel>
    </article>
  );
}

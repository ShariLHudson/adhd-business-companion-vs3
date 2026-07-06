"use client";

import type { FounderDecision } from "@/lib/founder/memory/types";

type DecisionVaultCardProps = {
  decision: FounderDecision;
  expanded: boolean;
  onToggle: () => void;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status: FounderDecision["status"]): string {
  if (status === "pending-review") return "Pending Review";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function DecisionVaultCard({
  decision,
  expanded,
  onToggle,
}: DecisionVaultCardProps) {
  return (
    <article
      className={`decision-vault-card${expanded ? " decision-vault-card--expanded" : ""}`}
    >
      <header className="decision-vault-card__header">
        <div>
          <span className="decision-vault-card__category">{decision.category}</span>
          <h3 className="decision-vault-card__title">{decision.title}</h3>
          <p className="decision-vault-card__date">{formatWhen(decision.decidedAt)}</p>
        </div>
        <span
          className={`decision-vault-card__status decision-vault-card__status--${decision.status}`}
        >
          {statusLabel(decision.status)}
        </span>
      </header>

      <p className="decision-vault-card__reason">{decision.reason}</p>
      <p className="decision-vault-card__final">
        <strong>Decision:</strong> {decision.finalDecision}
      </p>

      {expanded ? (
        <div className="decision-vault-card__detail">
          <div className="decision-vault-card__block">
            <h4>Supporting Evidence</h4>
            <ul>
              {decision.supportingEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="decision-vault-card__block">
            <h4>Alternatives Considered</h4>
            <ul>
              {decision.alternativesConsidered.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="decision-vault-card__block">
            <h4>Expected Outcome</h4>
            <p>{decision.expectedOutcome}</p>
          </div>
          {decision.actualOutcome ? (
            <div className="decision-vault-card__block">
              <h4>Actual Outcome</h4>
              <p>{decision.actualOutcome}</p>
            </div>
          ) : null}
          <div className="decision-vault-card__links">
            <h4>Linked</h4>
            <div className="decision-vault-card__link-groups">
              {(
                [
                  ["Products", decision.related.products],
                  ["Research", decision.related.research],
                  ["Projects", decision.related.projects],
                  ["Reports", decision.related.reports],
                  ["People", decision.related.people],
                  ["Timeline", decision.related.timeline],
                  ["Memory", decision.related.memories],
                ] as const
              ).map(([label, refs]) =>
                refs.length > 0 ? (
                  <div key={label} className="decision-vault-card__link-group">
                    <span>{label}</span>
                    <ul>
                      {refs.map((r) => (
                        <li key={`${r.kind}-${r.id}`}>{r.label}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="decision-vault-card__toggle"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {expanded ? "Close record" : "Open full record"}
      </button>
    </article>
  );
}

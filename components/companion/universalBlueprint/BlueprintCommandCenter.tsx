"use client";

import { buildBlueprintCommandCenter } from "@/lib/universalBlueprintInterface";

type Props = { blueprintId: string };

/**
 * 106 — Lightweight Command Center. Not a dashboard.
 */
export function BlueprintCommandCenter({ blueprintId }: Props) {
  const model = buildBlueprintCommandCenter(blueprintId);

  return (
    <section
      className="bp-exp-panel bp-command-center"
      data-testid="blueprint-command-center"
    >
      <p className="bp-exp-eyebrow">Command Center</p>
      <h3 className="bp-exp-title">Understand this Blueprint</h3>
      <dl className="bp-cc-grid">
        <div>
          <dt>Purpose</dt>
          <dd>{model.purpose}</dd>
        </div>
        <div>
          <dt>Current Work</dt>
          <dd>{model.currentWorkLabel}</dd>
        </div>
        <div>
          <dt>Recent Changes</dt>
          <dd>
            <ul>
              {model.recentChanges.map((line, index) => (
                <li key={`${index}-${line.slice(0, 24)}`}>{line}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Connections</dt>
          <dd>{model.connectionsLabel}</dd>
        </div>
        <div>
          <dt>Business Goal Supported</dt>
          <dd>{model.businessGoalSupported}</dd>
        </div>
        <div>
          <dt>Health Summary</dt>
          <dd>{model.healthSummary}</dd>
        </div>
        <div>
          <dt>Suggested Improvement</dt>
          <dd data-testid="bp-cc-improvement">{model.suggestedImprovement}</dd>
        </div>
        <div>
          <dt>Next Helpful Step</dt>
          <dd data-testid="bp-cc-next">{model.nextHelpfulStep}</dd>
        </div>
      </dl>
    </section>
  );
}

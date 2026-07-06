"use client";

import type { ExecutiveScenario, ExecutiveSimulation, ScenarioComparisonRow } from "@/lib/executiveSimulation/types";

type SimulationComparisonViewProps = {
  simulation: ExecutiveSimulation;
  comparisonRows: ScenarioComparisonRow[];
  onSelectScenario: (scenarioId: string) => void;
  onClose: () => void;
};

export function SimulationComparisonView({
  simulation,
  comparisonRows,
  onSelectScenario,
  onClose,
}: SimulationComparisonViewProps) {
  const recommendedId = simulation.ifIWereYou.recommendedScenarioId;

  return (
    <article className="founder-simulation__comparison">
      <button type="button" className="founder-simulation__back" onClick={onClose}>
        ← New decision
      </button>

      <header className="founder-simulation__header">
        <p className="founder-simulation__meta">Think Before You Build™ · {simulation.scenarios.length} paths</p>
        <h2 className="founder-simulation__title">{simulation.decisionQuestion}</h2>
      </header>

      <section className="founder-simulation__if-i-were-you" aria-labelledby="if-i-were-you">
        <h3 className="founder-simulation__section-title" id="if-i-were-you">
          If I were you…
        </h3>
        <p className="founder-simulation__recommendation">
          <strong>{simulation.ifIWereYou.recommendedPath}</strong> — {simulation.ifIWereYou.why}
        </p>
        <p className="founder-simulation__muted">
          Confidence: {simulation.ifIWereYou.confidence} · Watch: {simulation.ifIWereYou.alternativeWorthWatching}
        </p>
      </section>

      <section className="founder-simulation__cards" aria-labelledby="scenario-cards">
        <h3 className="founder-simulation__section-title" id="scenario-cards">
          Executive scenarios
        </h3>
        <ul className="founder-simulation__card-grid">
          {simulation.scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              recommended={scenario.id === recommendedId}
              onSelect={() => onSelectScenario(scenario.id)}
            />
          ))}
        </ul>
      </section>

      <section className="founder-simulation__table-wrap" aria-labelledby="comparison-table">
        <h3 className="founder-simulation__section-title" id="comparison-table">
          At a glance
        </h3>
        <table className="founder-simulation__table">
          <thead>
            <tr>
              <th scope="col">Factor</th>
              {simulation.scenarios.map((s) => (
                <th key={s.id} scope="col">
                  {s.letter}. {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {simulation.scenarios.map((s) => (
                  <td key={s.id}>{row.values[s.id] ?? "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="founder-simulation__board-summary">
        <h3 className="founder-simulation__section-title">Executive board summary</h3>
        <p className="founder-simulation__prose">{simulation.boardSummary}</p>
      </section>

      <p className="founder-simulation__learning-note">
        <strong>Learning loop:</strong> {simulation.learningLoopNote}
      </p>
    </article>
  );
}

function ScenarioCard({
  scenario,
  recommended,
  onSelect,
}: {
  scenario: ExecutiveScenario;
  recommended: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={
          recommended
            ? "founder-simulation__card founder-simulation__card--rec"
            : "founder-simulation__card"
        }
        onClick={onSelect}
      >
        <span className="founder-simulation__card-letter">Scenario {scenario.letter}</span>
        <span className="founder-simulation__card-name">{scenario.name}</span>
        <span className="founder-simulation__card-summary">{scenario.executiveSummary}</span>
        <span className="founder-simulation__card-metrics">
          ~{scenario.estimatedTimeWeeks} wks · {scenario.estimatedEffort} effort · {scenario.confidence} confidence
        </span>
        {recommended ? <span className="founder-simulation__rec-badge">Recommended</span> : null}
      </button>
    </li>
  );
}

"use client";

import type { ReactNode } from "react";

import type { ExecutiveScenario, ExecutiveSimulation } from "@/lib/executiveSimulation/types";

import { ExecutivePanel } from "../executive";

type SimulationScenarioDetailProps = {
  simulation: ExecutiveSimulation;
  scenario: ExecutiveScenario;
  onBack: () => void;
};

function Panel({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <ExecutivePanel title={title} collapsible defaultOpen={defaultOpen}>
      {children}
    </ExecutivePanel>
  );
}

export function SimulationScenarioDetail({ simulation, scenario, onBack }: SimulationScenarioDetailProps) {
  const isRecommended = simulation.ifIWereYou.recommendedScenarioId === scenario.id;

  return (
    <article className="founder-simulation__detail">
      <button type="button" className="founder-simulation__back" onClick={onBack}>
        ← Back to comparison
      </button>

      <header className="founder-simulation__header">
        <p className="founder-simulation__meta">
          Scenario {scenario.letter}
          {isRecommended ? " · Founder recommends" : ""}
        </p>
        <h2 className="founder-simulation__title">{scenario.name}</h2>
        <p className="founder-simulation__prose">{scenario.executiveSummary}</p>
      </header>

      <Panel title="Why this approach" defaultOpen>
        <p className="founder-simulation__prose">{scenario.whyThisApproach}</p>
        <div className="founder-simulation__pros-cons">
          <div>
            <p className="founder-simulation__subhead">Advantages</p>
            <ul className="founder-simulation__bullets">
              {scenario.advantages.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="founder-simulation__subhead">Disadvantages</p>
            <ul className="founder-simulation__bullets">
              {scenario.disadvantages.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="founder-simulation__metrics">
          <li><strong>Effort:</strong> {scenario.estimatedEffort}</li>
          <li><strong>Complexity:</strong> {scenario.estimatedComplexity}</li>
          <li><strong>Cost:</strong> {scenario.estimatedCost}</li>
          <li><strong>Time:</strong> ~{scenario.estimatedTimeWeeks} weeks</li>
          <li><strong>Founder energy:</strong> {scenario.estimatedFounderEnergy}</li>
          <li><strong>Customer impact:</strong> {scenario.estimatedCustomerImpact}</li>
          <li><strong>Business impact:</strong> {scenario.estimatedBusinessImpact}</li>
          <li><strong>Revenue:</strong> {scenario.estimatedRevenueOpportunity}</li>
          <li><strong>Automation:</strong> {scenario.estimatedAutomationOpportunity}</li>
          <li><strong>Long-term value:</strong> {scenario.estimatedLongTermStrategicValue}</li>
          <li><strong>Confidence:</strong> {scenario.confidence}</li>
        </ul>
      </Panel>

      <Panel title="What changes if you choose this path?" defaultOpen>
        <div className="founder-simulation__what-changes">
          <ChangeList label="Becomes easier" items={scenario.whatChanges.becomesEasier} />
          <ChangeList label="Becomes harder" items={scenario.whatChanges.becomesHarder} />
          <ChangeList label="Gets delayed" items={scenario.whatChanges.getsDelayed} />
          <ChangeList label="Speeds up" items={scenario.whatChanges.speedsUp} />
          <ChangeList label="New opportunities" items={scenario.whatChanges.newOpportunities} />
          <ChangeList label="Opportunities lost" items={scenario.whatChanges.lostOpportunities} />
        </div>
      </Panel>

      <Panel title="Second-order effects">
        <ul className="founder-simulation__effects">
          {scenario.secondOrderEffects.map((e) => (
            <li key={e.id}>
              <strong>If {e.trigger}</strong> → {e.consequence}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Opportunity cost">
        <ChangeList label="What you are not choosing" items={scenario.opportunityCost.notChoosing} />
        <ChangeList label="What waits" items={scenario.opportunityCost.whatWaits} />
        <ChangeList label="What slows" items={scenario.opportunityCost.whatSlows} />
        <ChangeList label="Becomes unavailable" items={scenario.opportunityCost.becomesUnavailable} />
      </Panel>

      <Panel title="Executive board perspectives">
        <ul className="founder-simulation__board">
          {scenario.boardPerspectives.map((p) => (
            <li key={p.id} className="founder-simulation__board-item">
              <strong>{p.label}</strong>
              <p className="founder-simulation__prose"><em>Likes:</em> {p.likes}</p>
              <p className="founder-simulation__prose"><em>Concerns:</em> {p.concerns}</p>
              {p.questions.length > 0 ? (
                <p className="founder-simulation__muted">Questions: {p.questions.join(" · ")}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Spark ecosystem impact">
        <ul className="founder-simulation__ecosystem">
          {scenario.ecosystemImpact.map((e) => (
            <li key={e.area}>
              <strong>{e.area.replace(/-/g, " ")}</strong> ({e.direction}) — {e.summary}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Resource analysis">
        <ul className="founder-simulation__metrics">
          <li><strong>Founder time:</strong> {scenario.resources.founderTime}</li>
          <li><strong>Money:</strong> {scenario.resources.money}</li>
          <li><strong>Team:</strong> {scenario.resources.teamEffort}</li>
          <li><strong>Development:</strong> {scenario.resources.developmentEffort}</li>
          <li><strong>Marketing:</strong> {scenario.resources.marketingEffort}</li>
          <li><strong>Maintenance:</strong> {scenario.resources.maintenance}</li>
          <li><strong>Support:</strong> {scenario.resources.customerSupport}</li>
        </ul>
        <ChangeList label="Automation opportunities" items={scenario.resources.automationOpportunities} />
        <ChangeList label="Learning opportunities" items={scenario.resources.learningOpportunities} />
      </Panel>

      <Panel title="Risk analysis">
        <ul className="founder-simulation__risks">
          {scenario.riskAnalysis.map((r) => (
            <li key={`${r.kind}-${r.summary}`}>
              <strong>{r.kind.replace(/-/g, " ")}</strong> ({r.confidence}) — {r.summary}
            </li>
          ))}
        </ul>
        <p className="founder-simulation__subhead">Key assumptions</p>
        <ul className="founder-simulation__bullets">
          {scenario.keyAssumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="founder-simulation__subhead">Dependencies</p>
        <ul className="founder-simulation__bullets">
          {scenario.dependencies.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="founder-simulation__subhead">Unknowns</p>
        <ul className="founder-simulation__bullets">
          {scenario.unknowns.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </Panel>

      <ExecutivePanel title="Prepared outputs — drafts only" subtitle="Nothing executes until you approve" defaultOpen>
        <ul className="founder-simulation__prep-list">
          {simulation.prepOffers.map((offer) => (
            <li key={offer.id} className="founder-simulation__prep-item">
              <span className="founder-simulation__prep-label">{offer.label}</span>
              <span className="founder-simulation__prep-desc">{offer.description}</span>
              <span className="founder-simulation__prep-status">{offer.status}</span>
            </li>
          ))}
        </ul>
      </ExecutivePanel>
    </article>
  );
}

function ChangeList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="founder-simulation__change-block">
      <p className="founder-simulation__subhead">{label}</p>
      <ul className="founder-simulation__bullets">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

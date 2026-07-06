"use client";

import { MARKETING_ORCHESTRATION_FLOW } from "@/lib/executiveIntegration/marketingOrchestration";

export function MarketingOrchestrationFlow() {
  const { steps, departments, feedback } = MARKETING_ORCHESTRATION_FLOW;

  return (
    <section className="founder-integration__flow" aria-labelledby="marketing-flow-title">
      <h2 className="founder-integration__section-title" id="marketing-flow-title">
        How marketing orchestration works
      </h2>
      <p className="founder-integration__lead">{MARKETING_ORCHESTRATION_FLOW.summary}</p>

      <div className="founder-integration__flow-diagram">
        {steps.map((step) => (
          <div key={step.id} className="founder-integration__flow-step">
            <span className="founder-integration__flow-node">{step.label}</span>
            <span className="founder-integration__flow-arrow" aria-hidden="true">
              ▼
            </span>
          </div>
        ))}

        <div className="founder-integration__flow-branches">
          {departments.map((dept) => (
            <article key={dept.id} className="founder-integration__flow-branch">
              <h3 className="founder-integration__flow-branch-title">{dept.name}</h3>
              <ul className="founder-integration__flow-branch-list">
                {dept.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="founder-integration__flow-step founder-integration__flow-step--feedback">
          <span className="founder-integration__flow-arrow" aria-hidden="true">
            ▼
          </span>
          <span className="founder-integration__flow-node founder-integration__flow-node--feedback">
            {feedback.label}
          </span>
        </div>
      </div>
    </section>
  );
}

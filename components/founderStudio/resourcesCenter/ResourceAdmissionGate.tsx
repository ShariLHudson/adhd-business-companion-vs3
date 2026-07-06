"use client";

import type { ExecutiveResourceAdmissionQuestion } from "@/lib/executiveResourcesCenter";

type ResourceAdmissionGateProps = {
  rule: string;
  questions: readonly ExecutiveResourceAdmissionQuestion[];
};

export function ResourceAdmissionGate({ rule, questions }: ResourceAdmissionGateProps) {
  return (
    <section className="founder-resources__gate" aria-labelledby="resources-gate-title">
      <h2 className="founder-resources__section-title" id="resources-gate-title">
        Adding a new external tool
      </h2>
      <p className="founder-resources__lead">{rule}</p>
      <ol className="founder-resources__questions">
        {questions.map((item, index) => (
          <li key={item.id} className="founder-resources__question">
            <span className="founder-resources__question-number">{index + 1}.</span>
            {item.question}
          </li>
        ))}
      </ol>
      <p className="founder-resources__gate-outcome">
        If all five are yes — add it here. Do not scatter important external resources throughout
        Founder.
      </p>
    </section>
  );
}

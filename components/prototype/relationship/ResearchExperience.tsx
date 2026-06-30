"use client";

import { RESEARCH_FINDINGS } from "./mockData";

type ResearchExperienceProps = {
  visible: boolean;
  onClose: () => void;
};

export function ResearchExperience({ visible, onClose }: ResearchExperienceProps) {
  if (!visible) return null;

  return (
    <div className="rel-research" role="region" aria-label="Research together">
      <div className="rel-research__glass">
        <header className="rel-research__header">
          <h2>What people are saying</h2>
          <button type="button" className="rel-research__done" onClick={onClose}>
            Back to us
          </button>
        </header>
        <div className="rel-research__findings">
          {RESEARCH_FINDINGS.map((finding) => (
            <article key={finding.id} className="rel-research__card">
              <h3>{finding.title}</h3>
              <p>{finding.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

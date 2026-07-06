import type { ExecutiveStatusBar } from "@/lib/executiveCommandCenter/types";

type ExecutiveStatusBarProps = {
  status: ExecutiveStatusBar;
};

const MOMENTUM_LABELS = {
  restoring: "Restoring",
  building: "Building",
  accelerating: "Accelerating",
  launching: "Launching",
} as const;

const LEVEL_LABELS = {
  low: "Low",
  moderate: "Moderate",
  elevated: "Elevated",
  high: "High",
} as const;

export function ExecutiveStatusBarView({ status }: ExecutiveStatusBarProps) {
  return (
    <section className="founder-hq__status" aria-label="Executive status">
      <div className="founder-hq__status-item">
        <span className="founder-hq__status-label">Mission</span>
        <span className="founder-hq__status-value">{status.currentMission}</span>
      </div>
      <div className="founder-hq__status-item">
        <span className="founder-hq__status-label">Focus</span>
        <span className="founder-hq__status-value">{status.currentFocus}</span>
      </div>
      <div className="founder-hq__status-item">
        <span className="founder-hq__status-label">Energy</span>
        <span className="founder-hq__status-value">{status.currentEnergy}</span>
      </div>
      <div className="founder-hq__status-item">
        <span className="founder-hq__status-label">Momentum</span>
        <span className="founder-hq__status-value">{MOMENTUM_LABELS[status.currentMomentum]}</span>
      </div>
      <div className="founder-hq__status-item">
        <span className="founder-hq__status-label">Risk</span>
        <span className="founder-hq__status-value">{LEVEL_LABELS[status.currentRiskLevel]}</span>
      </div>
      <div className="founder-hq__status-item">
        <span className="founder-hq__status-label">Opportunity</span>
        <span className="founder-hq__status-value">{LEVEL_LABELS[status.currentOpportunityLevel]}</span>
      </div>
    </section>
  );
}

import type { FlameExecutiveObservation } from "@/lib/founder/flame/types";

const CATEGORY_LABELS: Record<FlameExecutiveObservation["category"], string> = {
  progress: "Progress",
  focus: "Focus",
  momentum: "Momentum",
  learning: "Learning",
  creativity: "Creativity",
  "decision-making": "Decision Making",
  business: "Business",
};

type FlameExecutiveObservationProps = {
  observation: FlameExecutiveObservation;
};

export function FlameExecutiveObservationCard({
  observation,
}: FlameExecutiveObservationProps) {
  return (
    <section
      className="founder-flame-observation"
      aria-labelledby="flame-observation-heading"
    >
      <p className="founder-flame-observation__eyebrow" id="flame-observation-heading">
        Executive Observation
      </p>
      <span className="founder-flame-observation__category">
        {CATEGORY_LABELS[observation.category]}
      </span>
      <p className="founder-flame-observation__text">{observation.observation}</p>
    </section>
  );
}

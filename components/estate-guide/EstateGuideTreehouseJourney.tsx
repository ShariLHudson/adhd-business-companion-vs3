import type { TreehouseJourneyFooter } from "@/data/estateGuideSpreads/treehouseGuideJourney";

type Props = {
  journey: TreehouseJourneyFooter;
  className?: string;
};

/** Recurring footer — one continuous Treehouse journey, not a checklist. */
export function EstateGuideTreehouseJourney({ journey, className }: Props) {
  return (
    <footer
      className={["eg-guide-treehouse-journey", className].filter(Boolean).join(" ")}
      aria-label="Your Journey Through the Treehouse"
    >
      <p className="eg-guide-treehouse-journey__title">Your Journey Through the Treehouse</p>
      <ul className="eg-guide-treehouse-journey__steps">
        {journey.completedSteps.map((step) => (
          <li key={step} className="eg-guide-treehouse-journey__step">
            <span className="eg-guide-treehouse-journey__mark" aria-hidden="true">
              ✓
            </span>
            {step}
          </li>
        ))}
        {journey.nextStop ? (
          <li className="eg-guide-treehouse-journey__step eg-guide-treehouse-journey__step--next">
            <span className="eg-guide-treehouse-journey__mark" aria-hidden="true">
              →
            </span>
            Next Stop: {journey.nextStop}
          </li>
        ) : null}
      </ul>
    </footer>
  );
}

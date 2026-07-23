import type { FireExecutivePortfolio } from "@/lib/founder/types/fireBrief";

import { FireExecutiveBriefReadingExperience } from "./FireExecutiveBriefReadingExperience";

type FireExecutivePortfolioProps = {
  portfolio: FireExecutivePortfolio;
  /** Archives show a back context; today omits. */
  variant?: "today" | "archive";
};

/**
 * Founder Workspace entry for the daily / archive FIRE brief.
 * Renders the complete Executive Intelligence Brief reading experience.
 */
export function FireExecutivePortfolioView({
  portfolio,
  variant = "today",
}: FireExecutivePortfolioProps) {
  return (
    <FireExecutiveBriefReadingExperience
      portfolio={portfolio}
      variant={variant}
    />
  );
}

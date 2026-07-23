import { getFireExecutivePortfolio } from "@/lib/founder/briefs/firePortfolio";
import { composeFounderDailyWorkflow } from "@/lib/founder/dailyWorkflow";

import { FounderExecutiveOffice } from "./FounderExecutiveOffice";

export function FounderHome() {
  const workflow = composeFounderDailyWorkflow();
  const portfolio = getFireExecutivePortfolio();

  return (
    <FounderExecutiveOffice
      greeting={workflow.greeting}
      portfolio={portfolio}
      office={workflow.office}
    />
  );
}

/** Drawer sections for shell — loaded through ConciergeService. */
export function getFounderConciergeDrawerSections() {
  return composeFounderDailyWorkflow().office.drawer;
}

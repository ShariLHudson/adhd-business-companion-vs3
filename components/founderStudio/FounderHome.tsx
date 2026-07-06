import { getFireExecutivePortfolio } from "@/lib/founder/briefs/firePortfolio";
import { composeFounderDailyWorkflow } from "@/lib/founder/dailyWorkflow";

import { ConciergeAgenda } from "./concierge/ConciergeAgenda";
import { ConciergeReminders } from "./concierge/ConciergeReminders";
import { ConciergeThinkingSpace } from "./concierge/ConciergeThinkingSpace";
import { ConciergeWorkspaceSuggestion } from "./concierge/ConciergeWorkspaceSuggestion";
import { FlameMentorPresence } from "./flame/FlameMentorPresence";
import { MissionWorkspaceShell } from "./missions/MissionWorkspaceShell";
import { FireExecutivePortfolioView } from "./fire/FireExecutivePortfolioView";
import { FounderWorkspaceCards } from "./FounderWorkspaceCards";

export function FounderHome() {
  const workflow = composeFounderDailyWorkflow();
  const { office } = workflow;
  const portfolio = getFireExecutivePortfolio();

  return (
    <div className="founder-home">
      <header className="founder-home__hero">
        <p className="founder-home__eyebrow">Executive Office</p>
        <h1 className="founder-home__greeting">{workflow.greeting}</h1>
      </header>

      <MissionWorkspaceShell />

      <FlameMentorPresence />

      <div className="founder-concierge-office__row">
        <ConciergeWorkspaceSuggestion suggestion={office.workspaceSuggestion} />
        <ConciergeThinkingSpace suggestion={office.thinkingSpace} />
      </div>

      <ConciergeAgenda agenda={office.agenda} />
      <ConciergeReminders reminders={office.reminders} />

      <FireExecutivePortfolioView portfolio={portfolio} variant="today" />

      <FounderWorkspaceCards />
    </div>
  );
}

/** Drawer sections for shell — loaded through ConciergeService. */
export function getFounderConciergeDrawerSections() {
  return composeFounderDailyWorkflow().office.drawer;
}

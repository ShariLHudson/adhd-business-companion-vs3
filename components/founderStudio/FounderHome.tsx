import { getTodayBrief } from "@/lib/founder/briefs";
import { getFireExecutivePortfolio } from "@/lib/founder/briefs/firePortfolio";

import { FireExecutivePortfolioView } from "./fire/FireExecutivePortfolioView";
import { FounderWorkspaceCards } from "./FounderWorkspaceCards";

export function FounderHome() {
  const brief = getTodayBrief();
  const portfolio = getFireExecutivePortfolio();

  return (
    <div className="founder-home">
      <header className="founder-home__hero">
        <p className="founder-home__eyebrow">Executive Office</p>
        <h1 className="founder-home__greeting">{brief.greeting}</h1>
      </header>

      <FireExecutivePortfolioView portfolio={portfolio} variant="today" />

      <FounderWorkspaceCards />
    </div>
  );
}

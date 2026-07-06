import { listExecutiveArchives } from "@/lib/founder/briefs/firePortfolio";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive";
import { FireArchiveCard } from "./fire/FireArchiveCard";

export function FounderExecutiveArchives() {
  const archives = listExecutiveArchives();

  return (
    <div className="founder-archives">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="FIRE™ · Executive Archives"
        title="Executive Archives"
        question="What did we already decide?"
        purpose="Previous FIRE briefs — calm history, not a file cabinet."
      />

      <div className="founder-archives__grid">
        {archives.map((archive) => (
          <FireArchiveCard key={archive.id} archive={archive} />
        ))}
      </div>
    </div>
  );
}

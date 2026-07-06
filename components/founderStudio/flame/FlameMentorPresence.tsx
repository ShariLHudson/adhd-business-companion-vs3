import { getFlameMentorOverview } from "@/lib/founder/flame/services";

import { FlameExecutiveObservationCard } from "./FlameExecutiveObservation";
import { FlameGuidanceRow } from "./FlameGuidanceRow";
import { FlameMentorPanels } from "./FlameMentorPanels";
import { FlameMorningMessage } from "./FlameMorningMessage";
import { FlameWeeklyReflectionCard } from "./FlameWeeklyReflection";

export function FlameMentorPresence() {
  const mentor = getFlameMentorOverview();

  return (
    <div className="founder-flame-presence">
      <FlameMorningMessage message={mentor.morningMessage} />
      <FlameExecutiveObservationCard observation={mentor.observation} />
      <FlameMentorPanels panels={mentor.panels} />
      <FlameGuidanceRow
        challenge={mentor.challenge}
        suggestedQuestion={mentor.suggestedQuestion}
      />
      <FlameWeeklyReflectionCard reflection={mentor.weeklyReflection} />
    </div>
  );
}

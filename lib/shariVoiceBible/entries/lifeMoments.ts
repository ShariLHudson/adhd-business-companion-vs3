import { voiceLine } from "@/lib/shariVoiceBible/entryBuilder";
import type { ShariVoiceLine } from "@/lib/shariVoiceBible/types";
import { LIFE_MOMENT_CATALOG, lifeMomentTag } from "@/lib/sharisLifeMoments/catalog";
import { assertLifeMomentVoice } from "@/lib/sharisLifeMoments/rules";

/** Voice Bible entries for Shari's Life Moments™ — observation kind, never advice. */
export const SHARIS_LIFE_MOMENT_LINES: ShariVoiceLine[] = LIFE_MOMENT_CATALOG.map(
  (entry) => {
    assertLifeMomentVoice(entry.text, entry.id);
    return voiceLine(
      entry.id,
      entry.text,
      "echo",
      "observation",
      {
        tags: ["life_moment", lifeMomentTag(entry.category)],
        frequencyWeight: 1.05,
        cooldownVisits: 40,
        relationshipStages: ["early", "month", "trusted", "deep", "kin"],
      },
    );
  },
);

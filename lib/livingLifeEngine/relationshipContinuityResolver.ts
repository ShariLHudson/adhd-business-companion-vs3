import type { LivingChangeItem, LivingChangeEngineInput } from "./types";
import { getLivingChangeHistory, isOnCooldown } from "./livingChangeHistory";

const RELATIONSHIP_CUES = [
  {
    id: "book-closed",
    cue: "book-closed-on-table",
    objects: [{ kind: "book" as const, placement: "shelf" as const, label: "yesterday's read" }],
    hint: "I left your book where you can find it.",
  },
  {
    id: "mug-moved",
    cue: "mug-moved-to-table",
    objects: [{ kind: "coffee" as const, placement: "table" as const }],
    hospitality: { showMugSteam: true },
    hint: "Your mug's still warm.",
  },
  {
    id: "fresh-flowers",
    cue: "flowers-replaced",
    objects: [{ kind: "flowers" as const, placement: "table" as const }],
    hint: "Fresh flowers by the window.",
  },
  {
    id: "journal-open",
    cue: "journal-waiting",
    objects: [{ kind: "journal" as const, placement: "table" as const }],
    hint: "Your journal's open if you want it.",
  },
  {
    id: "chair-angle",
    cue: "chair-angle-changed",
    hint: "I turned the chair toward the light.",
  },
] as const;

export function resolveRelationshipContinuityChanges(
  input: LivingChangeEngineInput,
): LivingChangeItem[] {
  if (input.isFirstMeeting || input.sessionVisitIndex < 3) {
    return [];
  }

  const history = getLivingChangeHistory();
  const visitIndex = input.sessionVisitIndex;
  const cue = RELATIONSHIP_CUES[visitIndex % RELATIONSHIP_CUES.length];

  if (isOnCooldown("relationship", cue.cue, input.now)) {
    return [];
  }

  if (
    input.livingLifeContext?.visitKind === "room_return" &&
    history.lastRoomSnapshot
  ) {
    const snapshot = history.lastRoomSnapshot;
    const changes: LivingChangeItem[] = [];

    if (snapshot.objectKinds.includes("coffee")) {
      changes.push({
        id: "relationship-steam-faded",
        bucket: "relationship",
        priority: "life_continuity",
        sourceModule: "relationshipContinuityResolver",
        cause: "room-return-steam-faded",
        hospitality: { showMugSteam: false },
        relationshipCue: "steam-faded",
      });
    }

    if (snapshot.kinsey !== "hidden") {
      changes.push({
        id: "relationship-kinsey-moved",
        bucket: "relationship",
        priority: "life_continuity",
        sourceModule: "relationshipContinuityResolver",
        cause: "room-return-kinsey-shifted",
        kinsey:
          snapshot.kinsey === "window-gazing"
            ? "sleeping-beside-chair"
            : "window-gazing",
        relationshipCue: "kinsey-moved",
      });
    }

    if (changes.length > 0) return changes;
  }

  return [
    {
      id: `relationship-${cue.id}`,
      bucket: "relationship",
      priority: "relationship",
      sourceModule: "relationshipContinuityResolver",
      cause: cue.cue,
      objects: "objects" in cue ? [...cue.objects] : undefined,
      hospitality: "hospitality" in cue ? { ...cue.hospitality } : undefined,
      relationshipCue: cue.cue,
      conversationHint: cue.hint,
    },
  ];
}

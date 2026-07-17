/**
 * Regression: practical start/laundry language must never become scenic place menus.
 * Live failure: dryer laundry → Peaceful & Quiet; "I think…" → Think & Reflect.
 */

import { describe, expect, it } from "vitest";
import {
  classifyOverwhelmNeed,
  shouldBlockScenicOverwhelmMenu,
} from "@/lib/conversation/overwhelmNeedClassifier";
import { matchExperienceGroupFromQuery } from "@/lib/estateKnowledgeBase/experienceGroups";
import { resolveLocationIntent } from "@/lib/estateKnowledgeBase/locationIntentResolution";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence";
import { resolveSemanticMemberIntent } from "@/lib/semanticIntentResolver";
import { executeSemanticIntent } from "@/lib/semanticIntentResolver/executeSemanticIntent";
import { mayOfferScenicPlaceSuggestions } from "./scenicPlaceSuggestionPolicy";

const LAUNDRY =
  "i have to fold and put away some laundry but its still in the dryer from this morning";
const NEED_FOLD = "i need to fold my laundry";
const I_THINK_FEW = "i think i can only do a few items. they are cleaning rags for my cleaning lady to use in a couple of days";
const CANT_START = "but i know what to do, i just can't get myself to do stuff";
const DAUNTING = "maybe but even then everything seems so daunting";

const SCENIC_MENU_RE =
  /I have a few (?:peaceful|think|quiet).{0,40}places you might enjoy|Reflection Pond|Possibility House|Which would you like to visit/i;

describe("practical task language — no scenic hijack", () => {
  it.each([LAUNDRY, NEED_FOLD, I_THINK_FEW, CANT_START, DAUNTING])(
    "blocks scenic overwhelm menu for: %s",
    (text) => {
      expect(mayOfferScenicPlaceSuggestions(text)).toBe(false);
      expect(shouldBlockScenicOverwhelmMenu(text)).toBe(true);
    },
  );

  it("does not match Peaceful & Quiet from incidental 'still'", () => {
    expect(matchExperienceGroupFromQuery(LAUNDRY)).toBeNull();
    expect(resolveLocationIntent(LAUNDRY).kind).toBe("unresolved");
    expect(resolveEstateNavigationIntent(LAUNDRY).kind).toBe("unresolved");
  });

  it("does not match Think & Reflect from bare 'I think'", () => {
    expect(matchExperienceGroupFromQuery(I_THINK_FEW)).toBeNull();
    expect(resolveLocationIntent(I_THINK_FEW).kind).toBe("unresolved");
    expect(resolveEstateNavigationIntent(I_THINK_FEW).kind).toBe("unresolved");
  });

  it("semantic path does not offer experience place menus for laundry", () => {
    for (const text of [LAUNDRY, NEED_FOLD, I_THINK_FEW]) {
      const intent = resolveSemanticMemberIntent({ userText: text });
      expect(intent.target.kind).not.toBe("experience");
      expect(intent.nextStep).not.toBe("offer_choices");
      const runtime = executeSemanticIntent(intent, text, {});
      expect(runtime?.localReply ?? "").not.toMatch(SCENIC_MENU_RE);
    }
  });

  it("classifies laundry / start paralysis as task_breakdown", () => {
    expect(classifyOverwhelmNeed(LAUNDRY)).toBe("task_breakdown");
    expect(classifyOverwhelmNeed(CANT_START)).toBe("task_breakdown");
    expect(classifyOverwhelmNeed(DAUNTING)).toBe("task_breakdown");
  });

  it("still offers places for explicit experience asks", () => {
    const peaceful = "I want somewhere peaceful";
    expect(mayOfferScenicPlaceSuggestions(peaceful)).toBe(true);
    expect(matchExperienceGroupFromQuery(peaceful)?.matchSource).toBe(
      "userMayAsk",
    );
    expect(resolveEstateNavigationIntent(peaceful).kind).toBe("offer_choices");

    const placeToThink = "Find me a place to think";
    expect(matchExperienceGroupFromQuery(placeToThink)?.matchSource).toBe(
      "userMayAsk",
    );
    expect(resolveEstateNavigationIntent(placeToThink).kind).toBe(
      "offer_choices",
    );
  });
});

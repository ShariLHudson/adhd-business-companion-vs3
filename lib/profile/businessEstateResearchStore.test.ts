/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addBusinessEstateResearchResponseToField,
  addBusinessEstateResearchSessionToField,
  getBusinessEstateEnvelope,
  getBusinessEstateResearchAddedResponses,
  getBusinessEstateResearchThreadMessages,
  getBusinessEstateSections,
  saveBusinessEstateResearchThread,
  saveBusinessEstateSection,
} from "./businessEstateProfile";
import { requestBusinessEstateReset } from "@/lib/businessEstateSectionIntent";

const msg = (id: string, content: string) => ({
  id,
  role: "assistant" as const,
  content,
});

describe("Business Estate research storage (Stage 4, canonical envelope)", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it("persists and resumes a research thread", () => {
    const key = "research:brand.keyMessages";
    expect(getBusinessEstateResearchThreadMessages(key)).toEqual([]);
    const messages = [
      { id: "u1", role: "user" as const, content: "help", hidden: true },
      msg("a1", "A first angle"),
    ];
    saveBusinessEstateResearchThread(key, messages);
    // Resume: reading again returns the same thread.
    expect(getBusinessEstateResearchThreadMessages(key)).toEqual(messages);
  });

  it("saving a thread never touches approved fields (no auto-write)", () => {
    saveBusinessEstateResearchThread("research:brand.keyMessages", [
      msg("a1", "Some research"),
    ]);
    expect(getBusinessEstateSections().brand.keyMessages).toBe("");
    expect(getBusinessEstateEnvelope().approval["brand.keyMessages"]).toBeUndefined();
  });

  it("save-back appends through the canonical writer and sets approval", () => {
    const res = addBusinessEstateResearchResponseToField(
      "brand",
      "keyMessages",
      "",
      msg("a1", "Angle one"),
    );
    expect(res).toEqual({ added: true, value: "Angle one" });
    expect(getBusinessEstateSections().brand.keyMessages).toBe("Angle one");
    // Approval gate: the explicit add is the approval.
    expect(getBusinessEstateEnvelope().approval["brand.keyMessages"]).toBe(true);
    expect(getBusinessEstateResearchAddedResponses()).toEqual(["a1"]);
  });

  it("is append-only and dedups by stable id (adding twice is a no-op)", () => {
    addBusinessEstateResearchResponseToField(
      "brand",
      "keyMessages",
      "",
      msg("a1", "Angle one"),
    );
    const again = addBusinessEstateResearchResponseToField(
      "brand",
      "keyMessages",
      "Angle one",
      msg("a1", "Angle one"),
    );
    expect(again.added).toBe(false);
    expect(getBusinessEstateSections().brand.keyMessages).toBe("Angle one");
    expect(getBusinessEstateResearchAddedResponses()).toEqual(["a1"]);
  });

  it("session add appends every not-yet-added response, then nothing new", () => {
    const messages = [msg("a1", "One"), msg("a2", "Two"), msg("a3", "Three")];
    const first = addBusinessEstateResearchSessionToField(
      "offers",
      "mainOffer",
      "Base.",
      [messages[0]!],
    );
    expect(first.value).toBe("Base.\n\nOne");
    const rest = addBusinessEstateResearchSessionToField(
      "offers",
      "mainOffer",
      "Base.\n\nOne",
      messages,
    );
    expect(rest.value).toBe("Base.\n\nOne\n\nTwo\n\nThree");
    expect(getBusinessEstateResearchAddedResponses().sort()).toEqual(["a1", "a2", "a3"]);
  });

  it("saving a section preserves research threads (no clobber)", () => {
    saveBusinessEstateResearchThread("research:brand.tone", [msg("a1", "Warm")]);
    saveBusinessEstateSection("identity", { businessName: "Rivera Studio" });
    expect(getBusinessEstateResearchThreadMessages("research:brand.tone")).toHaveLength(1);
    expect(getBusinessEstateSections().identity.businessName).toBe("Rivera Studio");
  });

  it("navigation reset keeps saved sections and research intact (nav reset ≠ data reset)", () => {
    saveBusinessEstateSection("brand", { keyMessages: "Keep me" });
    saveBusinessEstateResearchThread("research:brand.keyMessages", [
      msg("a1", "a saved research note"),
    ]);
    requestBusinessEstateReset();
    expect(getBusinessEstateSections().brand.keyMessages).toBe("Keep me");
    expect(
      getBusinessEstateResearchThreadMessages("research:brand.keyMessages"),
    ).toHaveLength(1);
  });

  it("legacy envelopes without a research field still load", () => {
    // Simulate an older envelope with no `research` key.
    window.localStorage.setItem(
      "companion-business-profile-v1",
      JSON.stringify({
        estate: {
          version: 1,
          sections: { identity: { businessName: "Legacy Co" } },
          approval: {},
          sectionUpdatedAt: {},
        },
      }),
    );
    expect(getBusinessEstateResearchThreadMessages("research:brand.tone")).toEqual([]);
    expect(getBusinessEstateResearchAddedResponses()).toEqual([]);
    // And research can still be saved onto the legacy envelope.
    saveBusinessEstateResearchThread("research:brand.tone", [msg("a1", "Hi")]);
    expect(getBusinessEstateResearchThreadMessages("research:brand.tone")).toHaveLength(1);
    expect(getBusinessEstateSections().identity.businessName).toBe("Legacy Co");
  });
});

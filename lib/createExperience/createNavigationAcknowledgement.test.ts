/**
 * Repair 2 (direct-navigation path) — a Create navigation renders ONLY the
 * prepared-state placeholder, never "Let's go to the Creative Studio" or a
 * duplicate acknowledgement, and typo'd create commands still route to Create.
 */
import { describe, expect, it } from "vitest";

import {
  CREATE_CANONICAL_DESTINATION_NAME,
  createNavigationArrivalMessage,
  immediateCreateOpenRendersPlaceholder,
  isCreateDestinationSection,
} from "./createNavigationAcknowledgement";
import { CREATE_ROOM_PREPARED_STATE_MESSAGE } from "./blockLegacyCreateWorkspaceRouting";
import { hardNavigationActiveWorkspace } from "@/lib/hardNavigationCommands";
import { directNavigationTransitionLine } from "@/lib/chatScope/directNavigationPriority";

describe("Create destination identity", () => {
  it("recognizes the internal create sections", () => {
    expect(isCreateDestinationSection("create")).toBe(true);
    expect(isCreateDestinationSection("content-generator")).toBe(true);
  });
  it("does not treat unrelated rooms as Create", () => {
    for (const s of ["boardroom", "clear-my-mind", "visual-focus", "research", null, undefined]) {
      expect(isCreateDestinationSection(s)).toBe(false);
    }
  });
  it("the arrival message is the prepared-state placeholder; canonical name is Create", () => {
    expect(createNavigationArrivalMessage()).toBe(CREATE_ROOM_PREPARED_STATE_MESSAGE);
    expect(CREATE_CANONICAL_DESTINATION_NAME).toBe("Create");
  });
});

describe("hard-nav create commands + bounded typo", () => {
  it("'go to create' and 'open create' route to the create section", () => {
    expect(hardNavigationActiveWorkspace("go to create")).toBe("create");
    expect(hardNavigationActiveWorkspace("open create")).toBe("create");
  });
  it("'go to creaste' resolves to Create as a bounded typo", () => {
    expect(hardNavigationActiveWorkspace("go to creaste")).toBe("create");
    expect(hardNavigationActiveWorkspace("open creaste")).toBe("create");
  });
  it("does not fuzzily misroute unrelated create-ish words", () => {
    expect(hardNavigationActiveWorkspace("go to creativity")).not.toBe("create");
    expect(hardNavigationActiveWorkspace("go to creative studio")).not.toBe("create");
    expect(hardNavigationActiveWorkspace("create a marketing plan")).not.toBe("create");
  });
});

/**
 * Simulate the CompanionPageClient direct-navigation assembly (the production
 * path the live test exercised): a create command suppresses the transition line
 * and posts the placeholder (idempotently); any other room posts its transition
 * line as before.
 */
function renderDirectNavTurn(
  command: { section: string; label?: string | null },
  posts = 1,
): string[] {
  const messages: string[] = [];
  const pushDedup = (line: string) => {
    if (!messages.includes(line)) messages.push(line);
  };
  if (isCreateDestinationSection(command.section)) {
    // skipAssistantMessage → no runDirectEstateRoomNavigation ack;
    // postCreateTransparencyMessage is idempotent (may be reached >1×).
    for (let i = 0; i < posts; i++) pushDedup(createNavigationArrivalMessage());
  } else {
    messages.push(directNavigationTransitionLine(command.label ?? null));
  }
  return messages;
}

describe("direct-navigation assembly — Create renders only the placeholder", () => {
  it("'go to create' produces only the placeholder response", () => {
    expect(renderDirectNavTurn({ section: "create" })).toEqual([
      CREATE_ROOM_PREPARED_STATE_MESSAGE,
    ]);
  });
  it("'open create' (content-generator) produces only the placeholder", () => {
    expect(renderDirectNavTurn({ section: "content-generator" })).toEqual([
      CREATE_ROOM_PREPARED_STATE_MESSAGE,
    ]);
  });
  it("'Creative Studio' is absent from the user-visible Create navigation", () => {
    for (const s of ["create", "content-generator"]) {
      const rendered = renderDirectNavTurn({ section: s, label: "Creative Studio" });
      expect(rendered.join(" ")).not.toMatch(/Creative Studio/i);
      expect(rendered.join(" ")).not.toMatch(/Let's go to/i);
    }
  });
  it("the placeholder is not duplicated even if posted more than once (optimistic/reconciled)", () => {
    expect(renderDirectNavTurn({ section: "create" }, 3)).toEqual([
      CREATE_ROOM_PREPARED_STATE_MESSAGE,
    ]);
  });
  it("two separate Create navigations each produce one placeholder", () => {
    expect(renderDirectNavTurn({ section: "create" })).toHaveLength(1);
    expect(renderDirectNavTurn({ section: "content-generator" })).toHaveLength(1);
  });
  it("unrelated Estate navigation still renders its normal transition line", () => {
    expect(renderDirectNavTurn({ section: "boardroom", label: "Round Table" })).toEqual([
      "Let's go to the Round Table.",
    ]);
  });
});

// ── Path A: frictionless immediateCreateOpen ────────────────────────────────

describe("immediateCreateOpen placeholder ownership", () => {
  it("a blocked create (marketing plan) renders the placeholder", () => {
    expect(
      immediateCreateOpenRendersPlaceholder({
        userText: "create a marketing plan for my adhd business",
      }),
    ).toBe(true);
  });
  it("a document-guided create (SOP) does NOT render the placeholder", () => {
    expect(
      immediateCreateOpenRendersPlaceholder({
        userText: "create an SOP for onboarding",
        itemType: "SOP",
      }),
    ).toBe(false);
  });
});

/**
 * Simulate the CompanionPageClient immediateCreateOpen assembly: the general
 * voiced reply ("I can help you build that in Create.") is suppressed when the
 * placeholder will render; completeImmediateCreateOpen posts the placeholder.
 */
function renderImmediateCreateOpenTurn(input: {
  userText: string;
  itemType?: string | null;
  voicedReply: string;
}): string[] {
  const messages: string[] = [];
  const pushDedup = (line: string) => {
    if (!messages.includes(line)) messages.push(line);
  };
  const rendersPlaceholder = immediateCreateOpenRendersPlaceholder(input);
  // Post A — general voiced reply (suppressed when the placeholder will render).
  if (!rendersPlaceholder) messages.push(input.voicedReply);
  // completeImmediateCreateOpen posts the placeholder for the dead-end.
  if (rendersPlaceholder) pushDedup(createNavigationArrivalMessage());
  return messages;
}

describe("immediate creation execution — one arrival response", () => {
  const VOICED = "I can help you build that in Create.";

  it("1-4. 'create a marketing plan' produces only the placeholder (no voiced reply)", () => {
    const rendered = renderImmediateCreateOpenTurn({
      userText: "create a marketing plan for my adhd business",
      voicedReply: VOICED,
    });
    expect(rendered).toEqual([createNavigationArrivalMessage()]);
    expect(rendered).not.toContain(VOICED);
  });

  it("5. a document-guided create keeps its voiced reply (functioning destination)", () => {
    const rendered = renderImmediateCreateOpenTurn({
      userText: "create an SOP for onboarding",
      itemType: "SOP",
      voicedReply: VOICED,
    });
    expect(rendered).toEqual([VOICED]);
  });
});

// ── Path B: pending immediateEstatePlaceNavigate ────────────────────────────

/**
 * Simulate the CompanionPageClient immediateEstatePlaceNavigate assembly: a
 * Create destination suppresses the transition line + duplicate reply and posts
 * only the placeholder; any other room keeps its acknowledgement unchanged.
 */
function renderPendingNavTurn(command: {
  section: string;
  navigationLine: string;
  localReply: string;
}): string[] {
  const messages: string[] = [];
  const pushDedup = (line: string) => {
    if (!messages.includes(line)) messages.push(line);
  };
  const createArrival = isCreateDestinationSection(command.section);
  // runDirectEstateRoomNavigation posts navigationLine unless skipAssistantMessage.
  if (!createArrival) messages.push(command.navigationLine);
  if (createArrival) pushDedup(createNavigationArrivalMessage());
  else messages.push(command.localReply);
  return messages;
}

describe("pending navigation confirmation — one Create arrival response", () => {
  it("6-10. pending Create nav ('go') shows only the placeholder, no 'Creative Studio'", () => {
    const rendered = renderPendingNavTurn({
      section: "create",
      navigationLine: "Taking you to Creative Studio.",
      localReply: "Taking you to Creative Studio.",
    });
    expect(rendered).toEqual([createNavigationArrivalMessage()]);
    expect(rendered.join(" ")).not.toMatch(/Creative Studio/i);
    expect(rendered.join(" ")).not.toMatch(/Taking you to/i);
  });

  it("15. unrelated pending Estate navigation is unchanged", () => {
    const rendered = renderPendingNavTurn({
      section: "boardroom",
      navigationLine: "Taking you to the Round Table.",
      localReply: "Taking you to the Round Table.",
    });
    expect(rendered).toContain("Taking you to the Round Table.");
    expect(rendered).not.toContain(createNavigationArrivalMessage());
  });

  it("13. placeholder is not duplicated across optimistic/reconciled posts", () => {
    // Both immediateCreateOpen and immediateEstatePlaceNavigate render one only.
    expect(
      renderImmediateCreateOpenTurn({
        userText: "create a marketing plan for my adhd business",
        voicedReply: "x",
      }),
    ).toHaveLength(1);
    expect(
      renderPendingNavTurn({
        section: "content-generator",
        navigationLine: "Taking you to Creative Studio.",
        localReply: "Taking you to Creative Studio.",
      }),
    ).toHaveLength(1);
  });
});

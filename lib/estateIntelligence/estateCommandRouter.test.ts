import { describe, expect, it } from "vitest";
import {
  detectDirectCommand,
  detectHybridCommand,
  detectIntentCommand,
  evaluateEstateCommand,
  estateDirectCommandArrivalLine,
  shouldExecuteEstateCommand,
} from "./estateCommandRouter";

describe("estateCommandRouter direct navigation", () => {
  it("Test 1: Take me to the Conservatory → Conservatory, not Clear My Mind", () => {
    const cmd = detectDirectCommand("Take me to the Conservatory.");
    expect(cmd).not.toBeNull();
    expect(cmd?.kind).toBe("direct");
    expect(cmd?.roomId).toBe("conservatory");
    expect(cmd?.roomId).not.toBe("clear-my-mind");
    expect(cmd?.executeImmediately).toBe(true);
  });

  it("Test 2: Take me to the Apple Orchard → Apple Orchard", () => {
    const cmd = detectDirectCommand("Take me to the Apple Orchard.");
    expect(cmd?.roomId).toBe("apple-orchard");
    expect(cmd?.section).toBe("focus-audio");
  });

  it("Test 3: Take me to the Music Room → Music Room", () => {
    const cmd = detectDirectCommand("Take me to the Music Room.");
    expect(cmd?.roomId).toBe("music-room");
    expect(cmd?.roomId).not.toBe("peaceful-places");
  });

  it("Test 4: Open the Momentum Institute → Momentum Institute", () => {
    const cmd = detectDirectCommand("Open the Momentum Institute.");
    expect(cmd?.roomId).toBe("momentum-institute");
    expect(cmd?.section).toBe("momentum-institute");
  });

  it("Test 5: I need to clear my mind → direct to Clear My Mind™", () => {
    const cmd = detectDirectCommand("I need to clear my mind");
    expect(cmd?.kind).toBe("direct");
    expect(cmd?.entryId).toBe("clear-my-mind");
    expect(cmd?.roomId).toBe("clear-my-mind");
    expect(cmd?.section).toBe("brain-dump");
  });

  it("Test 6: Conservatory first, then clear my mind activity", () => {
    const cmd = detectHybridCommand(
      "Take me to the Conservatory and help me clear my mind.",
    );
    expect(cmd?.kind).toBe("hybrid");
    expect(cmd?.roomId ?? cmd?.entryId).toBe("conservatory");
    expect(cmd?.pendingJourneyEntryIds).toContain("clear-my-mind");
  });

  it("detects voice-style 'me to the apple orchard'", () => {
    const cmd = detectDirectCommand("me to the apple orchard");
    expect(cmd?.roomId).toBe("apple-orchard");
  });

  it("detects bare 'apple orchard'", () => {
    const cmd = detectDirectCommand("apple orchard");
    expect(cmd?.roomId).toBe("apple-orchard");
  });

  it("detects contextual 'just go there' after assistant named destination", () => {
    const cmd = detectDirectCommand("i don't know let's just go there", {
      lastAssistantText: "Let's head to the Apple Orchard™!",
    });
    expect(cmd?.roomId).toBe("apple-orchard");
  });

  it("arrival line does not ask what to do", () => {
    const line = estateDirectCommandArrivalLine("conservatory", "conservatory");
    expect(line).toMatch(/Conservatory/);
    expect(line).not.toMatch(/what would you like/i);
  });

  it("executes direct command when room differs from current memory room", () => {
    const cmd = detectDirectCommand("go to the apple orchard");
    expect(cmd).not.toBeNull();
    if (!cmd) return;
    expect(shouldExecuteEstateCommand(cmd, "focus-audio", null)).toBe(true);
  });

  it("detects sunroom navigation", () => {
    const cmd = detectDirectCommand("take me to the sunroom");
    expect(cmd?.roomId).toBe("sunroom");
    expect(cmd?.section).toBe("welcome-room");
  });

  it("Test 7: Take me to the Library → Library room, growth-library section", () => {
    const cmd = detectDirectCommand("Take me to the Library.");
    expect(cmd).not.toBeNull();
    expect(cmd?.kind).toBe("direct");
    expect(cmd?.roomId).toBe("library");
    expect(cmd?.section).toBe("growth-library");
    expect(cmd?.workspaceOffer.section).toBe("growth-library");
    expect(cmd?.workspaceOffer.buttonLabel).toMatch(/Library/);
    expect(cmd?.workspaceOffer.buttonLabel).not.toMatch(/Institute/);
  });

  it("suppresses intent routing while member is in a direct estate visit", () => {
    const cmd = evaluateEstateCommand({
      userText: "i feel like journaling for a bit",
      activeSection: "focus-audio",
      activeDirectVisitRoomId: "apple-orchard",
    });
    expect(cmd).toBeNull();
  });

  it("still allows explicit navigation from inside a room", () => {
    const cmd = evaluateEstateCommand({
      userText: "take me to the journal",
      activeSection: "focus-audio",
      activeDirectVisitRoomId: "apple-orchard",
    });
    expect(cmd?.kind).toBe("direct");
    expect(cmd?.roomId).toBe("journal");
  });
});

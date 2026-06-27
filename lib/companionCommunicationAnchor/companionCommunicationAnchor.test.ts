import { describe, expect, it } from "vitest";
import {
  COMMUNICATION_ANCHOR_RULES,
  COMMUNICATION_ANCHOR_TEST_IDS,
  LIVING_CHANGE_COMMUNICATION_RULE,
  arrivalBeatAllowsAutoFocus,
  beatShowsCommunicationAnchor,
  resolveCommunicationAnchorMode,
} from "./invariants";
import { runCommunicationAnchorAudit } from "./audit";
import type { ArrivalBeat } from "@/lib/arrivalExperience/types";

const ARRIVAL_BEATS: ArrivalBeat[] = [
  "settle",
  "greet",
  "sit",
  "reality",
  "echo",
  "respond",
  "invite",
  "walk",
  "complete",
  "staying",
];

describe("Companion Communication Anchor", () => {
  it("requires communication access on every arrival beat", () => {
    for (const beat of ARRIVAL_BEATS) {
      expect(beatShowsCommunicationAnchor(beat)).toBe(true);
    }
  });

  it("uses quiet mode during arrival pause without removing access", () => {
    expect(resolveCommunicationAnchorMode("greet")).toBe("quiet");
    expect(resolveCommunicationAnchorMode("sit")).toBe("quiet");
    expect(resolveCommunicationAnchorMode("walk")).toBe("quiet");
    expect(resolveCommunicationAnchorMode("reality")).toBe("full");
    expect(resolveCommunicationAnchorMode("invite")).toBe("full");
  });

  it("does not auto-focus during arrival pause beats", () => {
    expect(arrivalBeatAllowsAutoFocus("greet")).toBe(false);
    expect(arrivalBeatAllowsAutoFocus("sit")).toBe(false);
    expect(arrivalBeatAllowsAutoFocus("reality")).toBe(true);
  });

  it("registers stable test ids for mic, input, and send", () => {
    expect(COMMUNICATION_ANCHOR_TEST_IDS.anchor).toBe(
      "companion-communication-anchor",
    );
    expect(COMMUNICATION_ANCHOR_TEST_IDS.mic).toBe(
      "companion-communication-mic",
    );
    expect(COMMUNICATION_ANCHOR_TEST_IDS.input).toBe(
      "companion-communication-input",
    );
    expect(COMMUNICATION_ANCHOR_TEST_IDS.send).toBe(
      "companion-communication-send",
    );
  });

  it("passes the communication anchor audit", () => {
    const report = runCommunicationAnchorAudit();
    expect(report.failed).toBe(0);
    expect(report.passed).toBeGreaterThan(0);
  });

  it("locks living change engine to the communication rule", () => {
    expect(LIVING_CHANGE_COMMUNICATION_RULE).toMatch(/Communication Anchor/);
    expect(COMMUNICATION_ANCHOR_RULES.alwaysReachable).toBe(true);
    expect(COMMUNICATION_ANCHOR_RULES.preserveDuringRoomTransitions).toBe(
      true,
    );
  });
});

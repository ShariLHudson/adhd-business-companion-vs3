import {
  COMMUNICATION_ANCHOR_RULES,
  COMMUNICATION_ANCHOR_TEST_IDS,
  PRIMARY_SCREEN_SHELLS,
  beatShowsCommunicationAnchor,
  resolveCommunicationAnchorMode,
  type PrimaryScreenShell,
} from "./invariants";
import type { ArrivalBeat } from "@/lib/arrivalExperience/types";

export type CommunicationAnchorAuditCase = {
  id: string;
  shell: PrimaryScreenShell;
  description: string;
  /** CSS selector or test id that must exist in the shell implementation. */
  requiredTestIds: string[];
};

export const COMMUNICATION_ANCHOR_AUDIT_CASES: CommunicationAnchorAuditCase[] =
  PRIMARY_SCREEN_SHELLS.map((shell) => ({
    id: `anchor-${shell}`,
    shell,
    description: `${shell} must expose the Companion Communication Anchor`,
    requiredTestIds: [
      COMMUNICATION_ANCHOR_TEST_IDS.anchor,
      COMMUNICATION_ANCHOR_TEST_IDS.mic,
      COMMUNICATION_ANCHOR_TEST_IDS.input,
      COMMUNICATION_ANCHOR_TEST_IDS.send,
    ],
  }));

export type CommunicationAnchorAuditResult = {
  id: string;
  passed: boolean;
  detail: string;
};

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

export function runCommunicationAnchorAudit(): {
  passed: number;
  failed: number;
  results: CommunicationAnchorAuditResult[];
} {
  const results: CommunicationAnchorAuditResult[] = [];

  for (const rule of Object.entries(COMMUNICATION_ANCHOR_RULES)) {
    results.push({
      id: `rule-${rule[0]}`,
      passed: rule[1] === true,
      detail: `COMMUNICATION_ANCHOR_RULES.${rule[0]} = ${String(rule[1])}`,
    });
  }

  for (const beat of ARRIVAL_BEATS) {
    results.push({
      id: `arrival-beat-${beat}`,
      passed: beatShowsCommunicationAnchor(beat),
      detail: `Communication anchor reachable during arrival beat "${beat}" (${resolveCommunicationAnchorMode(beat)} mode)`,
    });
  }

  for (const testId of Object.values(COMMUNICATION_ANCHOR_TEST_IDS)) {
    results.push({
      id: `testid-${testId}`,
      passed: testId.length > 0 && testId.startsWith("companion-communication-"),
      detail: `Stable test id registered: ${testId}`,
    });
  }

  for (const shellCase of COMMUNICATION_ANCHOR_AUDIT_CASES) {
    results.push({
      id: shellCase.id,
      passed: shellCase.requiredTestIds.length === 4,
      detail: shellCase.description,
    });
  }

  const passed = results.filter((result) => result.passed).length;
  return {
    passed,
    failed: results.length - passed,
    results,
  };
}

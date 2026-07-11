/**
 * Spec 130 — Assemble Wisdom Loop prompt hint for companion-chat.
 * Estate 131–140 — Shared Capability composition stays hidden behind Spark.
 */

import {
  SHARI_PRINCIPLE,
  WISDOM_BEFORE_INFORMATION_QUESTION,
  type WisdomLoopResult,
} from "./types";
import { memberNeedLabel } from "./memberNeed";
import { buildOutcomeDiscoveryPromptBlock } from "./outcomeDiscovery";
import { EMOTIONAL_BLOCKER_FORBIDDEN_UNTIL_UNDERSTOOD } from "./emotionalBlocker";
import { HIDDEN_INTENT_TURN1_FORBIDDEN } from "./validationGate";
import { resolveCompanionCapabilityHelp } from "@/lib/sparkSharedCapabilities";
import { evaluateRecognitionLifecycleTurn } from "@/lib/sparkRecognitionEngine";

export function buildWisdomLoopPromptHint(
  result: WisdomLoopResult,
  opts?: {
    memberMessage?: string;
    visualRoom?: string | null;
    activeRecognitionFlowKind?: string | null;
  },
): string {
  const lines: string[] = [
    "WISDOM LOOP (Specs 120–131 — invisible — respond like Shari):",
    SHARI_PRINCIPLE,
    `Internal question: ${WISDOM_BEFORE_INFORMATION_QUESTION}`,
    `Member needs most: ${memberNeedLabel(result.memberNeed.primary)} — ${result.memberNeed.rationale}`,
  ];

  if (result.hiddenIntentSummary) {
    lines.push("=== HIDDEN INTENT ACTIVE (CT-11 / Spec 121) — TURN 1 RULES ===");
    lines.push(`Surface vs goal: ${result.hiddenIntentSummary}`);
    lines.push("Coach toward the hidden goal. The deliverable they named is a proxy — not the job yet.");
    for (const rule of HIDDEN_INTENT_TURN1_FORBIDDEN) {
      lines.push(rule);
    }
  } else if (result.memberNeed.primary === "clarification") {
    lines.push("Proxy request detected — clarify real outcome before any template or outline.");
    lines.push(HIDDEN_INTENT_TURN1_FORBIDDEN[0]);
    lines.push(HIDDEN_INTENT_TURN1_FORBIDDEN[3]);
  }

  lines.push(buildOutcomeDiscoveryPromptBlock(result.outcomeDiscovery));

  if (result.thinkingPause.emotionUnderneath) {
    lines.push(`Emotion underneath: ${result.thinkingPause.emotionUnderneath} — hospitality first if needed.`);
  }

  if (result.thinkingPause.cognitiveOverload) {
    lines.push(
      "Cognitive load reduction: validate the weight first. Help them choose one gentle starting point — not everything at once.",
    );
  }

  if (result.insight?.due) {
    lines.push(`Insight due (turn ${result.insight.turnCount}): ${result.insight.guidance}`);
  }

  if (result.judgment) {
    lines.push(`Judgment cue: ${result.judgment.permissionPhrase} — ${result.judgment.guidance}`);
  }

  if (result.gentleChallenge) {
    lines.push(
      `Gentle challenge: ${result.gentleChallenge.permissionPhrase} ${result.gentleChallenge.alternativePerspective}`,
    );
    lines.push("Challenge the idea — never the person.");
  }

  if (result.emotionalBlocker) {
    lines.push(
      `=== EMOTIONAL BLOCKER ACTIVE (CT-05 / Spec 132) — ${result.emotionalBlocker.depth.toUpperCase()} ===`,
    );
    lines.push(result.emotionalBlocker.signal);
    lines.push(`Curiosity first: ${result.emotionalBlocker.curiosityOpener}`);
    lines.push(result.emotionalBlocker.guidance);
    lines.push(
      `Possible blockers (internal only — weave naturally, never as a checklist): ${result.emotionalBlocker.possibleBlockers.join(", ")}`,
    );
    lines.push(result.emotionalBlocker.adhdNormalizeWhenFit);
    if (result.emotionalBlocker.depth === "explore") {
      for (const rule of EMOTIONAL_BLOCKER_FORBIDDEN_UNTIL_UNDERSTOOD) {
        lines.push(rule);
      }
      lines.push(
        `ADHD normalize (only if it fits): ${result.emotionalBlocker.adhdNormalizeLine}`,
      );
    }
  }

  if (result.synthesis?.appropriate) {
    lines.push(`Synthesis: ${result.synthesis.guidance}`);
  }

  if (result.opportunity) {
    lines.push(
      `Workspace opportunity (${result.opportunity.label}): ${result.opportunity.invitePhrase} — permission only, never force.`,
    );
  }

  if (result.mentorMoment?.appropriate) {
    lines.push(`Mentor moment (sparingly): ${result.mentorMoment.opener}`);
  }

  if (result.futureBenefit.notes.length) {
    lines.push(`Future benefit: ${result.futureBenefit.notes.join(" · ")}`);
    lines.push("Prepare freely. Act only with permission.");
  }

  lines.push(
    "Never default to the fastest literal answer. Leave the member better than you found them.",
  );

  if (opts?.memberMessage?.trim()) {
    const recognition = evaluateRecognitionLifecycleTurn({
      userText: opts.memberMessage,
    });
    if (recognition.ownsTurn && recognition.companionPromptHint) {
      lines.push("=== RECOGNITION LIFECYCLE (invisible) ===");
      lines.push(recognition.companionPromptHint);
      if (recognition.speak) {
        lines.push(`Offer: ${recognition.speak}`);
      }
      lines.push(
        "Do not route this discovery to Create unless the member explicitly asks to build.",
      );
    }

    const capabilityHelp = resolveCompanionCapabilityHelp({
      userText: opts.memberMessage,
      visualRoom: opts.visualRoom,
      activeRecognitionFlowKind: opts.activeRecognitionFlowKind,
    });
    if (capabilityHelp.composition && capabilityHelp.promptHint) {
      lines.push("=== SHARED CAPABILITY (Estate 131–140 — invisible) ===");
      lines.push(capabilityHelp.promptHint);
      if (capabilityHelp.speak) {
        lines.push(`Companion offer tone: ${capabilityHelp.speak}`);
      }
      lines.push(
        `Never say: ${capabilityHelp.neverSay.slice(0, 8).join(", ")}`,
      );
    }
  }

  lines.push(
    "SPARK HUMAN VOICE (final check): Would Shari say this out loud? No ### headings, no 'Great question!', no 'Let's dive in', no essay format unless requested. One thought at a time.",
  );

  return lines.join("\n");
}

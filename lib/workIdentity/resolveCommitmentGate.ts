/**
 * Commitment Recognition Gate — Slice 0 (inert; not wired to any live
 * conversation flow — docs/estate/WORK_IDENTITY_IMPLEMENTATION_PLAN.md §1).
 *
 * Implements the Recognition Layer Contract
 * (docs/estate/COMMITMENT_RECOGNITION_DESIGN_REVIEW.md §7) as a pure,
 * side-effect-free function. Given the current recognition context, it
 * answers exactly one question: "did the founder cross the commitment
 * boundary this turn?"
 *
 * This function deliberately does NOT:
 *  - create or mint a WorkId (a future slice's responsibility —
 *    WORK_IDENTITY_IMPLEMENTATION_PLAN.md §1, Slice 1)
 *  - write to any store (localStorage, ConversationSession, or otherwise)
 *  - call any routing, navigation, or Universal Creation start function
 *  - open any destination or section
 *
 * It reuses, unmodified, the existing detectors the design review
 * grounded itself in (COMMITMENT_RECOGNITION_DESIGN_REVIEW.md §2):
 *  - `SIMPLE_CREATE_VERB_RE` / `inferDocumentTypeFromCreateText`
 *    (lib/universalCreation/createFastPath.ts)
 *  - `isGenuineConfusionSignal` (lib/companionEmotions.ts)
 *  - `SupportGateTier`, computed upstream by `resolveSupportGate`
 *    (lib/workStatePriority/resolveSupportGate.ts) and passed in as part
 *    of the context — never recomputed here.
 *
 * Every regex below is an illustrative, Slice-0-scoped implementation of
 * a signal category the design review named — not a final, exhaustive
 * lexicon. Per that document's own non-goals (§12), refining these
 * against real founder phrasing is a founder-language validation round
 * for the slice that eventually wires this gate into a live call site,
 * not this slice.
 */

import { isGenuineConfusionSignal } from "../companionEmotions";
import {
  SIMPLE_CREATE_VERB_RE,
  inferDocumentTypeFromCreateText,
} from "../universalCreation/createFastPath";
import type {
  CommitmentGateResult,
  CommitmentRecognitionContext,
  NamedPossibility,
} from "./types";

/**
 * Decision-level hedging (§5.1) — uncertainty about *whether to proceed
 * at all*. Distinct from outcome-level doubt (§6 below), which does not
 * hedge the decision, only the venture's downstream success.
 */
const DECISION_HEDGE_RE =
  /\b(?:might|may|could(?:\s+(?:maybe|possibly))?|someday|eventually|(?:been |still )?thinking about|considering|toying with(?: the idea of)?|maybe)\b/i;

/** A plain-language answer to the §9 clarify question, resolved the "still exploring" way. */
const EXPLICIT_DEFERRAL_RE =
  /\b(?:still (?:just )?thinking|not ready(?: yet)?|still turning it over|still deciding|just thinking(?: about it)?)\b/i;

/** A plain-language answer to the §9 clarify question, resolved the "ready" way. */
const READY_AFFIRMATION_RE = /\b(?:ready to start|ready to begin|i'?m ready|let'?s do this)\b/i;

/**
 * Outcome-level doubt (§6) — uncertainty about whether the *venture* will
 * succeed (audience, attendance, reception), never about the decision
 * itself. Per §6's rule, this never cancels an otherwise-clear
 * commitment — it becomes the first thing discovery addresses.
 */
const OUTCOME_DOUBT_RE =
  /\b(?:don'?t know if (?:anyone|people|folks|it)|not sure (?:if|whether) (?:anyone|people|folks|it)|worried (?:that )?(?:no\s?one|nobody)|afraid (?:that )?(?:no\s?one|nobody)|no\s?one (?:will|would|might) (?:show|come|attend|buy|sign\s?up))\b/i;

/** Pronoun-based commitment referring to something already being discussed (§4.4, §8). */
const PRONOUN_COMMITMENT_RE =
  /\blet'?s (?:build|create|do|start|make) (?:it|that|this)\b|\b(?:build|do|start|make) it\b/i;

/** A founder explicitly selecting one of several already-named possibilities (§4.3, §8). */
const SELECTION_PHRASE_RE =
  /\blet'?s start with|\bstart with|\blet'?s begin with|\bbegin with|\blet'?s do\b|\bi'?ll (?:do|start with|begin with)|\bgoing with\b|\bi want to do\b/i;

/** Asking for help is still commitment, not lower-commitment (§4.2). */
const NEED_HELP_RE = /\bneed(?:s|ed)? (?:some )?help\b/i;

/** Direct imperative language naming the work by its own noun, not a pronoun (§4.1, §4.4). */
const IMPERATIVE_START_RE = /\blet'?s (?:start|begin|do|build|create|make|work on)\b/i;

const GOING_TO_RE = /\bi'?m (?:going to|gonna)\b/i;

/**
 * A small, Slice-0-scoped stand-in for detecting several named ideas in
 * one message (§5.3, §7). Full reuse of the already-built, already-tested
 * `splitOnConjunctions` (Chamber Activation V2) for this purpose is
 * Slice 3 (WORK_IDENTITY_IMPLEMENTATION_PLAN.md §1) — this function only
 * needs to be correct enough for Slice 0's own acceptance tests, not
 * production-complete.
 */
const LIST_SPLIT_RE = /\s*,\s*|\s+and\s+|\s+&\s+|\s+or\s+/i;

function detectNamedWorkKindsInMessage(text: string): string[] {
  const segments = text
    .split(LIST_SPLIT_RE)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const kinds = new Set<string>();
  for (const segment of segments) {
    const kind = inferDocumentTypeFromCreateText(segment);
    if (kind) kinds.add(kind);
  }
  return Array.from(kinds);
}

/**
 * A founder naming exactly one already-known possibility, following a
 * selection phrase (§4.3). Looks only at the text *after* the selection
 * phrase, so a message that also lists other possibilities earlier
 * ("I have ideas for X, Y, and Z. Let's start with X.") resolves to the
 * one actually selected — not whichever names happen to appear anywhere
 * in the whole message.
 */
function findNamedSelection(
  text: string,
  possibilities: readonly NamedPossibility[],
): NamedPossibility | undefined {
  if (possibilities.length === 0) return undefined;
  const match = SELECTION_PHRASE_RE.exec(text);
  if (!match) return undefined;
  const tail = text.slice(match.index + match[0].length).toLowerCase();
  const matches = possibilities.filter((p) => tail.includes(p.name.toLowerCase()));
  return matches.length === 1 ? matches[0] : undefined;
}

type CommitmentSignal = "verb" | "help_seeking" | "imperative" | null;

function detectCommitmentSignal(text: string): CommitmentSignal {
  if (SIMPLE_CREATE_VERB_RE.test(text)) return "verb";
  if (NEED_HELP_RE.test(text) && inferDocumentTypeFromCreateText(text)) return "help_seeking";
  if (IMPERATIVE_START_RE.test(text)) return "imperative";
  if (GOING_TO_RE.test(text) && inferDocumentTypeFromCreateText(text)) return "imperative";
  if (READY_AFFIRMATION_RE.test(text)) return "imperative";
  return null;
}

/**
 * Given the current recognition context, decide whether the founder just
 * crossed the commitment boundary. Pure — no side effects, no storage
 * reads/writes, no calls into routing or Universal Creation.
 */
export function resolveCommitmentGate(
  context: CommitmentRecognitionContext,
): CommitmentGateResult {
  const text = context.userText.trim();
  const possibilities = context.activePossibilities ?? [];

  // §7 step 1 — a strict precondition, checked first, every time. No
  // language analysis below this line ever runs if the Support Gate has
  // already decided the human state must be addressed this turn (§5.5).
  if (context.supportGateTier === "pause") {
    return { outcome: "explore", reason: "support_gate_pause" };
  }

  if (!text) {
    return { outcome: "explore", reason: "no_signal" };
  }

  // §4.3 / §8 — an explicit, named selection among existing possibilities
  // wins before generic multi-idea detection, so a message that both
  // lists possibilities AND selects one resolves to the selection, not
  // to "multiple, none chosen."
  const selected = findNamedSelection(text, possibilities);
  if (selected) {
    return { outcome: "commit", reason: "named_selection", matchedPossibility: selected };
  }

  // §4.4 / §8 — pronoun-based commitment ("let's build it") has no
  // meaning on its own; it must resolve against what's already being
  // discussed. Exactly one candidate resolves cleanly; more than one is
  // genuine ambiguity — ask, never guess (§8's "must never happen").
  if (PRONOUN_COMMITMENT_RE.test(text)) {
    if (possibilities.length === 1) {
      return {
        outcome: "commit",
        reason: "explicit_transition_phrase",
        matchedPossibility: possibilities[0],
      };
    }
    return {
      outcome: "clarify",
      reason: "ambiguous_referent",
      candidatePossibilities: possibilities,
    };
  }

  // §5.3 / §7 — several named ideas in one message, none of them
  // selected: every one of them stays a possibility. This function
  // returns exactly one outcome per call, so "multiple ideas" structurally
  // cannot produce more than one commitment decision —
  // WORK_IDENTITY_TRANSITION_RULES.md §7's "must never happen" is
  // satisfied by this function's own return shape, not by an extra check.
  if (detectNamedWorkKindsInMessage(text).length > 1) {
    return { outcome: "explore", reason: "unselected_multiple_possibilities" };
  }

  // §5.4 — genuine confusion (the already-existing, already-tested
  // detector) counts as exploration even when a work-object noun is
  // present in the same message.
  if (isGenuineConfusionSignal(text)) {
    return { outcome: "explore", reason: "genuine_confusion" };
  }

  // §4.5 / §9 — a plain answer to Spark's own clarify question, resolved
  // before generic hedge detection so "still just thinking" is read as a
  // deliberate deferral, not accidentally caught by a broader rule.
  if (EXPLICIT_DEFERRAL_RE.test(text)) {
    return { outcome: "explore", reason: "explicit_deferral" };
  }

  // §5.1 — decision-level hedging. Checked before commitment-signal
  // detection so a hedged creation verb ("I might create a workshop
  // someday") is read as exploration, not commitment.
  if (DECISION_HEDGE_RE.test(text)) {
    return { outcome: "explore", reason: "decision_hedge" };
  }

  const signal = detectCommitmentSignal(text);
  if (signal) {
    // §6 — outcome-level doubt never cancels an otherwise-clear
    // commitment; it becomes the first thing discovery addresses.
    if (OUTCOME_DOUBT_RE.test(text)) {
      return { outcome: "commit", reason: "outcome_doubt_with_commitment" };
    }
    return {
      outcome: "commit",
      reason: signal === "help_seeking" ? "help_seeking_commitment" : "unhedged_commitment",
    };
  }

  // §5.2 — a work-object noun with no volitional or imperative language
  // at all is naming, not starting.
  if (inferDocumentTypeFromCreateText(text)) {
    return { outcome: "explore", reason: "naming_without_volition" };
  }

  // No work-object language of any kind — not this gate's concern (§7,
  // step 5); ordinary conversation continues untouched.
  return { outcome: "explore", reason: "no_work_signal" };
}

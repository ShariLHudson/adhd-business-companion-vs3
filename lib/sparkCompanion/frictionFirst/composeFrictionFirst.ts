import { FRICTION_BARRIERS, frictionBarrierById } from "./barriers";
import type {
  FrictionBarrier,
  FrictionBarrierId,
  FrictionFirstSession,
  ResolveFrictionBarrierInput,
  ResolveFrictionBarrierResult,
} from "./types";

const NUMBERED_CHOICE_RE = /^\s*(\d{1,2})\s*[.)]?\s*$/;

function normalizeLabel(text: string): string {
  return text.trim().toLowerCase().replace(/[^\w\s]/g, "");
}

function matchBarrierByText(
  text: string,
  allowedIds: readonly FrictionBarrierId[],
): FrictionBarrier | null {
  const normalized = normalizeLabel(text);
  if (!normalized) return null;

  for (const id of allowedIds) {
    const barrier = frictionBarrierById(id);
    if (!barrier) continue;
    const labelNorm = normalizeLabel(barrier.label);
    if (
      normalized.includes(labelNorm.replace(/\.$/, "")) ||
      labelNorm.includes(normalized)
    ) {
      return barrier;
    }
  }

  const keywordMap: Record<string, FrictionBarrierId> = {
    mind: "mind_full",
    full: "mind_full",
    overload: "mind_full",
    exhaust: "mentally_exhausted",
    tired: "mentally_exhausted",
    worry: "worrying",
    anxious: "worrying",
    big: "task_too_big",
    huge: "task_too_big",
    start: "dont_know_start",
    "don't want": "dont_want_to",
    "dont want": "dont_want_to",
    resistance: "dont_want_to",
    boring: "dont_want_to",
    distract: "attention_pulled",
    pulled: "attention_pulled",
    "something else": "something_else",
    other: "something_else",
  };

  for (const [keyword, id] of Object.entries(keywordMap)) {
    if (allowedIds.includes(id) && normalized.includes(keyword)) {
      return frictionBarrierById(id) ?? null;
    }
  }

  return null;
}

function formatNextStepReply(barrier: FrictionBarrier): string {
  return `${barrier.nextStep}\n\nDoes that feel like the right next step?`;
}

export function resolveFrictionBarrierChoice(
  input: ResolveFrictionBarrierInput,
): ResolveFrictionBarrierResult {
  const text = input.userText.trim();
  const { session } = input;
  const allowed = session.barrierIds;

  const numbered = NUMBERED_CHOICE_RE.exec(text);
  if (numbered) {
    const index = Number.parseInt(numbered[1]!, 10) - 1;
    const id = allowed[index];
    if (id) {
      const barrier = frictionBarrierById(id);
      if (barrier) {
        return {
          kind: barrier.id === "something_else" ? "something_else" : "matched",
          barrier,
          reply:
            barrier.id === "something_else"
              ? "Tell me more — what's getting in the way?"
              : formatNextStepReply(barrier),
        };
      }
    }
  }

  const matched = matchBarrierByText(text, allowed);
  if (matched) {
    if (matched.id === "something_else") {
      return {
        kind: "something_else",
        barrier: matched,
        reply: "Tell me more — what's getting in the way?",
      };
    }
    return { kind: "matched", barrier: matched, reply: formatNextStepReply(matched) };
  }

  if (/something else|other|none of these/i.test(text)) {
    const barrier = frictionBarrierById("something_else");
    if (barrier && allowed.includes("something_else")) {
      return {
        kind: "something_else",
        barrier,
        reply: "Tell me more — what's getting in the way?",
      };
    }
  }

  return { kind: "unrecognized", reply: null };
}

export function buildFrictionFirstBarrierMenu(): string {
  const lines = FRICTION_BARRIERS.map(
    (b, i) => `${i + 1}. ${b.emoji ? `${b.emoji} ` : ""}${b.label}`,
  );
  return lines.join("\n");
}

export function buildFrictionFirstOpeningReply(input: {
  userText: string;
  domain: FrictionFirstSession["domain"];
  focusSituation: FrictionFirstSession["focusSituation"];
}): string {
  const menu = buildFrictionFirstBarrierMenu();

  if (input.domain === "focus") {
    const intro =
      input.focusSituation === "resistance_not_want"
        ? "Sometimes the hard part isn't focus — it's resistance. Let's figure out what's in the way."
        : "There are lots of reasons focus can be difficult. Which of these feels closest today?";
    return `${intro}\n\n${menu}`;
  }

  const domainIntro: Partial<Record<FrictionFirstSession["domain"], string>> = {
    writing: "Writing can stall for many reasons. What is making this difficult today?",
    decision: "Decisions get stuck when something is in the way. Which feels closest?",
    research: "Research overwhelm usually has a root cause. What's getting in the way?",
    planning: "Planning gets heavy when friction builds up. Which of these feels closest today?",
    learning: "Learning slows down when something blocks us. What is making this difficult today?",
    business: "Building a business is a lot — let's find what's making this difficult today.",
  };

  const intro =
    domainIntro[input.domain] ??
    "Before we jump to solutions — what is making this difficult today?";

  return `${intro}\n\n${menu}`;
}

export const FRICTION_FIRST_SHARED_EXPERIENCE_FOCUS =
  "I've learned that when I can't focus, it's almost never because I need to try harder. Usually there's something getting in my way — sometimes my mind is overloaded, sometimes I've been at my desk so long I haven't eaten or stretched. Once I figure out what's really happening, it's much easier to know what will help." as const;

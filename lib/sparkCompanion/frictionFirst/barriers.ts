import type { FrictionBarrier, FrictionBarrierId } from "./types";

/** Universal barrier menu — easy scan, always includes something else. */
export const FRICTION_BARRIERS: readonly FrictionBarrier[] = [
  {
    id: "mind_full",
    emoji: "🧠",
    label: "My mind is full.",
    nextStep: "Let's get everything out of your head first.",
    capabilityHint: "clear-my-mind",
  },
  {
    id: "mentally_exhausted",
    emoji: "😴",
    label: "I'm mentally exhausted.",
    nextStep: "Let's choose something gentler for now.",
    capabilityHint: "peaceful-places",
  },
  {
    id: "worrying",
    emoji: "😟",
    label: "Something is worrying me.",
    nextStep:
      "Let's name what's weighing on you — then decide if we take one small step anyway.",
  },
  {
    id: "task_too_big",
    emoji: "📋",
    label: "The task feels too big.",
    nextStep: "Let's find the smallest possible first step.",
    capabilityHint: "momentum",
  },
  {
    id: "dont_know_start",
    emoji: "🤷",
    label: "I don't know where to start.",
    nextStep: "I'll help you find the first obvious step.",
  },
  {
    id: "dont_want_to",
    emoji: "🚫",
    label: "I just don't want to do it.",
    nextStep:
      "Let's reduce resistance — what's the tiniest piece that feels almost doable?",
  },
  {
    id: "attention_pulled",
    emoji: "✨",
    label: "Something else keeps pulling my attention.",
    nextStep:
      "Let's remove one distraction — or change where you're working for a few minutes.",
    capabilityHint: "focus-audio",
  },
  {
    id: "something_else",
    emoji: "",
    label: "Something else.",
    nextStep: "Tell me more — what's getting in the way?",
  },
] as const;

export function frictionBarrierById(
  id: FrictionBarrierId,
): FrictionBarrier | undefined {
  return FRICTION_BARRIERS.find((b) => b.id === id);
}

export const FRICTION_BARRIER_MENU_IDS: readonly FrictionBarrierId[] =
  FRICTION_BARRIERS.map((b) => b.id);

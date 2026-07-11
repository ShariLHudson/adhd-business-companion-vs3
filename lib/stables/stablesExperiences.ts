import type { StablesExperienceDefinition, StablesExperienceId } from "./types";

/** Primary Stables experiences — placeholders until content ships. */
export const STABLES_EXPERIENCES: readonly StablesExperienceDefinition[] = [
  {
    id: "leadership-lessons",
    title: "Leadership Lessons",
    trademark: "Leadership Lessons",
    summary:
      "Stories of steady direction — leading people and projects without force.",
    qualities: ["leadership", "presence", "communication", "partnership"],
    modalities: ["story", "analogy", "guided-conversation"],
    status: "placeholder",
    placeholderCopy:
      "Leadership Lessons will open here — slow stories and real-world parallels. For now, we can talk through what leadership means for you today.",
    relatedExperienceIds: ["presence-practice", "trust-challenges"],
    relatedRoomIds: ["momentum-institute", "decision-compass"],
  },
  {
    id: "confidence-conversations",
    title: "Confidence Conversations",
    trademark: "Confidence Conversations",
    summary:
      "Warm coaching when doubt is loud — pricing, visibility, and self-trust.",
    qualities: ["confidence", "courage", "emotional-regulation"],
    modalities: ["guided-conversation", "reflection", "confidence-challenge"],
    status: "placeholder",
    placeholderCopy:
      "Confidence Conversations will meet you here — no lecture, just honest talk. What feels hardest to trust about yourself right now?",
    relatedExperienceIds: ["courage-builder", "reflection-moments"],
    relatedRoomIds: ["evidence-vault", "growth-profile", "creative-studio"],
  },
  {
    id: "trust-challenges",
    title: "Trust Challenges",
    trademark: "Trust Challenges",
    summary:
      "Small, safe experiments that rebuild trust — in yourself and in others.",
    qualities: ["trust", "consistency", "partnership"],
    modalities: ["confidence-challenge", "real-world-implementation"],
    status: "placeholder",
    placeholderCopy:
      "Trust Challenges will offer small steps you can try this week. Until then, we can name one trust-building move together.",
    relatedExperienceIds: ["confidence-conversations", "leadership-lessons"],
    relatedRoomIds: ["momentum-institute", "journal"],
  },
  {
    id: "business-analogies",
    title: "Business Analogies",
    trademark: "Business Analogies",
    summary:
      "Stable wisdom translated — partnerships, pacing, and care in business terms.",
    qualities: ["partnership", "patience", "consistency"],
    modalities: ["analogy", "story", "guided-conversation"],
    status: "placeholder",
    placeholderCopy:
      "Business Analogies will connect stable metaphors to your real work. What part of your business feels like it needs steadier hands?",
    relatedExperienceIds: ["leadership-lessons", "calm-under-pressure"],
    relatedRoomIds: ["momentum-institute", "creative-studio"],
  },
  {
    id: "reflection-moments",
    title: "Reflection Moments",
    trademark: "Reflection Moments",
    summary:
      "Quiet pauses — one question at a time, no performance.",
    qualities: ["emotional-regulation", "patience", "presence"],
    modalities: ["reflection", "guided-conversation"],
    status: "placeholder",
    placeholderCopy:
      "Reflection Moments will hold unhurried space here. For now, take a breath — what do you notice in yourself?",
    relatedExperienceIds: ["presence-practice", "confidence-conversations"],
    relatedRoomIds: ["journal", "peaceful-places"],
  },
  {
    id: "presence-practice",
    title: "Presence Practice",
    trademark: "Presence Practice",
    summary:
      "Speaking, networking, and showing up — grounded before you go in.",
    qualities: ["presence", "communication", "calm-under-pressure"],
    modalities: ["simulation", "guided-conversation", "real-world-implementation"],
    status: "placeholder",
    placeholderCopy:
      "Presence Practice will help you rehearse showing up calmly — networking, speaking, hard conversations. What situation is coming up?",
    relatedExperienceIds: ["courage-builder", "calm-under-pressure"],
    relatedRoomIds: ["momentum-institute", "creative-studio"],
  },
  {
    id: "courage-builder",
    title: "Courage Builder",
    trademark: "Courage Builder",
    summary:
      "Naming fear without shame — then one brave step at the gate.",
    qualities: ["courage", "confidence", "emotional-regulation"],
    modalities: ["confidence-challenge", "reflection", "guided-conversation"],
    status: "placeholder",
    placeholderCopy:
      "Courage Builder will walk with you toward what you are avoiding. What would feel brave — and small enough — today?",
    relatedExperienceIds: ["confidence-conversations", "trust-challenges"],
    relatedRoomIds: ["decision-compass", "evidence-vault"],
  },
  {
    id: "calm-under-pressure",
    title: "Calm Under Pressure",
    trademark: "Calm Under Pressure",
    summary:
      "When stakes are high — breath, pace, and clarity before the leap.",
    qualities: ["calm-under-pressure", "emotional-regulation", "presence"],
    modalities: ["simulation", "guided-conversation", "reflection"],
    status: "placeholder",
    placeholderCopy:
      "Calm Under Pressure will practice steady responses when everything speeds up. What's pressing on you right now?",
    relatedExperienceIds: ["presence-practice", "reflection-moments"],
    relatedRoomIds: ["decision-compass", "peaceful-places"],
  },
] as const;

const BY_ID = new Map(
  STABLES_EXPERIENCES.map((experience) => [experience.id, experience]),
);

export function getStablesExperience(
  id: StablesExperienceId,
): StablesExperienceDefinition {
  const experience = BY_ID.get(id);
  if (!experience) {
    throw new Error(`Unknown Stables experience: ${id}`);
  }
  return experience;
}

export function listStablesExperiences(): readonly StablesExperienceDefinition[] {
  return STABLES_EXPERIENCES;
}

/**
 * Seven energy types — each with intentional cognitive refreshers.
 */

import type { RestorationRecommendation, SparkEnergyType } from "./types";

function rec(
  partial: RestorationRecommendation & { energy: SparkEnergyType },
): RestorationRecommendation {
  const { energy: _e, ...rest } = partial;
  return rest;
}

export const SPARK_ENERGY_REGISTRY: Record<
  SparkEnergyType,
  {
    name: string;
    question: string;
    description: string;
    recommendations: readonly RestorationRecommendation[];
  }
> = {
  mental: {
    name: "Mental Energy",
    question: "What would clear some space in your mind?",
    description: "The brain is overloaded — needs unload, structure, or decision support.",
    recommendations: [
      rec({
        id: "clear-my-mind",
        energy: "mental",
        label: "Clear My Mind",
        kind: "place",
        placeId: "clear-my-mind",
        section: "brain-dump",
        reason: "Unload without organizing — make room to think again.",
      }),
      rec({
        id: "visual-thinking",
        energy: "mental",
        label: "Visual Thinking",
        kind: "capability",
        section: "visual-focus",
        reason: "See the tangle on paper instead of holding it all in your head.",
      }),
      rec({
        id: "mind-dump",
        energy: "mental",
        label: "Mind Dump",
        kind: "capability",
        section: "brain-dump",
        reason: "Get it out — sorting can wait.",
      }),
      rec({
        id: "prioritization",
        energy: "mental",
        label: "One Next Step",
        kind: "capability",
        section: "projects",
        reason: "One honest priority — not the whole list.",
      }),
      rec({
        id: "decision-support",
        energy: "mental",
        label: "Decision Compass",
        kind: "place",
        placeId: "decision-compass",
        section: "decision-compass",
        reason: "When choosing feels heavier than doing.",
      }),
    ],
  },
  emotional: {
    name: "Emotional Energy",
    question: "What would help you feel a little more hopeful?",
    description: "Discouraged or depleted — needs warmth, evidence, or quiet celebration.",
    recommendations: [
      rec({
        id: "growth-journal",
        energy: "emotional",
        label: "Journal",
        kind: "place",
        placeId: "journal",
        section: "journal",
        reason: "Name what you're carrying — without fixing it yet.",
      }),
      rec({
        id: "evidence-vault",
        energy: "emotional",
        label: "Evidence Vault",
        kind: "place",
        placeId: "evidence-vault",
        section: "portfolio",
        reason: "Remember what you've already done — quietly.",
      }),
      rec({
        id: "celebration-hall",
        energy: "emotional",
        label: "Celebration Hall",
        kind: "place",
        placeId: "portfolio",
        reason: "A win worth noticing — even a small one.",
      }),
      rec({
        id: "coffee-house",
        energy: "emotional",
        label: "Coffee House",
        kind: "place",
        placeId: "coffee-house",
        reason: "Warm conversation — you're not alone in this.",
      }),
      rec({
        id: "prayer-journal",
        energy: "emotional",
        label: "Prayer Journal",
        kind: "place",
        placeId: "journal",
        section: "journal",
        reason: "When you need stillness more than answers.",
      }),
    ],
  },
  creative: {
    name: "Creative Energy",
    question: "What might loosen the ideas that feel stuck?",
    description: "Creatively blocked — needs inspiration, play, or a different angle.",
    recommendations: [
      rec({
        id: "art-studio",
        energy: "creative",
        label: "Art Studio",
        kind: "place",
        placeId: "art-studio",
        section: "games",
        reason: "Make something imperfect — permission to explore.",
      }),
      rec({
        id: "gallery",
        energy: "creative",
        label: "Gallery",
        kind: "place",
        placeId: "gallery-of-firsts",
        reason: "See what you've made before — it counts.",
      }),
      rec({
        id: "observatory",
        energy: "creative",
        label: "Observatory",
        kind: "place",
        placeId: "observatory",
        reason: "Step back and look at the bigger picture.",
      }),
      rec({
        id: "inspiration",
        energy: "creative",
        label: "Something inspiring",
        kind: "guide_story",
        spreadId: "observatory",
        reason: "A story that opens the mind without demanding output.",
      }),
    ],
  },
  sensory: {
    name: "Sensory Energy",
    question: "What would calm the noise around you?",
    description: "Overstimulated — needs beauty, quiet, breath, or gentle sound.",
    recommendations: [
      rec({
        id: "estate-gardens",
        energy: "sensory",
        label: "Gardens",
        kind: "place",
        placeId: "estate-gardens",
        reason: "Green and slow — let your nervous system exhale.",
      }),
      rec({
        id: "reflection-pond",
        energy: "sensory",
        label: "Pool",
        kind: "place",
        placeId: "reflection-pond",
        reason: "Still water — nothing asked of you.",
      }),
      rec({
        id: "lakeside-hammock",
        energy: "sensory",
        label: "Hammock",
        kind: "place",
        placeId: "lakeside-hammock",
        reason: "Horizontal thinking — rest without guilt.",
      }),
      rec({
        id: "music-room",
        energy: "sensory",
        label: "Music Room",
        kind: "place",
        placeId: "music-room",
        reason: "Sound that carries you somewhere softer.",
      }),
      rec({
        id: "soundscapes",
        energy: "sensory",
        label: "Soundscapes",
        kind: "capability",
        section: "focus-audio",
        reason: "Gentle audio — no decisions required.",
      }),
      rec({
        id: "breathing",
        energy: "sensory",
        label: "Breathing",
        kind: "capability",
        section: "breathe",
        reason: "Three minutes — body before brain.",
      }),
      rec({
        id: "conservatory",
        energy: "sensory",
        label: "Butterfly Conservatory",
        kind: "place",
        placeId: "conservatory",
        spreadId: "butterfly-conservatory",
        reason: "Watch something beautiful become something new.",
      }),
    ],
  },
  play: {
    name: "Play Energy",
    question: "What kind of novelty might wake your brain back up?",
    description: "Needs novelty — intentional cognitive refreshers, not distractions.",
    recommendations: [
      rec({
        id: "spin-wheel",
        energy: "play",
        label: "Today's Adventure",
        kind: "adventure",
        gameId: "spin-wheel",
        reason: "One small Estate adventure — curiosity, not points.",
      }),
      rec({
        id: "quick-games",
        energy: "play",
        label: "Quick Game",
        kind: "game",
        placeId: "game-room",
        section: "games",
        gameId: "focus-sprint",
        reason: "Two minutes of play that resets attention.",
      }),
      rec({
        id: "mini-challenge",
        energy: "play",
        label: "Mini Challenge",
        kind: "game",
        section: "games",
        reason: "A tiny win — momentum through play.",
      }),
      rec({
        id: "momentum-challenge",
        energy: "play",
        label: "Momentum Challenge",
        kind: "capability",
        section: "projects",
        reason: "One random act of progress — small counts.",
      }),
    ],
  },
  curiosity: {
    name: "Curiosity Energy",
    question: "What would feel different for a few minutes?",
    description: "Brain needs something else — story, history, wonder.",
    recommendations: [
      rec({
        id: "estate-guide",
        energy: "curiosity",
        label: "Estate Guide",
        kind: "guide_story",
        spreadId: "butterfly-conservatory",
        reason: "Two pages of Estate story — wander without leaving work behind.",
      }),
      rec({
        id: "great-thinkers",
        energy: "curiosity",
        label: "Great Thinkers",
        kind: "place",
        placeId: "momentum-institute",
        section: "momentum-institute",
        reason: "One idea that shifts how you see the problem.",
      }),
      rec({
        id: "hidden-stories",
        energy: "curiosity",
        label: "Hidden Estate Story",
        kind: "guide_story",
        spreadId: "stables",
        reason: "A corner of the Estate you haven't met yet.",
      }),
      rec({
        id: "estate-history",
        energy: "curiosity",
        label: "Estate History",
        kind: "guide_story",
        spreadId: "spark-estate",
        reason: "Why this place exists — context that restores perspective.",
      }),
      rec({
        id: "gallery-wander",
        energy: "curiosity",
        label: "Gallery",
        kind: "place",
        placeId: "gallery-of-firsts",
        reason: "Look at what you've built — differently.",
      }),
    ],
  },
  social: {
    name: "Social Energy",
    question: "What would help you feel encouraged?",
    description: "Needs connection — warmth, witness, or shared celebration.",
    recommendations: [
      rec({
        id: "coffee-conversation",
        energy: "social",
        label: "Coffee House",
        kind: "place",
        placeId: "coffee-house",
        reason: "Talk it through — I'm here.",
      }),
      rec({
        id: "companion-chat",
        energy: "social",
        label: "Stay and talk",
        kind: "conversation",
        reason: "Sometimes the restoration is company.",
      }),
      rec({
        id: "celebration-share",
        energy: "social",
        label: "Share a Win",
        kind: "place",
        placeId: "portfolio",
        reason: "Let someone witness what you did.",
      }),
      rec({
        id: "celebration-hall-social",
        energy: "social",
        label: "Celebration Hall",
        kind: "place",
        placeId: "portfolio",
        reason: "Quiet celebration — belonging, not performance.",
      }),
    ],
  },
};

export function recommendationsForEnergy(
  energy: SparkEnergyType,
): readonly RestorationRecommendation[] {
  return SPARK_ENERGY_REGISTRY[energy].recommendations;
}

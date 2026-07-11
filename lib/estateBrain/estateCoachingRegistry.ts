/**
 * Estate Coaching Registry — human prescriptions → internal experiences.
 */

import type {
  EstateCoachingPrescription,
  EstateCoachingSituation,
} from "./estateCoachingTypes";

function rx(
  partial: EstateCoachingPrescription,
): EstateCoachingPrescription {
  return partial;
}

const SOMETHING_ELSE: EstateCoachingPrescription = {
  id: "something-else",
  humanLabel: "Something else",
  detail: "Stay here and tell me more",
  spaceId: "conservatory",
  stayInConversation: true,
};

export const ESTATE_COACHING_PRESCRIPTIONS: Record<
  EstateCoachingSituation,
  readonly EstateCoachingPrescription[]
> = {
  focus: [
    rx({
      id: "focus-time-block",
      humanLabel: "Reserve uninterrupted time for this",
      spaceId: "focus-studio",
      section: "focus",
      openSection: "focus",
    }),
    rx({
      id: "focus-clear-mind",
      humanLabel: "Get everything out of your head first",
      spaceId: "clear-my-mind",
      section: "brain-dump",
      openSection: "brain-dump",
    }),
    rx({
      id: "focus-music",
      humanLabel: "Put on something calming while you work",
      spaceId: "music-room",
      section: "focus-audio",
      openSection: "focus-audio",
    }),
    rx({
      id: "focus-breathing",
      humanLabel: "Try a two-minute breathing reset",
      spaceId: "sunroom",
      section: "focus-audio",
      openSection: "breathe",
    }),
    rx({
      id: "focus-body-double",
      humanLabel: "Work beside me for accountability",
      spaceId: "coffee-house",
      stayInConversation: true,
    }),
    rx({
      id: "focus-peaceful-place",
      humanLabel:
        "Move somewhere more peaceful — garden, pool, or hammock",
      spaceId: "gardens",
    }),
    SOMETHING_ELSE,
  ],
  overwhelmed: [
    rx({
      id: "overwhelm-clear-mind",
      humanLabel: "Get everything out of your head first",
      spaceId: "clear-my-mind",
      openSection: "brain-dump",
    }),
    rx({
      id: "overwhelm-journal",
      humanLabel: "Write your thoughts down first",
      spaceId: "journal",
      openSection: "growth-journal",
    }),
    rx({
      id: "overwhelm-coffee",
      humanLabel: "Talk it through somewhere comfortable",
      spaceId: "coffee-house",
    }),
    rx({
      id: "overwhelm-breathing",
      humanLabel: "Try a two-minute breathing reset",
      spaceId: "sunroom",
      openSection: "breathe",
    }),
    rx({
      id: "overwhelm-music",
      humanLabel: "Put on something calming",
      spaceId: "music-room",
      openSection: "focus-audio",
    }),
    rx({
      id: "overwhelm-walk",
      humanLabel: "Take a short walk through the Estate",
      spaceId: "garden-path",
    }),
    SOMETHING_ELSE,
  ],
  creative_block: [
    rx({
      id: "creative-art",
      humanLabel: "Play with visuals until something sparks",
      spaceId: "art-studio",
    }),
    rx({
      id: "creative-create",
      humanLabel: "Start making something — even a rough draft",
      spaceId: "creative-studio",
      openSection: "content-generator",
    }),
    rx({
      id: "creative-observatory",
      humanLabel: "Step back and look at the bigger picture",
      spaceId: "observatory",
    }),
    rx({
      id: "creative-coffee",
      humanLabel: "Think out loud somewhere comfortable",
      spaceId: "coffee-house",
    }),
    rx({
      id: "creative-visual",
      humanLabel: "Map your ideas on a wall first",
      spaceId: "creative-studio",
      openSection: "visual-focus",
    }),
    rx({
      id: "creative-visual-thinking",
      humanLabel: "Sort scattered ideas visually",
      spaceId: "creative-studio",
      openSection: "visual-focus",
    }),
    SOMETHING_ELSE,
  ],
  stress: [
    rx({
      id: "stress-garden",
      humanLabel: "Sit in the garden for a few minutes",
      spaceId: "gardens",
    }),
    rx({
      id: "stress-pool",
      humanLabel: "Rest by the pool",
      spaceId: "swimming-pool",
    }),
    rx({
      id: "stress-hammock",
      humanLabel: "Lie in the hammock and let your shoulders drop",
      spaceId: "lakeside-hammock",
    }),
    rx({
      id: "stress-music",
      humanLabel: "Put on something calming",
      spaceId: "music-room",
      openSection: "focus-audio",
    }),
    rx({
      id: "stress-breathing",
      humanLabel: "Try a gentle breathing reset",
      spaceId: "sunroom",
      openSection: "breathe",
    }),
    rx({
      id: "stress-relaxation",
      humanLabel: "Let a quiet place help you settle",
      spaceId: "peaceful-places",
      openSection: "focus-audio",
    }),
    rx({
      id: "stress-journal",
      humanLabel: "Write your thoughts down first",
      spaceId: "journal",
      openSection: "growth-journal",
    }),
  ],
  decision: [
    rx({
      id: "decision-round-table",
      humanLabel: "Talk it through together",
      spaceId: "decision-compass",
      openSection: "decision-compass",
    }),
    rx({
      id: "decision-boardroom",
      humanLabel: "Look at the business side of this",
      spaceId: "round-table",
      openSection: "client-avatars",
    }),
    rx({
      id: "decision-compass",
      humanLabel: "Lay out your options clearly",
      spaceId: "decision-compass",
      openSection: "decision-compass",
    }),
    rx({
      id: "decision-visual",
      humanLabel: "Map the choices visually",
      spaceId: "creative-studio",
      openSection: "visual-focus",
    }),
    rx({
      id: "decision-pros-cons",
      humanLabel: "Walk through pros and cons together",
      spaceId: "decision-compass",
      openSection: "decision-compass",
    }),
    SOMETHING_ELSE,
  ],
  business_growth: [
    rx({
      id: "growth-momentum",
      humanLabel: "Move one important thing forward",
      spaceId: "goals-projects",
      openSection: "projects",
    }),
    rx({
      id: "growth-boardroom",
      humanLabel: "Think through strategy and offers",
      spaceId: "round-table",
      openSection: "client-avatars",
    }),
    rx({
      id: "growth-study",
      humanLabel: "Research and learn what you need",
      spaceId: "study-hall",
      openSection: "momentum-institute",
    }),
    rx({
      id: "growth-create",
      humanLabel: "Build something new for the business",
      spaceId: "creative-studio",
      openSection: "content-generator",
    }),
    rx({
      id: "growth-momentum-plan",
      humanLabel: "Make a plan you can actually follow",
      spaceId: "goals-projects",
      openSection: "projects",
    }),
    SOMETHING_ELSE,
  ],
  motivation: [
    rx({
      id: "motivation-small-step",
      humanLabel: "Find one small step you can touch right now",
      spaceId: "coffee-house",
      stayInConversation: true,
    }),
    rx({
      id: "motivation-clear-mind",
      humanLabel: "Get the noise out of your head first",
      spaceId: "clear-my-mind",
      openSection: "brain-dump",
    }),
    rx({
      id: "motivation-focus-session",
      humanLabel: "Reserve a short focus session",
      spaceId: "focus-studio",
      openSection: "focus",
    }),
    rx({
      id: "motivation-momentum",
      humanLabel: "Pick one thing on your list and move it forward",
      spaceId: "goals-projects",
      openSection: "projects",
    }),
    rx({
      id: "motivation-music",
      humanLabel: "Put on something that helps you settle in",
      spaceId: "music-room",
      openSection: "focus-audio",
    }),
    SOMETHING_ELSE,
  ],
};

export function prescriptionsForSituation(
  situation: EstateCoachingSituation,
): readonly EstateCoachingPrescription[] {
  return ESTATE_COACHING_PRESCRIPTIONS[situation];
}

/**
 * Catalogs for First 60 Days Welcome — welcome lines, discoveries, encouragement.
 * Discoveries ordered by usefulness (not a rigid room tour).
 */

import type {
  First60DiscoveryDefinition,
  First60Encouragement,
  First60WelcomeLine,
} from "./types";

/** Usefulness-guided discovery sequence (one idea per day when eligible). */
export const FIRST_60_DISCOVERY_CATALOG: readonly First60DiscoveryDefinition[] =
  [
    {
      id: "plan-my-day",
      title: "Plan My Day",
      why: "Shape today around what matters without holding the whole day in your head.",
      whyToday: "A gentle plan often makes the rest of the Estate feel lighter.",
      destinationId: "plan-my-day",
      visitRoomIds: ["plan-my-day"],
      usefulnessRank: 1,
    },
    {
      id: "rhythms",
      title: "My Rhythms",
      why: "Soft repeating patterns that support your life — more flexible than rigid habits.",
      whyToday: "Once a day has a shape, rhythms help tomorrow arrive calmer.",
      destinationId: "rhythms",
      visitRoomIds: ["rhythms"],
      usefulnessRank: 2,
    },
    {
      id: "business-profile",
      title: "Business Profile",
      why: "A few details about your business help me support you more personally over time.",
      whyToday: "Even small pieces of your story make every future conversation easier.",
      destinationId: "my-business-estate",
      visitRoomIds: ["my-business-estate", "business-estate"],
      usefulnessRank: 3,
    },
    {
      id: "people-i-help",
      title: "People I Help",
      why: "Clarify who you serve so offers, content, and messaging stay grounded.",
      whyToday: "Knowing who you help makes the next decision feel less abstract.",
      destinationId: "people-i-help",
      visitRoomIds: ["people-i-help", "client-avatars"],
      usefulnessRank: 4,
    },
    {
      id: "create",
      title: "Create",
      why: "A calm place to begin something new without hunting for the right tool.",
      whyToday: "When an idea is ready, Create is where we begin together.",
      destinationId: "create",
      visitRoomIds: ["create", "creative-studio"],
      usefulnessRank: 5,
    },
    {
      id: "projects",
      title: "Projects",
      why: "Give important work a home so you can return without rebuilding the story.",
      whyToday: "Projects keep momentum visible when days get busy.",
      destinationId: "projects",
      visitRoomIds: ["projects", "project-homes"],
      usefulnessRank: 6,
    },
    {
      id: "focus",
      title: "Focus",
      why: "A quieter setting when you need concentration without pressure.",
      whyToday: "Focus is here for the stretches when one thing deserves your full attention.",
      destinationId: "focus-conservatory",
      visitRoomIds: ["focus-conservatory", "focus"],
      usefulnessRank: 7,
    },
    {
      id: "journal-gazebo",
      title: "Journal Gazebo",
      why: "A quiet place to write what is true — without turning it into a task list.",
      whyToday: "Reflection often clarifies tomorrow before the day begins.",
      destinationId: "journal",
      visitRoomIds: ["journal", "journal-gazebo", "growth-journal"],
      usefulnessRank: 8,
    },
    {
      id: "chamber",
      title: "Chamber of Momentum",
      why: "Invite specialized perspectives when you want thoughtful counsel.",
      whyToday: "Some questions feel lighter with another mind in the room.",
      destinationId: "chamber",
      visitRoomIds: ["chamber", "chamber-of-momentum"],
      usefulnessRank: 9,
    },
    {
      id: "boardroom",
      title: "Boardroom",
      why: "Bring several business angles to one question when you want a wider view.",
      whyToday: "Bigger decisions sometimes deserve a table, not just a quick answer.",
      destinationId: "boardroom",
      visitRoomIds: ["boardroom"],
      usefulnessRank: 10,
    },
    {
      id: "estate-library",
      title: "Estate Library",
      why: "A place for thinking with books and quiet — discovery without urgency.",
      whyToday: "Curiosity has a home here whenever you want to wander.",
      destinationId: "library",
      visitRoomIds: ["library", "estate-library"],
      usefulnessRank: 11,
    },
    {
      id: "celebration-garden",
      title: "Celebration Garden",
      why: "A gentle place to notice what went well — without confetti or pressure.",
      whyToday: "Wins deserve a soft landing, not only a checklist.",
      destinationId: "celebration-garden",
      visitRoomIds: ["celebration-garden", "celebration-room"],
      usefulnessRank: 12,
    },
    {
      id: "evidence-vault",
      title: "Evidence Vault",
      why: "Keep meaningful discoveries about yourself so hard days do not erase them.",
      whyToday: "Evidence waits quietly until you need proof of what you already know.",
      destinationId: "evidence-vault",
      visitRoomIds: ["evidence-vault", "evidence-bank"],
      usefulnessRank: 13,
    },
  ] as const;

export function getFirst60DiscoveryById(
  id: string,
): First60DiscoveryDefinition | null {
  return FIRST_60_DISCOVERY_CATALOG.find((d) => d.id === id) ?? null;
}

/** Daily welcome presence lines — unique rotation; never exact same two mornings in a row. */
export const FIRST_60_WELCOME_LINES: readonly First60WelcomeLine[] = [
  {
    id: "w01",
    text: "It's good to see you. You do not have to remember everything or decide it all at once.",
  },
  {
    id: "w02",
    text: "I'm glad you're here. We can keep today simple and still make something meaningful.",
  },
  {
    id: "w03",
    text: "Welcome home. Nothing urgent is waiting for you — just a calm place to begin.",
  },
  {
    id: "w04",
    text: "It's a new morning. We'll take one helpful step at a time.",
  },
  {
    id: "w05",
    text: "I'm here with you. Whatever feels heavy can wait until you're ready.",
  },
  {
    id: "w06",
    text: "Good to have you back. Your work is still here whenever you want it.",
  },
  {
    id: "w07",
    text: "There's no rush this morning. We'll find what matters and leave the rest.",
  },
  {
    id: "w08",
    text: "I'm glad you came. Even a small start counts as a real day.",
  },
  {
    id: "w09",
    text: "Settle in. We can talk, plan, or simply decide what would feel useful.",
  },
  {
    id: "w10",
    text: "You don't have to catch up on everything. One clear next step is enough.",
  },
  {
    id: "w11",
    text: "It's peaceful here. Tell me what would help — or choose a familiar path below.",
  },
  {
    id: "w12",
    text: "I'm with you for whatever today needs — progress, clarity, or a softer landing.",
  },
  {
    id: "w13",
    text: "Another day in the Estate. We'll keep the noise low and the next step clear.",
  },
  {
    id: "w14",
    text: "Welcome. Your pace is the right pace — we can begin whenever you're ready.",
  },
  {
    id: "w15",
    text: "I'm glad you're here. Let's make today feel a little lighter than yesterday.",
  },
  {
    id: "w16",
    text: "Nothing has to be figured out all at once. We can start with what feels kind.",
  },
  {
    id: "w17",
    text: "It's good to see you again. The Estate remembered you were coming home.",
  },
  {
    id: "w18",
    text: "Take a breath. We'll choose one useful direction and leave the rest for later.",
  },
  {
    id: "w19",
    text: "I'm here. Whether you want momentum or quiet company, we can begin gently.",
  },
  {
    id: "w20",
    text: "A fresh morning. We'll honor what matters and skip what doesn't.",
  },
] as const;

export const FIRST_60_ENCOURAGEMENTS: readonly First60Encouragement[] = [
  { id: "e01", text: "Small steps still move a business forward." },
  { id: "e02", text: "Clarity often arrives after one honest conversation." },
  { id: "e03", text: "You do not have to earn rest before you take it." },
  { id: "e04", text: "Returning is progress — even after a hard week." },
  { id: "e05", text: "One finished thing can change the feeling of a whole day." },
  { id: "e06", text: "Your pace can be gentle and still be real." },
  { id: "e07", text: "Curiosity is a valid way to begin." },
  { id: "e08", text: "You already know more than the overwhelm suggests." },
  { id: "e09", text: "Protecting your energy is part of building well." },
  { id: "e10", text: "Tomorrow gets easier when today stays simple." },
  { id: "e11", text: "You are allowed to change your mind mid-day." },
  { id: "e12", text: "Progress counts even when no one else sees it." },
  { id: "e13", text: "A calm start is still a start." },
  { id: "e14", text: "Trust grows in small, honest moments." },
  { id: "e15", text: "You belong here whether you produce or simply arrive." },
] as const;

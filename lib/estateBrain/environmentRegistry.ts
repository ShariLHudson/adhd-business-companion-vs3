/**
 * Estate Environment Registry — every navigable environment (single source of truth).
 *
 * Members think in goals. Spark chooses the environment automatically.
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateIntentCategory } from "./intentCategories";

export type EstateConversationStyle =
  | "creative-collaboration"
  | "reflective-writing"
  | "research-companion"
  | "decision-facilitation"
  | "calm-restoration"
  | "coaching"
  | "playful-reset";

export type EstateEnvironment = {
  id: string;
  name: string;
  purpose: string;
  bestFor: readonly string[];
  capabilities: readonly string[];
  tools: readonly string[];
  relatedSpaceIds: readonly string[];
  suggestedNextSpaceIds: readonly string[];
  conversationStyle: EstateConversationStyle;
  ambientExperience?: string;
  /** Canonical place id for navigation */
  spaceId: string;
  primarySection?: AppSection;
  /** Intent categories this environment serves well */
  intentCategories: readonly EstateIntentCategory[];
  triggers: readonly string[];
};

export const ESTATE_ENVIRONMENTS: readonly EstateEnvironment[] = [
  {
    id: "create-studio",
    name: "Create Studio",
    purpose: "Creating structured documents and assets.",
    bestFor: [
      "Emails",
      "SOPs",
      "Newsletters",
      "Guides",
      "Templates",
      "PDFs",
      "Proposals",
      "Documents",
    ],
    capabilities: ["Email", "SOP", "Newsletter", "Proposal", "Template"],
    tools: [
      "Email Builder",
      "Newsletter Builder",
      "SOP Builder",
      "Template Library",
    ],
    relatedSpaceIds: ["momentum-builder", "art-studio", "round-table"],
    suggestedNextSpaceIds: ["goals-projects", "round-table"],
    conversationStyle: "creative-collaboration",
    ambientExperience: "warm studio light",
    spaceId: "creative-studio",
    primarySection: "content-generator",
    intentCategories: ["create"],
    triggers: [
      "email",
      "sop",
      "newsletter",
      "proposal",
      "template",
      "document",
      "write an",
      "create a",
      "draft",
    ],
  },
  {
    id: "writing-room",
    name: "Writing Room",
    purpose: "Long-form writing and development.",
    bestFor: [
      "Books",
      "Articles",
      "Courses",
      "Scripts",
      "Blogs",
      "Personal Writing",
    ],
    capabilities: ["Long-form writing", "Outlines", "Chapters", "Revision"],
    tools: ["Chapter Manager", "Writing Companion", "Outline Builder"],
    relatedSpaceIds: ["creative-studio", "library", "journal"],
    suggestedNextSpaceIds: ["creative-studio", "journal"],
    conversationStyle: "reflective-writing",
    ambientExperience: "quiet pages",
    spaceId: "decision-compass",
    primarySection: "content-generator",
    intentCategories: ["create"],
    triggers: [
      "book",
      "chapter",
      "article",
      "blog",
      "script",
      "long form",
      "develop ideas",
      "brainstorm and write",
    ],
  },
  {
    id: "visual-thinking-studio",
    name: "Visual Thinking Studio",
    purpose: "Organize ideas visually.",
    bestFor: [
      "Mind Maps",
      "Too many ideas",
      "Brainstorming",
      "Decision trees",
      "Flowcharts",
    ],
    capabilities: ["Visual Thinking", "Mind Maps", "Whiteboards"],
    tools: ["Mind Map", "Visual Focus", "Whiteboard"],
    relatedSpaceIds: ["creative-studio", "round-table", "clear-my-mind"],
    suggestedNextSpaceIds: ["creative-studio", "goals-projects"],
    conversationStyle: "creative-collaboration",
    spaceId: "creative-studio",
    primarySection: "visual-focus",
    intentCategories: ["visual_thinking", "create"],
    triggers: [
      "too many ideas",
      "mind map",
      "all over the place",
      "scattered",
      "map this out",
      "visual thinking",
      "brainstorm",
    ],
  },
  {
    id: "study-hall",
    name: "Study Hall",
    purpose: "Research and learning.",
    bestFor: [
      "Research",
      "Teaching",
      "Comparisons",
      "Great Thinkers",
      "Courses",
      "Analysis",
    ],
    capabilities: ["Research", "Compare", "Summarize", "Learn"],
    tools: [
      "Research Assistant",
      "Compare Tool",
      "Knowledge Library",
      "Citation Builder",
    ],
    relatedSpaceIds: ["library", "observatory", "round-table"],
    suggestedNextSpaceIds: ["creative-studio", "goals-projects"],
    conversationStyle: "research-companion",
    ambientExperience: "library quiet",
    spaceId: "study-hall",
    primarySection: "momentum-institute",
    intentCategories: ["learn"],
    triggers: [
      "research",
      "competitors",
      "compare",
      "study",
      "learn",
      "analyze",
      "latest",
      "newest",
    ],
  },
  {
    id: "momentum",
    name: "Momentum",
    purpose: "Turning ideas into progress.",
    bestFor: [
      "Projects",
      "Goals",
      "Marketing",
      "Business Planning",
      "Roadmaps",
      "Execution",
      "Weekly Planning",
    ],
    capabilities: ["Projects", "Planning", "Roadmaps", "Goals"],
    tools: ["Marketing Planner", "Project Board", "Weekly Plan", "Roadmap"],
    relatedSpaceIds: ["creative-studio", "round-table", "study-hall"],
    suggestedNextSpaceIds: ["creative-studio", "celebration-room"],
    conversationStyle: "coaching",
    spaceId: "goals-projects",
    primarySection: "projects",
    intentCategories: ["plan"],
    triggers: [
      "plan",
      "roadmap",
      "goal",
      "project",
      "marketing strategy",
      "quarter",
      "weekly",
      "launch plan",
    ],
  },
  {
    id: "boardroom",
    name: "Boardroom",
    purpose: "Business decisions and operations.",
    bestFor: [
      "Offers",
      "Pricing",
      "Launches",
      "Business Strategy",
      "Decision Making",
      "Growth",
    ],
    capabilities: ["Strategy", "Offers", "Pricing", "CRM", "Funnels"],
    tools: ["Client Avatar", "Offer Builder", "Funnel Map", "CRM"],
    relatedSpaceIds: ["goals-projects", "creative-studio", "study-hall"],
    suggestedNextSpaceIds: ["goals-projects", "creative-studio"],
    conversationStyle: "decision-facilitation",
    spaceId: "round-table",
    primarySection: "client-avatars",
    intentCategories: ["business"],
    triggers: [
      "business",
      "offer",
      "pricing",
      "client avatar",
      "funnel",
      "crm",
      "build my business",
    ],
  },
  {
    id: "round-table",
    name: "Round Table",
    purpose: "Collaborative thinking.",
    bestFor: [
      "Brainstorming",
      "Pros and Cons",
      "Decision Support",
      "Creative Discussions",
    ],
    capabilities: ["Decide", "Compare options", "Think through"],
    tools: ["Decision Compass", "Pros & Cons"],
    relatedSpaceIds: ["study-hall", "momentum-builder", "creative-studio"],
    suggestedNextSpaceIds: ["goals-projects", "creative-studio"],
    conversationStyle: "decision-facilitation",
    spaceId: "decision-compass",
    primarySection: "decision-compass",
    intentCategories: ["plan", "business", "learn"],
    triggers: [
      "think this through",
      "pros and cons",
      "can't decide",
      "stuck between",
      "help me decide",
    ],
  },
  {
    id: "art-studio",
    name: "Art Studio",
    purpose: "Visual creativity.",
    bestFor: [
      "AI Images",
      "Logos",
      "Mockups",
      "Vision Boards",
      "Mood Boards",
      "Social Graphics",
    ],
    capabilities: ["Images", "Visual design", "Brand assets"],
    tools: ["AI Image", "Vision Board"],
    relatedSpaceIds: ["creative-studio", "portfolio"],
    suggestedNextSpaceIds: ["creative-studio", "portfolio"],
    conversationStyle: "creative-collaboration",
    spaceId: "art-studio",
    intentCategories: ["create"],
    triggers: ["image", "logo", "vision board", "mockup", "graphic"],
  },
  {
    id: "journal-gazebo",
    name: "Journal Gazebo",
    purpose: "Reflection and capture.",
    bestFor: [
      "Daily Journals",
      "Prayer",
      "Gratitude",
      "Memories",
      "Accomplishments",
    ],
    capabilities: ["Journal", "Reflection", "Gratitude", "Prayer"],
    tools: ["Personal Journal", "Gratitude", "Prayer"],
    relatedSpaceIds: ["library", "gardens", "evidence-vault"],
    suggestedNextSpaceIds: ["evidence-vault", "celebration-room"],
    conversationStyle: "reflective-writing",
    ambientExperience: "garden breeze",
    spaceId: "journal",
    primarySection: "growth-journal",
    intentCategories: ["reflect"],
    triggers: ["journal", "gratitude", "pray", "reflect", "capture"],
  },
  {
    id: "music-room",
    name: "Music Room",
    purpose: "Audio experience.",
    bestFor: ["Focus Music", "Relaxation", "Creative Music", "Ambient Sound"],
    capabilities: ["Music", "Soundscapes", "Focus audio"],
    tools: ["Focus Music", "Ambient Audio"],
    relatedSpaceIds: ["peaceful-places", "focus-studio", "coffee-house"],
    suggestedNextSpaceIds: ["focus-studio", "peaceful-places"],
    conversationStyle: "calm-restoration",
    spaceId: "music-room",
    primarySection: "focus-audio",
    intentCategories: ["restore", "focus"],
    triggers: ["music", "soundscape", "listen", "ambient"],
  },
  {
    id: "coffee-house",
    name: "Coffee House",
    purpose: "Casual conversation and thinking.",
    bestFor: [
      "Thinking",
      "Conversation",
      "Brainstorming",
      "Friendly Discussion",
    ],
    capabilities: ["Conversation", "Light brainstorm"],
    tools: ["Ambient café"],
    relatedSpaceIds: ["library", "creative-studio"],
    suggestedNextSpaceIds: ["creative-studio", "journal"],
    conversationStyle: "creative-collaboration",
    ambientExperience: "café warmth",
    spaceId: "coffee-house",
    intentCategories: ["create", "reflect"],
    triggers: ["coffee", "casual", "think out loud"],
  },
  {
    id: "focus-room",
    name: "Focus Room",
    purpose: "Concentration and deep work.",
    bestFor: ["Focus sessions", "Pomodoro", "Body doubling", "Deep work"],
    capabilities: ["Focus", "Pomodoro", "Body doubling"],
    tools: ["Focus Session", "Pomodoro", "Focus Timer"],
    relatedSpaceIds: ["music-room", "coffee-house"],
    suggestedNextSpaceIds: ["goals-projects"],
    conversationStyle: "coaching",
    spaceId: "focus-studio",
    primarySection: "focus",
    intentCategories: ["focus"],
    triggers: ["focus", "concentrate", "pomodoro", "body double", "deep work"],
  },
  {
    id: "sunroom",
    name: "Sunroom",
    purpose: "Gentle restoration.",
    bestFor: ["Breathing", "Grounding", "Calm", "Reset"],
    capabilities: ["Breathing", "Meditation", "Grounding"],
    tools: ["Breathing", "Grounding", "Relaxation"],
    relatedSpaceIds: ["clear-my-mind", "peaceful-places", "music-room"],
    suggestedNextSpaceIds: ["journal", "goals-projects"],
    conversationStyle: "calm-restoration",
    ambientExperience: "daylight calm",
    spaceId: "sunroom",
    primarySection: "focus-audio",
    intentCategories: ["restore"],
    triggers: ["calm down", "breathe", "relax", "meditate", "reset", "anxious"],
  },
  {
    id: "clear-my-mind",
    name: "Clear My Mind",
    purpose: "Empty a crowded head.",
    bestFor: ["Brain dump", "Scattered thoughts", "Mental unload"],
    capabilities: ["Brain dump", "Thought capture"],
    tools: ["Brain Dump"],
    relatedSpaceIds: ["sunroom", "visual-thinking-studio", "journal-gazebo"],
    suggestedNextSpaceIds: ["visual-thinking-studio", "momentum"],
    conversationStyle: "calm-restoration",
    spaceId: "clear-my-mind",
    primarySection: "brain-dump",
    intentCategories: ["restore", "visual_thinking"],
    triggers: ["clear my mind", "brain dump", "too much in my head", "crowded head"],
  },
] as const;

const BY_ID = new Map<string, EstateEnvironment>(
  ESTATE_ENVIRONMENTS.map((e) => [e.id, e]),
);

export function estateEnvironmentById(id: string): EstateEnvironment | undefined {
  return BY_ID.get(id);
}

export function estateEnvironmentBySpaceId(
  spaceId: string,
): EstateEnvironment | undefined {
  return ESTATE_ENVIRONMENTS.find((e) => e.spaceId === spaceId);
}

export function environmentsForIntent(
  intent: EstateIntentCategory,
): EstateEnvironment[] {
  return ESTATE_ENVIRONMENTS.filter((e) =>
    e.intentCategories.includes(intent),
  );
}

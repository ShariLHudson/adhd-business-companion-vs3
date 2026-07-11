/**
 * Shared Capability catalog — 12 reusable skills (Estate 133–137).
 * Never expose as GPTs.
 */

import type { SharedCapability, SharedCapabilityId } from "./types";

export const SHARED_CAPABILITY_CATALOG: Readonly<
  Record<SharedCapabilityId, SharedCapability>
> = {
  decision_making: {
    id: "decision_making",
    officialName: "Decision making",
    category: "thinking",
    purpose: "Help the member choose among real options without overwhelm.",
    coreQuestion: "What choice serves me best right now?",
    specDoc: 133,
    inputs: ["options", "stakes", "energy", "values"],
    outputs: ["clarified_decision", "tradeoffs", "member_choice"],
    composableWith: [
      "planning",
      "problem_solving",
      "reflection",
      "communication",
    ],
    roomHints: ["decision-compass", "round-table", "coffee-house"],
    neverExposeAs: ["Decision GPT", "Choice Bot", "Decision Maker GPT"],
    companionLine: "Let's look at your options.",
    intentPatterns: [
      /\b(?:help me (?:decide|choose)|should i|which (?:one|option)|can'?t decide|torn between)\b/i,
      /\b(?:decision|decide between|weigh (?:my )?options)\b/i,
    ],
  },
  planning: {
    id: "planning",
    officialName: "Planning",
    category: "thinking",
    purpose: "Turn intention into a humane sequence of next steps.",
    coreQuestion: "What is the smallest plan that still moves me forward?",
    specDoc: 133,
    inputs: ["outcome", "constraints", "energy", "time"],
    outputs: ["small_plan", "next_step", "adjust_room"],
    composableWith: [
      "decision_making",
      "organization",
      "problem_solving",
      "content_creation",
    ],
    roomHints: ["plan-my-day", "momentum-institute", "creative-studio"],
    neverExposeAs: ["Planner GPT", "Plan Bot"],
    companionLine: "We can sketch a small plan.",
    intentPatterns: [
      /\b(?:plan (?:my|the)|make a plan|break (?:this|it) down|next steps?|roadmap)\b/i,
      /\b(?:how (?:do|should) i (?:start|approach)|what(?:'s| is) (?:my|the) plan)\b/i,
    ],
  },
  problem_solving: {
    id: "problem_solving",
    officialName: "Problem solving",
    category: "thinking",
    purpose: "Untangle stuck situations into workable moves.",
    coreQuestion: "What is actually in the way — and what can we try?",
    specDoc: 133,
    inputs: ["problem_statement", "constraints", "fears", "facts"],
    outputs: ["problem_frame", "experiment", "optional_preserve"],
    composableWith: ["decision_making", "research", "strategy", "reflection"],
    roomHints: ["momentum-institute", "study-hall", "conservatory"],
    neverExposeAs: ["Problem Solver GPT", "Fix-It Bot"],
    companionLine: "Let's untangle what's in the way.",
    intentPatterns: [
      /\b(?:stuck|problem|issue|not working|how (?:do|can) i (?:fix|solve)|figure out)\b/i,
      /\b(?:troubleshoot|workaround|blocked)\b/i,
    ],
  },
  strategy: {
    id: "strategy",
    officialName: "Strategy",
    category: "thinking",
    purpose: "Connect today’s action to a longer direction without drowning in plans.",
    coreQuestion: "How does this move fit the bigger picture?",
    specDoc: 133,
    inputs: ["goal", "audience", "constraints", "horizon"],
    outputs: ["strategic_focus", "leverage", "deferred_detail"],
    composableWith: [
      "planning",
      "research",
      "content_creation",
      "organization",
    ],
    roomHints: ["strategy-studio", "round-table", "observatory"],
    neverExposeAs: ["Strategy GPT", "Business Coach Bot"],
    companionLine: "Let's connect this to the bigger picture.",
    intentPatterns: [
      /\b(?:strateg(?:y|ic)|positioning|go[- ]to[- ]market|bigger picture|long[- ]term)\b/i,
      /\b(?:business (?:plan|direction)|competitive)\b/i,
    ],
  },
  brainstorming: {
    id: "brainstorming",
    officialName: "Brainstorming",
    category: "creative",
    purpose: "Generate possibilities without premature judgment.",
    coreQuestion: "What else could be true or useful here?",
    specDoc: 134,
    inputs: ["topic", "constraints", "audience"],
    outputs: ["idea_list", "themes", "favorites"],
    composableWith: [
      "content_creation",
      "strategy",
      "problem_solving",
      "planning",
    ],
    roomHints: ["creative-studio", "conservatory", "apple-orchard"],
    neverExposeAs: ["Brainstorm GPT", "Ideation Bot"],
    companionLine: "Want to generate a few ideas first?",
    intentPatterns: [
      /\b(?:brainstorm|ideas? for|riff on|what if we|possibilities)\b/i,
      /\b(?:come up with|ideate|spitball)\b/i,
    ],
  },
  content_creation: {
    id: "content_creation",
    officialName: "Content creation",
    category: "creative",
    purpose: "Help the member draft meaningful words, assets, or messages.",
    coreQuestion: "What do I want to say — and to whom?",
    specDoc: 134,
    inputs: ["intent", "audience", "voice", "format"],
    outputs: ["draft", "revisions", "optional_adapter"],
    composableWith: [
      "brainstorming",
      "strategy",
      "communication",
      "organization",
    ],
    roomHints: ["creative-studio"],
    neverExposeAs: [
      "Content GPT",
      "Copywriter Bot",
      "PostCraft GPT",
      "Writer GPT",
    ],
    companionLine: "I can help you draft that.",
    intentPatterns: [
      /\b(?:write|draft|create|compose)\b.+\b(?:post|email|newsletter|script|copy|caption|blog)\b/i,
      /\b(?:help me (?:write|draft)|content for|social post)\b/i,
    ],
  },
  research: {
    id: "research",
    officialName: "Research",
    category: "knowledge",
    purpose: "Gather and organize information needed to decide or create.",
    coreQuestion: "What do we need to know before we move?",
    specDoc: 135,
    inputs: ["research_question", "known_context"],
    outputs: ["summary", "uncertainty", "sources_note"],
    composableWith: [
      "strategy",
      "problem_solving",
      "learning",
      "content_creation",
    ],
    roomHints: ["momentum-institute", "library", "study-hall"],
    neverExposeAs: ["Research GPT", "Analyst Bot"],
    companionLine: "I can help us find what we need to know.",
    intentPatterns: [
      /\b(?:research|look up|find out|what is|explain|compare)\b/i,
      /\b(?:latest|trending|market (?:data|research))\b/i,
    ],
  },
  learning: {
    id: "learning",
    officialName: "Learning",
    category: "knowledge",
    purpose: "Help the member absorb, practice, and retain what matters.",
    coreQuestion: "What should stick — and how shall we practice it?",
    specDoc: 135,
    inputs: ["topic", "current_level", "goal"],
    outputs: ["small_lesson", "practice", "optional_preserve"],
    composableWith: ["research", "reflection", "planning", "organization"],
    roomHints: ["library", "greenhouse", "momentum-institute"],
    neverExposeAs: ["Tutor GPT", "Course Bot", "Teacher GPT"],
    companionLine: "We can learn this in a small, usable piece.",
    intentPatterns: [
      /\b(?:teach me|learn|how (?:does|do) .+ work|help me understand|practice)\b/i,
      /\b(?:explain (?:like|simply)|walk me through)\b/i,
    ],
  },
  reflection: {
    id: "reflection",
    officialName: "Reflection",
    category: "relational",
    purpose: "Help the member make meaning from experience without forcing journaling.",
    coreQuestion: "What does this mean for me?",
    specDoc: 136,
    inputs: ["experience", "feelings", "context"],
    outputs: ["meaning", "optional_preserve", "optional_celebrate"],
    composableWith: [
      "celebration",
      "learning",
      "problem_solving",
      "decision_making",
    ],
    roomHints: [
      "journal",
      "gardens",
      "seat-at-pond",
      "legacy-studio",
    ],
    neverExposeAs: ["Journal GPT", "Therapy Bot", "Reflection GPT"],
    companionLine: "Want to sit with what this means?",
    intentPatterns: [
      /\b(?:reflect|reflection|what (?:does|did) (?:this|it) mean|process (?:this|it)|journal)\b/i,
      /\b(?:how (?:am|do) i feel|make sense of)\b/i,
    ],
  },
  communication: {
    id: "communication",
    officialName: "Communication",
    category: "relational",
    purpose: "Help the member say hard or important things clearly and kindly.",
    coreQuestion: "How do I say this so it lands?",
    specDoc: 136,
    inputs: ["relationship", "stakes", "message_intent"],
    outputs: ["tone_options", "draft_message", "practice"],
    composableWith: [
      "content_creation",
      "decision_making",
      "strategy",
      "reflection",
    ],
    roomHints: ["creative-studio", "coffee-house", "round-table"],
    neverExposeAs: ["Communication Coach GPT", "Email Bot", "Script GPT"],
    companionLine: "I can help you say this so it lands.",
    intentPatterns: [
      /\b(?:how (?:do|should) i (?:say|tell|ask)|hard conversation|reply to|respond to)\b/i,
      /\b(?:word this|tone|message to|email (?:to|about))\b/i,
    ],
  },
  organization: {
    id: "organization",
    officialName: "Organization",
    category: "life_flow",
    purpose: "Reduce cognitive load by sorting and placing work where it belongs.",
    coreQuestion: "Where does this belong — and what can wait?",
    specDoc: 137,
    inputs: ["pile", "priorities", "energy"],
    outputs: ["buckets", "next_action", "parked_items"],
    composableWith: [
      "planning",
      "content_creation",
      "problem_solving",
      "reflection",
    ],
    roomHints: ["clear-my-mind", "goals-projects", "library", "greenhouse"],
    neverExposeAs: ["Organizer GPT", "Productivity Bot"],
    companionLine: "We can sort this without shame.",
    intentPatterns: [
      /\b(?:organiz(?:e|ing)|too much|brain dump|sort (?:this|my)|prioritiz|overwhelm(?:ed)?)\b/i,
      /\b(?:where (?:does|do) (?:this|these) belong|clear my mind)\b/i,
    ],
  },
  celebration: {
    id: "celebration",
    officialName: "Celebration",
    category: "life_flow",
    purpose: "Recognize progress with the right intensity — quiet or joyful.",
    coreQuestion: "What deserves to be noticed — and how?",
    specDoc: 137,
    inputs: ["moment", "tone", "member_preference"],
    outputs: ["recognition_offer", "intensity_choice", "optional_preserve"],
    composableWith: ["reflection", "learning", "communication"],
    roomHints: ["gardens", "celebration-room", "gallery-of-firsts"],
    neverExposeAs: ["Celebration GPT", "Wins Bot", "Cheerleader Bot"],
    companionLine: "This sounds worth noticing.",
    intentPatterns: [
      /\b(?:celebrat(?:e|ion)|i (?:did|finished|shipped|launched)|win|milestone|proud of)\b/i,
      /\b(?:good news|finally (?:did|finished)|worth celebrating)\b/i,
    ],
  },
};

export function getSharedCapability(
  id: SharedCapabilityId,
): SharedCapability {
  return SHARED_CAPABILITY_CATALOG[id];
}

export function listSharedCapabilities(): SharedCapability[] {
  return Object.values(SHARED_CAPABILITY_CATALOG);
}

export function isSharedCapabilityId(
  id: string | null | undefined,
): id is SharedCapabilityId {
  return (
    typeof id === "string" &&
    Object.prototype.hasOwnProperty.call(SHARED_CAPABILITY_CATALOG, id)
  );
}

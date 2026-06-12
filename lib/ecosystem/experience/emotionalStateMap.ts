// Founder Ecosystem — Phase 19 Emotional Experience Map.
// What Shari should do, avoid, open, and recommend per emotional state.

import type { AppSection } from "@/lib/companionUi";
import type { FounderEvent } from "../events";
import type { ID } from "../models";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import type { EmotionalGuidance, FounderEmotionalState } from "./experienceTypes";

const STATE_ORDER: FounderEmotionalState[] = [
  "overwhelmed",
  "stuck",
  "burned-out",
  "distracted",
  "motivated",
  "excited",
];

export function detectEmotionalState(
  events: FounderEvent[],
  founderId: ID,
  recentMessage?: string,
  now: Date = new Date(),
): FounderEmotionalState {
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = getFounderIntelligence(mine, founderId, now.toISOString());
  const text = [
    recentMessage ?? "",
    ...mine
      .filter((e) => e.type === "chat.coaching" || e.type === "painpoint.observed")
      .slice(-5)
      .map((e) => String(e.userMessage ?? e.data?.text ?? "")),
  ]
    .join(" ")
    .toLowerCase();

  const scores = new Map<FounderEmotionalState, number>();

  const bump = (s: FounderEmotionalState, n: number) => scores.set(s, (scores.get(s) ?? 0) + n);

  if (/overwhelm|too much|drowning|can't keep up/i.test(text)) bump("overwhelmed", 4);
  if (/stuck|blocked|don't know where|spinning/i.test(text)) bump("stuck", 4);
  if (/exhausted|burned out|burnt out|no energy|drained/i.test(text)) bump("burned-out", 4);
  if (/distracted|shiny|squirrel|context switch/i.test(text)) bump("distracted", 3);
  if (/excited|can't wait|big idea|breakthrough/i.test(text)) bump("excited", 3);
  if (/motivated|ready|let's go|momentum/i.test(text)) bump("motivated", 3);

  if (intel.patterns.some((p) => p.type === "unfinished-tasks")) bump("stuck", 2);
  if (intel.patterns.some((p) => p.type === "project-switching")) bump("distracted", 2);
  if (intel.patterns.some((p) => p.type === "low-energy-checkins")) bump("burned-out", 2);

  const checkins = mine.filter((e) => e.type === "checkin.recorded").slice(-1)[0];
  if (checkins?.data?.energy === "low") bump("burned-out", 2);
  if (checkins?.data?.motivation === "high" && checkins?.data?.energy !== "low") bump("motivated", 2);

  let best: FounderEmotionalState = "motivated";
  let bestScore = 0;
  for (const s of STATE_ORDER) {
    const sc = scores.get(s) ?? 0;
    if (sc > bestScore) {
      best = s;
      bestScore = sc;
    }
  }
  return bestScore > 0 ? best : "motivated";
}

const GUIDANCE: Record<
  FounderEmotionalState,
  Omit<EmotionalGuidance, "state">
> = {
  overwhelmed: {
    shariShould: [
      "Validate the load — normalize that it's a lot.",
      "Offer one next step, not a full replan.",
      "Suggest Clear My Mind to offload.",
    ],
    shariShouldAvoid: [
      "Long priority lists.",
      "Introducing new tools or automations.",
      "Urgency language or guilt.",
    ],
    workspace: "brain-dump",
    recommendation: "Let's capture everything on your mind, then pick one 15-minute step.",
    tone: "gentle",
  },
  stuck: {
    shariShould: [
      "Shrink the task until it's obviously doable.",
      "Ask what 'done' looks like for the next 20 minutes.",
      "Offer Spin the Wheel or a default choice.",
    ],
    shariShouldAvoid: [
      "Big strategic questions.",
      "Multiple options without a default.",
      "Assuming lack of effort.",
    ],
    workspace: "projects",
    recommendation: "Open your top project — what's the smallest piece you could finish today?",
    tone: "steady",
  },
  motivated: {
    shariShould: [
      "Channel energy into one priority.",
      "Suggest a time block or focus session.",
      "Celebrate recent wins briefly.",
    ],
    shariShouldAvoid: [
      "Overloading with new ideas.",
      "Slowing down with too much process.",
    ],
    workspace: "time-block",
    recommendation: "Protect a focus block on your top priority while energy is high.",
    tone: "energizing",
  },
  distracted: {
    shariShould: [
      "Name the pattern without judgment.",
      "Recommend one project for today.",
      "Close unrelated loops via capture.",
    ],
    shariShouldAvoid: [
      "Adding more open threads.",
      "Encouraging multitasking.",
    ],
    workspace: "projects",
    recommendation: "Pick one project for today — everything else waits in Clear My Mind.",
    tone: "steady",
  },
  excited: {
    shariShould: [
      "Capture the idea before it fades.",
      "Connect it to an existing project if possible.",
      "Suggest a quick scaffold in Create.",
    ],
    shariShouldAvoid: [
      "Pouring cold water on enthusiasm.",
      "Forcing a huge plan before a draft exists.",
    ],
    workspace: "content-generator",
    recommendation: "Let's capture this while it's hot — draft the outline in Create.",
    tone: "celebratory",
  },
  "burned-out": {
    shariShould: [
      "Prioritize rest and scope reduction.",
      "Offer Breathe & Reset.",
      "Suggest the smallest possible win or pause.",
    ],
    shariShouldAvoid: [
      "Ambitious weekly goals.",
      "Accountability pressure.",
      "Long working sessions.",
    ],
    workspace: "breathe",
    recommendation: "Today might be a recovery day — one tiny win or intentional pause is enough.",
    tone: "gentle",
  },
};

export function getEmotionalGuidance(state: FounderEmotionalState): EmotionalGuidance {
  const g = GUIDANCE[state];
  return { state, ...g };
}

export function workspaceForEmotionalState(state: FounderEmotionalState): AppSection {
  return GUIDANCE[state].workspace;
}

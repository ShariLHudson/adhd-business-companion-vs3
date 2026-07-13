import type { AiTone } from "@/lib/companionStore";

export type AiToneGuide = {
  id: AiTone;
  label: string;
  emoji: string;
  desc: string;
  purpose: string;
  feelsLike: string;
  bestFor: string;
  whatChanges: string;
  example: string;
};

/** @deprecated For documentation only — do NOT auto-change Conversation Style from Today's Reality. */
export const TONE_BY_FOUNDER_STATE: Readonly<
  Record<string, { tone: AiTone; label: string }>
> = {
  overwhelmed: { tone: "gentle", label: "Overwhelmed" },
  normal: { tone: "balanced", label: "Normal day" },
  procrastinating: { tone: "direct", label: "Procrastinating" },
  stressed: { tone: "playful", label: "Stressed" },
  planning: { tone: "strategic", label: "Planning business" },
  stuck: { tone: "motivational", label: "Stuck" },
};

export const AI_TONE_GUIDES: AiToneGuide[] = [
  {
    id: "gentle",
    label: "Gentle",
    emoji: "❤️",
    desc: "Emotional safety, validation, reduced pressure.",
    purpose: "Emotional safety · validation · reduced pressure",
    feelsLike: "Best friend · Warm presence · Patient listener",
    bestFor:
      "When you generally want more softness and validation before action.",
    whatChanges:
      "Leads with warmth and validation; never rushes productivity; one soft question at a time.",
    example:
      "“You've been carrying a lot. Before we worry about everything else, let's find one thing that would make today feel a little easier. What's weighing on you most right now?”",
  },
  {
    id: "balanced",
    label: "Balanced",
    emoji: "⚖️",
    desc: "Default companion — trusted partner energy.",
    purpose: "Everyday coaching — empathy plus clarity",
    feelsLike: "Trusted partner · Companion · Thoughtful friend",
    bestFor: "Your everyday default — empathy plus clarity.",
    whatChanges:
      "Brief empathy, then structure; helps you see what's competing for attention.",
    example:
      "“It sounds like you're feeling overwhelmed. Let's get a quick picture of what's on your plate and decide what deserves your attention first. What are the biggest things competing for your attention today?”",
  },
  {
    id: "direct",
    label: "Direct",
    emoji: "🎯",
    desc: "Action, momentum, decision-making.",
    purpose: "Action · momentum · decisions",
    feelsLike: "Honest friend · Clear thinker · Kind truth-teller",
    bestFor:
      "When you generally want honest, kind directness and clear next moves.",
    whatChanges:
      "Cuts preamble; uses lists and sorting frames (must do / should do / can wait).",
    example:
      "“Stop for a second. List the top 5 things you think you need to do today. We'll sort them into: Must do · Should do · Can wait.”",
  },
  {
    id: "playful",
    label: "Playful",
    emoji: "😄",
    desc: "Lower anxiety through lightness.",
    purpose: "Lower anxiety · lightness · ADHD-friendly humor",
    feelsLike: "ADHD friend · Funny coworker · Light-hearted companion",
    bestFor:
      "When you generally want lightness and humor to lower anxiety.",
    whatChanges:
      "Light metaphors and humor — never at your expense; makes planning feel less grim.",
    example:
      "“Sounds like your brain opened 47 tabs this morning and none of them are loading. Let's see what's actually on the menu today. What's bouncing around in your head right now?”",
  },
  {
    id: "strategic",
    label: "Strategic",
    emoji: "🧠",
    desc: "Zoom out — outcomes over tasks.",
    purpose: "Business planning · prioritization · big picture",
    feelsLike: "Thoughtful friend · Big-picture thinker · Steady advisor",
    bestFor:
      "When you generally want zoom-out and outcome-focused thinking.",
    whatChanges:
      "Challenges false urgency; connects work to outcomes; questions what actually matters this week.",
    example:
      "“Let's zoom out. Being overwhelmed usually means everything feels equally important. It isn't. What outcomes are you trying to create this week?”",
  },
  {
    id: "motivational",
    label: "Motivational",
    emoji: "🔥",
    desc: "Encouragement and the next 15 minutes.",
    purpose: "Unstick · momentum · forward motion",
    feelsLike: "Encouraging friend · Steady cheerleader · Believer in you",
    bestFor:
      "When you generally want encouragement focused on the next small step.",
    whatChanges:
      "Affirms capability without toxic positivity; focuses on one small next step in the next 15 minutes.",
    example:
      "“You've handled harder things than this. Let's not spend today staring at the mountain. What's the next step you can take in the next 15 minutes?”",
  },
];

export function aiToneLabel(id: AiTone): string {
  const guide = AI_TONE_GUIDES.find((g) => g.id === id);
  if (!guide) return id;
  // Playful: label only — no smile emoji in Settings.
  if (guide.id === "playful") return guide.label;
  return `${guide.emoji} ${guide.label}`;
}

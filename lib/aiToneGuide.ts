import type { AiTone } from "@/lib/companionStore";

export type AiToneGuide = {
  id: AiTone;
  label: string;
  desc: string;
  bestFor: string;
  whatChanges: string;
  example: string;
};

export const AI_TONE_GUIDES: AiToneGuide[] = [
  {
    id: "calm",
    label: "Calm",
    desc: "Slow, grounding, spacious.",
    bestFor: "Overwhelm, anxiety, or when you need to slow down before acting.",
    whatChanges: "Longer pauses between ideas, fewer items per reply, softer language.",
    example: "“Let’s take one breath. What’s the smallest true next step?”",
  },
  {
    id: "balanced",
    label: "Balanced",
    desc: "Warm but direct.",
    bestFor: "Everyday coaching — empathy plus clear next steps.",
    whatChanges: "Mix of validation and action; default for most conversations.",
    example: "“That makes sense. Want to pick one thing to move forward?”",
  },
  {
    id: "direct",
    label: "Direct",
    desc: "Brief and to the point.",
    bestFor: "When you already know what you need and want less preamble.",
    whatChanges: "Shorter replies, bullets, leads with the answer.",
    example: "“Do this next: send the outline. Everything else can wait.”",
  },
  {
    id: "minimal",
    label: "Minimal",
    desc: "Very few words — just the next step.",
    bestFor: "Low bandwidth days or when chat feels like too much to read.",
    whatChanges: "One line when possible; no extra framing.",
    example: "“Next: 10 minutes on the intro.”",
  },
  {
    id: "gentle",
    label: "Gentle",
    desc: "Soft, reassuring, lots of warmth.",
    bestFor: "Hard emotions, self-criticism, or fragile confidence.",
    whatChanges: "More reassurance; never rushes you toward productivity.",
    example: "“You’re not behind. We can make today lighter together.”",
  },
  {
    id: "encouraging",
    label: "Encouraging",
    desc: "Affirming, celebrates small wins.",
    bestFor: "Building momentum and noticing progress you might skip.",
    whatChanges: "Names what you did right; ties small steps to bigger goals.",
    example: "“You opened the doc — that’s the hard part. Ready for five more minutes?”",
  },
  {
    id: "playful",
    label: "Playful",
    desc: "Light, a little humor.",
    bestFor: "When energy is up and you want coaching to feel less heavy.",
    whatChanges: "Warmer metaphors, light humor — never at your expense.",
    example: "“Your to-do list is doing theater again. Pick one real scene.”",
  },
];

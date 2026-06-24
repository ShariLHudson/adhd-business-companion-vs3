/**
 * Curated Deep Dive topics — restored from Business Playbook panel (orphaned UI).
 * Surfaced in How Do I and chat prompts.
 */

export type DeepDiveTopic = {
  id: string;
  label: string;
  prompt: string;
  keywords: string[];
};

export const DEEP_DIVE_TOPICS: DeepDiveTopic[] = [
  {
    id: "positioning",
    label: "Positioning",
    prompt: "Give me a deep dive on positioning for my business.",
    keywords: ["positioning", "stand out", "differentiate"],
  },
  {
    id: "pricing",
    label: "Pricing your offer",
    prompt: "Give me a deep dive on pricing my offer.",
    keywords: ["pricing", "price my offer", "what to charge"],
  },
  {
    id: "converts",
    label: "Content that converts",
    prompt: "Give me a deep dive on content that converts.",
    keywords: ["content that converts", "conversion content"],
  },
  {
    id: "niche",
    label: "Finding your niche",
    prompt: "Give me a deep dive on finding my niche.",
    keywords: ["niche", "finding your niche", "target market"],
  },
  {
    id: "first100",
    label: "Your first 100 followers",
    prompt: "Give me a deep dive on getting my first 100 followers.",
    keywords: ["first 100 followers", "grow audience", "first followers"],
  },
];

export function matchDeepDiveTopic(text: string): DeepDiveTopic | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  for (const topic of DEEP_DIVE_TOPICS) {
    if (topic.keywords.some((k) => t.includes(k.toLowerCase()))) return topic;
    if (t.includes(topic.label.toLowerCase())) return topic;
  }
  if (/\bdeep dive\b/i.test(t)) {
    return DEEP_DIVE_TOPICS[0] ?? null;
  }
  return null;
}

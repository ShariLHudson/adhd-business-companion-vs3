/**
 * Create Entrance Preview (2026-08-06) — isolated prototype only.
 *
 * Deliberately self-contained: no imports from lib/createEstate/,
 * lib/currentFocus/, lib/createWorkflow*, or any other production Create
 * machinery. Nothing here opens a real workspace, creates a record, or
 * touches the legacy split-panel Create workspace experience. The purpose
 * is purely to evaluate whether the conversation-first doorway *feels*
 * right before any production routing changes are made.
 *
 * @see components/prototype/createEntrancePreview/CreateEntrancePreviewPage.tsx
 */

export type PreviewTopic = "sop" | "workshop" | "marketing" | "idea";

const SOP_RE = /\bsop\b|\bstandard operating procedure\b/i;
const WORKSHOP_RE =
  /\bworkshop\b|\bevent\b|\bretreat\b|\bwebinar\b|\bconference\b|\bmasterclass\b/i;
const MARKETING_RE = /\bmarketing\b/i;

export function detectPreviewTopic(text: string): PreviewTopic {
  const t = text.trim();
  if (SOP_RE.test(t)) return "sop";
  if (WORKSHOP_RE.test(t)) return "workshop";
  if (MARKETING_RE.test(t)) return "marketing";
  return "idea";
}

/** Exact copy from the latest approved preview spec — one line per topic. */
export const PREVIEW_ACKNOWLEDGMENTS: Record<PreviewTopic, string> = {
  sop: "I'd be happy to help. Before we build it, let's understand what this process needs to accomplish.",
  workshop:
    "That sounds exciting. Before we think about agendas or materials, let's understand what you want participants to experience.",
  marketing:
    "I'd love to help. Before we create a plan, let's understand what you're hoping marketing will accomplish.",
  idea: "Perfect. Let's explore it together. Tell me what you're imagining.",
};

/**
 * One reasoning-first follow-up per topic — "one helpful question," not an
 * interview. Idea has none: the acknowledgment above already invites
 * elaboration, so a second question would just repeat the ask.
 */
export const PREVIEW_FOLLOW_UP_QUESTIONS: Partial<Record<PreviewTopic, string>> = {
  sop: "Who will actually be using these steps once they're written down?",
  workshop: "What's the one thing you'd love participants to walk away with?",
  marketing: "Are you hoping for more visibility, more leads, or something else?",
};

/** A friendly, honest label for the reflection step — not a real Build Type resolution. */
export const PREVIEW_DISCOVERED_LABEL: Partial<Record<PreviewTopic, string>> = {
  sop: "an SOP",
  workshop: "a workshop",
  marketing: "a marketing plan",
};

export type PreviewStage =
  | "opening"
  | "acknowledged"
  | "reflecting";

export type PreviewMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Builds the reflection line once enough has been shared. For "idea" —
 * explicitly the not-sure-yet case — this stays soft and never fakes a
 * discovered Build Type.
 */
export function buildPreviewReflection(topic: PreviewTopic): string {
  const label = PREVIEW_DISCOVERED_LABEL[topic];
  if (!label) {
    return "It sounds like you're still exploring — that's a great place to start from. There's no need to know exactly what this becomes yet.";
  }
  return `Here's what I think we're working on: ${label}. In the real experience, this is where we'd start shaping it together — one step at a time.`;
}

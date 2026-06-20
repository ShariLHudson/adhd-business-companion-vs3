/**
 * Create depth — how much discovery a content type needs.
 * Tiers only; clarity checks live in createWorkflow.ts.
 */

export type CreateDepth = "light" | "guided" | "deep";

export const CREATE_DEPTH_LABELS: Record<CreateDepth, string> = {
  light: "Light Create",
  guided: "Guided Create",
  deep: "Deep Create",
};

const LIGHT_CREATE_TYPES = new Set([
  "LinkedIn Post",
  "Facebook Post",
  "Instagram Post",
  "Social Post",
  "Thank-You Email",
]);

const GUIDED_CREATE_TYPES = new Set([
  "Email",
  "Newsletter",
  "Blog Post",
  "Video Script",
  "Email Sequence",
  "Email Campaign",
  "Podcast",
  "Presentation",
]);

const DEEP_CREATE_TYPES = new Set([
  "Lead Magnet",
  "Workshop",
  "Course Outline",
  "SOP",
  "Marketing Plan",
  "Training Guide",
  "Training",
  "Proposal",
  "Business Plan",
  "Client Onboarding",
  "Sales Funnel",
  "Landing Page",
  "Offer",
  "Sales Page",
  "Strategy",
  "Business Strategy",
  "Marketing Strategy",
  "Content Strategy",
  "Personal Companion Strategy",
]);

export function isThankYouEmailIntent(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    /\bthank[\s-]?you\s+email\b/.test(t) ||
    /\bwrite\s+(?:a\s+)?thank[\s-]?you\b/.test(t)
  );
}

export function resolveCreateTypeLabel(
  typeLabel: string,
  userPhrase?: string,
): string {
  if (typeLabel === "Email" && userPhrase && isThankYouEmailIntent(userPhrase)) {
    return "Thank-You Email";
  }
  return typeLabel;
}

export function createDepthForType(typeLabel: string): CreateDepth {
  const label = typeLabel.trim();
  if (LIGHT_CREATE_TYPES.has(label)) return "light";
  if (DEEP_CREATE_TYPES.has(label)) return "deep";
  if (GUIDED_CREATE_TYPES.has(label)) return "guided";
  return "guided";
}

export function createDepthDescription(typeLabel: string): string {
  const depth = createDepthForType(typeLabel);
  switch (depth) {
    case "light":
      return "Get enough clarity quickly (typically 2–3 decisions), then draft when the user is ready.";
    case "guided":
      return "Understand the message before writing (typically 3–6 decisions). Do not draft after one answer.";
    case "deep":
      return "Think through the idea before writing. Discovery first; draft when clarity is high or the user asks.";
  }
}

export function createDepthHintForChat(typeLabel: string): string {
  const depth = createDepthForType(typeLabel);
  return [
    `CREATE DEPTH: ${CREATE_DEPTH_LABELS[depth]} — ${createDepthDescription(typeLabel)}`,
    "Measure clarity (approved decisions on the thinking board), not how many questions were asked.",
    "Do NOT draft because one field has text. Draft when clarity is high AND the user requests it.",
  ].join("\n");
}

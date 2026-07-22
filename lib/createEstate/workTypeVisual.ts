/**
 * Spec 130 — Work Type visual recognition (icon + color accent).
 * Icons supplement labels; never replace accessible text.
 */

export type WorkTypeVisual = {
  /** Short glyph / emoji supplement (aria-hidden in UI) */
  icon: string;
  /** CSS accent color for left border / chip */
  accent: string;
  /** Soft background tint */
  tint: string;
  /** Normalized kind key */
  kind: string;
};

const DEFAULT_VISUAL: WorkTypeVisual = {
  icon: "✨",
  accent: "#6b635a",
  tint: "rgba(107, 99, 90, 0.08)",
  kind: "other",
};

const VISUAL_BY_KIND: Record<string, WorkTypeVisual> = {
  email: {
    icon: "✉️",
    accent: "#2f6f6f",
    tint: "rgba(47, 111, 111, 0.10)",
    kind: "email",
  },
  newsletter: {
    icon: "📰",
    accent: "#3d5a80",
    tint: "rgba(61, 90, 128, 0.10)",
    kind: "newsletter",
  },
  blog: {
    icon: "✍️",
    accent: "#8b5e3c",
    tint: "rgba(139, 94, 60, 0.10)",
    kind: "blog",
  },
  podcast: {
    icon: "🎙️",
    accent: "#6b4e71",
    tint: "rgba(107, 78, 113, 0.10)",
    kind: "podcast",
  },
  video: {
    icon: "🎬",
    accent: "#9a3412",
    tint: "rgba(154, 52, 18, 0.10)",
    kind: "video",
  },
  course: {
    icon: "📚",
    accent: "#1e4f4f",
    tint: "rgba(30, 79, 79, 0.10)",
    kind: "course",
  },
  calendar: {
    icon: "📅",
    accent: "#b45309",
    tint: "rgba(180, 83, 9, 0.10)",
    kind: "calendar",
  },
  "marketing plan": {
    icon: "📣",
    accent: "#9f1239",
    tint: "rgba(159, 18, 57, 0.10)",
    kind: "marketing plan",
  },
  "strategic plan": {
    icon: "🗺️",
    accent: "#1e3a5f",
    tint: "rgba(30, 58, 95, 0.10)",
    kind: "strategic plan",
  },
  workshop: {
    icon: "🧵",
    accent: "#365314",
    tint: "rgba(54, 83, 20, 0.10)",
    kind: "workshop",
  },
  event: {
    icon: "🎫",
    accent: "#7c2d12",
    tint: "rgba(124, 45, 18, 0.10)",
    kind: "event",
  },
  checklist: {
    icon: "✅",
    accent: "#166534",
    tint: "rgba(22, 101, 52, 0.10)",
    kind: "checklist",
  },
  proposal: {
    icon: "📄",
    accent: "#334155",
    tint: "rgba(51, 65, 85, 0.10)",
    kind: "proposal",
  },
  sop: {
    icon: "📋",
    accent: "#475569",
    tint: "rgba(71, 85, 105, 0.10)",
    kind: "sop",
  },
  social: {
    icon: "💬",
    accent: "#0369a1",
    tint: "rgba(3, 105, 161, 0.10)",
    kind: "social",
  },
};

function normalizeKind(label: string): string {
  const t = label.trim().toLowerCase();
  if (!t) return "other";
  if (/\bemail\b/.test(t)) return "email";
  if (/\bnewsletter\b/.test(t)) return "newsletter";
  if (/\bblog\b/.test(t)) return "blog";
  if (/\bpodcast\b/.test(t)) return "podcast";
  if (/\bvideo\b/.test(t)) return "video";
  if (/\bcourse\b|\bclass\b|\btraining\b/.test(t)) return "course";
  if (/\bcalendar\b|\bschedule\b/.test(t)) return "calendar";
  if (/\bmarketing\s*plan\b/.test(t)) return "marketing plan";
  if (/\bstrategic\s*plan\b|\bstrategy\b/.test(t)) return "strategic plan";
  if (/\bworkshop\b/.test(t)) return "workshop";
  if (/\bevent\b|\bretreat\b|\bwebinar\b|\bconference\b/.test(t)) return "event";
  if (/\bchecklist\b/.test(t)) return "checklist";
  if (/\bproposal\b/.test(t)) return "proposal";
  if (/\bsop\b|\bprocess\b/.test(t)) return "sop";
  if (/\bsocial\b|\bpost\b/.test(t)) return "social";
  return "other";
}

export function resolveWorkTypeVisual(
  kindLabel: string | null | undefined,
): WorkTypeVisual {
  const kind = normalizeKind(kindLabel || "");
  return VISUAL_BY_KIND[kind] ?? { ...DEFAULT_VISUAL, kind };
}

/**
 * Fixed visual identity colors per major ecosystem area.
 *
 * Accent color separation:
 * User **Accent Color** (settings / theme tokens) controls only active buttons,
 * selected tabs, focus rings, highlights, and links — NOT area identity on hub
 * cards, icons, or count badges. Hub cards must use these tokens exclusively.
 *
 * Future Visual Style Settings (not implemented yet):
 * - minimal: neutral cards, identity color only on top strip
 * - colorGuided: default — soft tinted icon + badge (current)
 * - highlyVisual: stronger tints and accent borders
 */
export type EcosystemAreaId =
  | "plan-my-day"
  | "projects"
  | "create"
  | "brain-dump"
  | "playbook"
  | "templates"
  | "snippets"
  | "my-work"
  | "growth"
  | "client-avatars"
  | "settings"
  | "archive";

export type EcosystemAreaColor = {
  id: EcosystemAreaId;
  label: string;
  /** Top accent strip — use as border-t-* on the card */
  accent: string;
  iconBg: string;
  iconFg: string;
  badgeBg: string;
  badgeFg: string;
  cardTint?: string;
  actionBorder: string;
  actionFg: string;
  actionHover: string;
};

const ECOSYSTEM_AREA_COLORS: Record<EcosystemAreaId, EcosystemAreaColor> = {
  "plan-my-day": {
    id: "plan-my-day",
    label: "Plan My Day",
    accent: "border-t-sky-500",
    iconBg: "bg-sky-50",
    iconFg: "text-sky-700",
    badgeBg: "bg-sky-100",
    badgeFg: "text-sky-800",
    actionBorder: "border-sky-200",
    actionFg: "text-sky-800",
    actionHover: "hover:bg-sky-50",
  },
  projects: {
    id: "projects",
    label: "Projects",
    accent: "border-t-amber-500",
    iconBg: "bg-amber-50",
    iconFg: "text-amber-700",
    badgeBg: "bg-amber-100",
    badgeFg: "text-amber-800",
    actionBorder: "border-amber-200",
    actionFg: "text-amber-800",
    actionHover: "hover:bg-amber-50",
  },
  create: {
    id: "create",
    label: "Create",
    accent: "border-t-orange-500",
    iconBg: "bg-orange-50",
    iconFg: "text-orange-700",
    badgeBg: "bg-orange-100",
    badgeFg: "text-orange-800",
    actionBorder: "border-orange-200",
    actionFg: "text-orange-800",
    actionHover: "hover:bg-orange-50",
  },
  "brain-dump": {
    id: "brain-dump",
    label: "Clear My Mind",
    accent: "border-t-pink-500",
    iconBg: "bg-pink-50",
    iconFg: "text-pink-700",
    badgeBg: "bg-pink-100",
    badgeFg: "text-pink-800",
    actionBorder: "border-pink-200",
    actionFg: "text-pink-800",
    actionHover: "hover:bg-pink-50",
  },
  playbook: {
    id: "playbook",
    label: "Strategies",
    accent: "border-t-rose-500",
    iconBg: "bg-rose-50",
    iconFg: "text-rose-700",
    badgeBg: "bg-rose-100",
    badgeFg: "text-rose-800",
    actionBorder: "border-rose-200",
    actionFg: "text-rose-800",
    actionHover: "hover:bg-rose-50",
  },
  templates: {
    id: "templates",
    label: "Templates",
    accent: "border-t-emerald-500",
    iconBg: "bg-emerald-50",
    iconFg: "text-emerald-700",
    badgeBg: "bg-emerald-100",
    badgeFg: "text-emerald-800",
    actionBorder: "border-emerald-200",
    actionFg: "text-emerald-800",
    actionHover: "hover:bg-emerald-50",
  },
  snippets: {
    id: "snippets",
    label: "Snippets",
    accent: "border-t-violet-500",
    iconBg: "bg-violet-50",
    iconFg: "text-violet-700",
    badgeBg: "bg-violet-100",
    badgeFg: "text-violet-800",
    actionBorder: "border-violet-200",
    actionFg: "text-violet-800",
    actionHover: "hover:bg-violet-50",
  },
  "my-work": {
    id: "my-work",
    label: "My Work",
    accent: "border-t-amber-800",
    iconBg: "bg-amber-50",
    iconFg: "text-amber-900",
    badgeBg: "bg-amber-100",
    badgeFg: "text-amber-900",
    actionBorder: "border-amber-200",
    actionFg: "text-amber-900",
    actionHover: "hover:bg-amber-50",
  },
  growth: {
    id: "growth",
    label: "Growth",
    accent: "border-t-emerald-600",
    iconBg: "bg-emerald-50",
    iconFg: "text-emerald-800",
    badgeBg: "bg-emerald-100",
    badgeFg: "text-emerald-900",
    actionBorder: "border-emerald-200",
    actionFg: "text-emerald-900",
    actionHover: "hover:bg-emerald-50",
  },
  "client-avatars": {
    id: "client-avatars",
    label: "Client Avatars",
    accent: "border-t-purple-700",
    iconBg: "bg-purple-50",
    iconFg: "text-purple-800",
    badgeBg: "bg-purple-100",
    badgeFg: "text-purple-900",
    actionBorder: "border-purple-200",
    actionFg: "text-purple-900",
    actionHover: "hover:bg-purple-50",
  },
  settings: {
    id: "settings",
    label: "Settings",
    accent: "border-t-stone-400",
    iconBg: "bg-stone-100",
    iconFg: "text-stone-600",
    badgeBg: "bg-stone-200",
    badgeFg: "text-stone-700",
    actionBorder: "border-stone-300",
    actionFg: "text-stone-700",
    actionHover: "hover:bg-stone-50",
  },
  archive: {
    id: "archive",
    label: "Archive",
    accent: "border-t-stone-400",
    iconBg: "bg-stone-100",
    iconFg: "text-stone-600",
    badgeBg: "bg-stone-200",
    badgeFg: "text-stone-700",
    actionBorder: "border-stone-300",
    actionFg: "text-stone-700",
    actionHover: "hover:bg-stone-50",
  },
};

const MY_WORK_CARD_AREA_MAP: Record<string, EcosystemAreaId> = {
  continue: "my-work",
  favorites: "my-work",
  projects: "projects",
  "created-content": "create",
  strategies: "playbook",
  templates: "templates",
  snippets: "snippets",
  archive: "archive",
};

export function getEcosystemAreaColor(areaId: string): EcosystemAreaColor {
  const mapped = MY_WORK_CARD_AREA_MAP[areaId] ?? areaId;
  return (
    ECOSYSTEM_AREA_COLORS[mapped as EcosystemAreaId] ??
    ECOSYSTEM_AREA_COLORS.settings
  );
}

export function getMyWorkCardAreaId(cardId: string): EcosystemAreaId {
  return MY_WORK_CARD_AREA_MAP[cardId] ?? "my-work";
}

export { ECOSYSTEM_AREA_COLORS };

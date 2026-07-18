/**
 * Block legacy split Create / Projects routing for member-facing creation.
 * Estate destinations only — unfinished Create rooms stay in chat with a prepared-state line.
 */

export const CREATE_ROOM_PREPARED_STATE_MESSAGE =
  "This Create room is still being prepared. I can help you think through what you want to make here, but I won't send you back to the old workspace.";

/** Sections that must not open as split Chat + Workspace for creation flows. */
export const LEGACY_CREATE_BLOCKED_SECTIONS = [
  "content-generator",
  "projects",
  "saved-work",
  "templates-library",
] as const;

export type LegacyCreateBlockedSection =
  (typeof LEGACY_CREATE_BLOCKED_SECTIONS)[number];

export type LegacyCreateWorkspaceDecision =
  | { kind: "allow" }
  | { kind: "project_homes" }
  | { kind: "cartographers_studio" }
  | { kind: "prepared_state"; message: string };

const PROJECT_CREATE_RE =
  /\b(?:create|start|new|add|begin)\s+(?:a\s+)?(?:new\s+)?project\b|\b(?:want|need|like)\s+to\s+(?:create|start|begin)\s+(?:a\s+)?(?:new\s+)?project\b|\bturn\s+(?:this|it|that)\s+into\s+a\s+project\b|\borganize\s+(?:this|it|that)\s+as\s+a\s+project\b|\bhelp\s+me\s+(?:start|create|organize)\s+(?:a\s+)?(?:new\s+)?project\b/i;

const MAP_CREATE_RE =
  /\b(?:mind\s*maps?|workflow\s*maps?|decision\s*maps?|process\s*maps?|customer\s*journey\s*maps?)\b|\b(?:create|make|build|draw)\b.{0,48}\b(?:mind\s*map|workflow|decision\s*map|process\s*map|journey\s*map)\b|\bmap\s+(?:this|my|a|the)\s+(?:process|workflow|decision|journey)\b/i;

const CREATE_CLASS_RE =
  /\b(?:create|write|draft|build|make|start)\b.{0,48}\b(?:sop|sops|standard operating|procedure|document|report|guide|letter|checklist|template|content|email|newsletter|blog|social|script|proposal)\b|\b(?:sop|document|template|content|email|newsletter|blog\s*post|social\s*(?:media\s*)?post|video\s*script)\b/i;

const EXPLICIT_OPEN_SAVED_WORK_RE =
  /\b(?:open|show|go to)\s+(?:my\s+)?saved\s+work\b/i;

const EXPLICIT_OPEN_TEMPLATES_RE =
  /\b(?:open|show|go to)\s+(?:the\s+|my\s+)?templates?(?:\s+library)?\b/i;

export function isLegacyCreateBlockedSection(
  section: string,
): section is LegacyCreateBlockedSection {
  return (LEGACY_CREATE_BLOCKED_SECTIONS as readonly string[]).includes(section);
}

export function isProjectCreationRoutingIntent(userText: string): boolean {
  return PROJECT_CREATE_RE.test(userText.trim());
}

export function isCartographerMapRoutingIntent(userText: string): boolean {
  return MAP_CREATE_RE.test(userText.trim());
}

export function isUnreadyCreateRoomRoutingIntent(
  userText: string,
  itemType?: string | null,
): boolean {
  const t = userText.trim();
  if (!t && !itemType) return false;
  if (isProjectCreationRoutingIntent(t)) return false;
  if (isCartographerMapRoutingIntent(t)) return false;
  if (itemType) {
    const type = itemType.toLowerCase();
    if (
      /\b(sop|email|newsletter|document|report|guide|letter|checklist|template|content|blog|social|script|proposal|funnel)\b/.test(
        type,
      )
    ) {
      return true;
    }
  }
  return CREATE_CLASS_RE.test(t);
}

/**
 * Decide whether a legacy split open should be redirected or blocked.
 * Non-blocked sections always allow (Plan My Day time-block, Chamber, etc.).
 */
export function resolveLegacyCreateWorkspaceGuard(input: {
  section: string;
  userText?: string | null;
  itemType?: string | null;
  /** When true, panel is already open — allow in-place draft sync only. */
  alreadyOpen?: boolean;
  /**
   * My Work → Create picker selected a concrete creation type.
   * Must open the guided Create workflow — not the chat prepared-state line.
   */
  estateCreateLaunch?: boolean;
}): LegacyCreateWorkspaceDecision {
  const section = input.section;
  const userText = (input.userText ?? "").trim();
  const itemType = input.itemType ?? null;

  if (!isLegacyCreateBlockedSection(section)) {
    return { kind: "allow" };
  }

  if (input.alreadyOpen && section === "content-generator") {
    return { kind: "allow" };
  }

  // Estate Create: option click = launch. Chat-driven create still stays blocked.
  if (
    input.estateCreateLaunch &&
    section === "content-generator" &&
    Boolean(itemType?.trim())
  ) {
    return { kind: "allow" };
  }

  if (isCartographerMapRoutingIntent(userText)) {
    return { kind: "cartographers_studio" };
  }

  if (section === "projects" || isProjectCreationRoutingIntent(userText)) {
    return { kind: "project_homes" };
  }

  if (section === "saved-work" && EXPLICIT_OPEN_SAVED_WORK_RE.test(userText)) {
    return { kind: "allow" };
  }

  if (
    section === "templates-library" &&
    EXPLICIT_OPEN_TEMPLATES_RE.test(userText) &&
    !isUnreadyCreateRoomRoutingIntent(userText, itemType)
  ) {
    return { kind: "allow" };
  }

  // content-generator, create-class saved-work/templates, generic create opens
  if (
    section === "content-generator" ||
    section === "templates-library" ||
    section === "saved-work" ||
    isUnreadyCreateRoomRoutingIntent(userText, itemType) ||
    !userText
  ) {
    return {
      kind: "prepared_state",
      message: CREATE_ROOM_PREPARED_STATE_MESSAGE,
    };
  }

  return {
    kind: "prepared_state",
    message: CREATE_ROOM_PREPARED_STATE_MESSAGE,
  };
}

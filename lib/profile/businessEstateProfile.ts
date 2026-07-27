/**
 * My Business Estate — structured profile sections in companion-business-profile-v1.
 * Extends the existing key; does not create a duplicate store.
 *
 * COMPATIBILITY BOUNDARY (canonical vs. legacy) — BINDING:
 * - The estate envelope (the `estate` field written by this module) is the
 *   single canonical source of truth for the Business Profile.
 * - All new Business Profile work reads from and writes to the estate envelope.
 * - The legacy flat BusinessProfile shape (role/sells/goals/tone in
 *   companionStore) is a DERIVED MIRROR only — kept in sync downstream from the
 *   envelope for backward compatibility with older consumers. It is temporary.
 * - No new feature may treat the legacy shape as canonical.
 * - Do not perform a destructive migration or remove the legacy mirror until
 *   every downstream consumer of the legacy shape has been migrated to the
 *   envelope and verified.
 */
import {
  getBusinessProfile,
  saveBusinessProfile,
  type BusinessProfile,
} from "@/lib/companionStore";
import { getPrefs } from "@/lib/companionStore";

export type BusinessEstateSectionId =
  | "identity"
  | "offers"
  | "brand"
  | "direction"
  | "work-style"
  | "tools";

export type SectionStatus =
  | "not-started"
  | "started"
  | "ready-to-review"
  | "updated";

export type BusinessEstateIdentity = {
  businessName: string;
  founderName: string;
  roleTitle: string;
  website: string;
  businessStage: string;
  shortDescription: string;
  businessStory: string;
  mission: string;
  vision: string;
  coreValues: string;
  /** Optional business image / logo (data URL). NOT the user's personal profile
   * image (prefs.profileImage) and NOT a Client Avatar image. */
  businessImage: string;
};

export type BusinessEstateOffers = {
  products: string;
  services: string;
  programs: string;
  memberships: string;
  workshops: string;
  speakingTopics: string;
  mainOffer: string;
  offersInDevelopment: string;
  problemsSolved: string;
  outcomesCreated: string;
  /** Business-level pricing / price ranges (distinct from a Client Avatar's
   * optional Revenue Connection note). */
  pricing: string;
  /** Primary revenue sources (recurring vs one-time, main earners). */
  revenueSources: string;
};

export type BusinessEstateBrand = {
  tagline: string;
  brandPersonality: string;
  tone: string;
  keyMessages: string;
  wordsToUse: string;
  wordsToAvoid: string;
  brandColors: string;
  visualPreferences: string;
  contentBoundaries: string;
  valuesToReflect: string;
};

export type BusinessEstateDirection = {
  currentPriority: string;
  currentGoals: string;
  mainProject: string;
  nextMilestone: string;
  openDecisions: string;
  ideasConsidering: string;
  ideasParked: string;
  currentChallenges: string;
  successLooksLike: string;
};

export type BusinessEstateWorkStyle = {
  bestFocusTimes: string;
  energyPatterns: string;
  planningPreferences: string;
  communicationPreferences: string;
  reminderPreferences: string;
  commonFriction: string;
  restartHelpers: string;
  overwhelmTriggers: string;
  shariSupportStyle: string;
};

export type BusinessEstateTools = {
  websitePlatform: string;
  calendar: string;
  fileStorage: string;
  designTools: string;
  socialPlatforms: string;
  paymentTools: string;
  otherSystems: string;
};

export type BusinessEstateSections = {
  identity: BusinessEstateIdentity;
  offers: BusinessEstateOffers;
  brand: BusinessEstateBrand;
  direction: BusinessEstateDirection;
  workStyle: BusinessEstateWorkStyle;
  tools: BusinessEstateTools;
};

export type BusinessEstateFieldApproval = Record<string, boolean>;

type EstateEnvelope = {
  version: 1;
  sections: BusinessEstateSections;
  approval: BusinessEstateFieldApproval;
  sectionUpdatedAt: Partial<Record<BusinessEstateSectionId, string>>;
};

const BIZ_PROFILE_KEY = "companion-business-profile-v1";

const EMPTY_IDENTITY: BusinessEstateIdentity = {
  businessName: "",
  founderName: "",
  roleTitle: "",
  website: "",
  businessStage: "",
  shortDescription: "",
  businessStory: "",
  mission: "",
  vision: "",
  coreValues: "",
  businessImage: "",
};

const EMPTY_OFFERS: BusinessEstateOffers = {
  products: "",
  services: "",
  programs: "",
  memberships: "",
  workshops: "",
  speakingTopics: "",
  mainOffer: "",
  offersInDevelopment: "",
  problemsSolved: "",
  outcomesCreated: "",
  pricing: "",
  revenueSources: "",
};

const EMPTY_BRAND: BusinessEstateBrand = {
  tagline: "",
  brandPersonality: "",
  tone: "",
  keyMessages: "",
  wordsToUse: "",
  wordsToAvoid: "",
  brandColors: "",
  visualPreferences: "",
  contentBoundaries: "",
  valuesToReflect: "",
};

const EMPTY_DIRECTION: BusinessEstateDirection = {
  currentPriority: "",
  currentGoals: "",
  mainProject: "",
  nextMilestone: "",
  openDecisions: "",
  ideasConsidering: "",
  ideasParked: "",
  currentChallenges: "",
  successLooksLike: "",
};

const EMPTY_WORK_STYLE: BusinessEstateWorkStyle = {
  bestFocusTimes: "",
  energyPatterns: "",
  planningPreferences: "",
  communicationPreferences: "",
  reminderPreferences: "",
  commonFriction: "",
  restartHelpers: "",
  overwhelmTriggers: "",
  shariSupportStyle: "",
};

const EMPTY_TOOLS: BusinessEstateTools = {
  websitePlatform: "",
  calendar: "",
  fileStorage: "",
  designTools: "",
  socialPlatforms: "",
  paymentTools: "",
  otherSystems: "",
};

export function emptyBusinessEstateSections(): BusinessEstateSections {
  return {
    identity: { ...EMPTY_IDENTITY },
    offers: { ...EMPTY_OFFERS },
    brand: { ...EMPTY_BRAND },
    direction: { ...EMPTY_DIRECTION },
    workStyle: { ...EMPTY_WORK_STYLE },
    tools: { ...EMPTY_TOOLS },
  };
}

/** Heuristic — imported conversation text should not display as approved facts. */
export function looksLikeConversationalImport(value: string): boolean {
  const text = value.trim();
  if (!text) return false;
  if (text.length > 90) return true;
  if (/^(I|I'm|I've|I am)\b/i.test(text)) return true;
  if ((text.match(/\?/g) ?? []).length >= 1) return true;
  if ((text.match(/[.!?]/g) ?? []).length >= 2) return true;
  return false;
}

function readRawDocument(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BIZ_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function writeRawDocument(doc: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BIZ_PROFILE_KEY, JSON.stringify(doc));
    window.dispatchEvent(new CustomEvent("companion-business-estate-updated"));
  } catch {
    /* noop */
  }
}

function mergeSection<T extends Record<string, string>>(
  empty: T,
  partial: unknown,
): T {
  if (!partial || typeof partial !== "object") return { ...empty };
  const source = partial as Record<string, unknown>;
  const next = { ...empty };
  for (const key of Object.keys(empty) as (keyof T)[]) {
    const value = source[key as string];
    if (typeof value === "string") next[key] = value as T[keyof T];
  }
  return next;
}

function migrateLegacyIntoEnvelope(
  profile: BusinessProfile | null,
  envelope: EstateEnvelope,
): EstateEnvelope {
  const next = { ...envelope, sections: { ...envelope.sections } };
  const approval = { ...envelope.approval };

  const prefs = getPrefs();
  if (!next.sections.identity.founderName && prefs.name?.trim()) {
    next.sections.identity = {
      ...next.sections.identity,
      founderName: prefs.name.trim(),
    };
    if (approval["identity.founderName"] === undefined) {
      approval["identity.founderName"] = !looksLikeConversationalImport(
        prefs.name,
      );
    }
  }

  if (!next.sections.identity.roleTitle && profile?.role?.trim()) {
    next.sections.identity = {
      ...next.sections.identity,
      roleTitle: profile.role.trim(),
    };
    if (approval["identity.roleTitle"] === undefined) {
      approval["identity.roleTitle"] = !looksLikeConversationalImport(
        profile.role,
      );
    }
  }

  if (!next.sections.offers.mainOffer && profile?.sells?.trim()) {
    next.sections.offers = {
      ...next.sections.offers,
      mainOffer: profile.sells.trim(),
    };
    if (approval["offers.mainOffer"] === undefined) {
      approval["offers.mainOffer"] = !looksLikeConversationalImport(
        profile.sells,
      );
    }
  }

  if (!next.sections.direction.currentGoals && profile?.goals?.length) {
    next.sections.direction = {
      ...next.sections.direction,
      currentGoals: profile.goals.join(", "),
    };
    if (approval["direction.currentGoals"] === undefined) {
      approval["direction.currentGoals"] = !profile.goals.some((goal) =>
        looksLikeConversationalImport(goal),
      );
    }
  }

  if (!next.sections.brand.tone && profile?.tone?.trim()) {
    next.sections.brand = {
      ...next.sections.brand,
      tone: profile.tone.trim(),
    };
    if (approval["brand.tone"] === undefined) {
      approval["brand.tone"] = true;
    }
  }

  return { ...next, approval };
}

function parseEnvelope(raw: Record<string, unknown> | null): EstateEnvelope {
  const estate = raw?.estate;
  if (
    estate &&
    typeof estate === "object" &&
    (estate as EstateEnvelope).version === 1
  ) {
    const parsed = estate as EstateEnvelope;
    return {
      version: 1,
      sections: {
        identity: mergeSection(EMPTY_IDENTITY, parsed.sections?.identity),
        offers: mergeSection(EMPTY_OFFERS, parsed.sections?.offers),
        brand: mergeSection(EMPTY_BRAND, parsed.sections?.brand),
        direction: mergeSection(EMPTY_DIRECTION, parsed.sections?.direction),
        workStyle: mergeSection(EMPTY_WORK_STYLE, parsed.sections?.workStyle),
        tools: mergeSection(EMPTY_TOOLS, parsed.sections?.tools),
      },
      approval:
        parsed.approval && typeof parsed.approval === "object"
          ? { ...parsed.approval }
          : {},
      sectionUpdatedAt: parsed.sectionUpdatedAt ?? {},
    };
  }

  return migrateLegacyIntoEnvelope(getBusinessProfile(), {
    version: 1,
    sections: emptyBusinessEstateSections(),
    approval: {},
    sectionUpdatedAt: {},
  });
}

export function getBusinessEstateEnvelope(): EstateEnvelope {
  return parseEnvelope(readRawDocument());
}

export function getBusinessEstateSections(): BusinessEstateSections {
  return getBusinessEstateEnvelope().sections;
}

/**
 * True when the member has begun their Business Profile — any estate section has
 * content, or a legacy profile exists. Drives begin-vs-continue messaging and
 * resume behavior. The estate envelope is the source of truth; the legacy shape
 * is only a fallback for pre-existing data.
 */
export function hasStartedBusinessProfile(): boolean {
  const sections = getBusinessEstateSections();
  const started = Object.values(sections).some((section) =>
    sectionHasContent(section as Record<string, string>),
  );
  if (started) return true;
  const legacy = getBusinessProfile();
  return Boolean(legacy && (legacy.role || legacy.sells || legacy.idealClient));
}

/**
 * The section whose progress was most recently saved (by `sectionUpdatedAt`),
 * or null when nothing has been saved yet. Drives "continue where you left
 * off": resume lands the member back where meaningful progress was last
 * recorded. Derived entirely from the existing envelope — no `lastVisited`
 * field, no separate resume store.
 */
export function getBusinessEstateResumeSectionId(): BusinessEstateSectionId | null {
  const { sectionUpdatedAt } = getBusinessEstateEnvelope();
  let latestId: BusinessEstateSectionId | null = null;
  let latestTs = "";
  for (const { id } of BUSINESS_ESTATE_SECTIONS) {
    const ts = sectionUpdatedAt[id];
    // ISO-8601 timestamps sort lexicographically, so string comparison is safe.
    if (ts && ts > latestTs) {
      latestTs = ts;
      latestId = id;
    }
  }
  return latestId;
}

/**
 * First room (in canonical order) that still needs attention — `not-started`
 * or `ready-to-review` — or null when every room is complete. Skipped rooms
 * stay `not-started`, so they remain visibly incomplete here. Derived from
 * existing envelope status; no duplicate progress store.
 */
export function nextIncompleteBusinessEstateSection(): BusinessEstateSectionId | null {
  for (const { id } of BUSINESS_ESTATE_SECTIONS) {
    const status = getBusinessEstateSectionStatus(id);
    if (status === "not-started" || status === "ready-to-review") return id;
  }
  return null;
}

function sectionRecordKey(
  sectionId: BusinessEstateSectionId,
): keyof BusinessEstateSections {
  return sectionId === "work-style" ? "workStyle" : sectionId;
}

function parseFieldPath(path: string): {
  sectionId: BusinessEstateSectionId;
  fieldKey: string;
} {
  const dot = path.indexOf(".");
  const sectionId = path.slice(0, dot) as BusinessEstateSectionId;
  const fieldKey = path.slice(dot + 1);
  return { sectionId, fieldKey };
}

export function isFieldApproved(path: string): boolean {
  return getBusinessEstateEnvelope().approval[path] === true;
}

export function getApprovedFieldValue(path: string): string {
  const { sectionId, fieldKey } = parseFieldPath(path);
  const sections = getBusinessEstateSections();
  const section = sections[sectionRecordKey(sectionId)] as Record<string, string>;
  const value = section[fieldKey] ?? "";
  if (!value.trim()) return "";
  if (!isFieldApproved(path)) return "";
  return value.trim();
}

function sectionHasContent(section: Record<string, string>): boolean {
  return Object.values(section).some((value) => value.trim().length > 0);
}

function sectionNeedsReview(
  sectionId: BusinessEstateSectionId,
  section: Record<string, string>,
  approval: BusinessEstateFieldApproval,
): boolean {
  for (const key of Object.keys(section)) {
    const path = `${sectionId}.${key}`;
    const value = section[key] ?? "";
    if (!value.trim()) continue;
    if (approval[path] !== true) return true;
  }
  return false;
}

export function getBusinessEstateSectionStatus(
  sectionId: BusinessEstateSectionId,
): SectionStatus {
  const envelope = getBusinessEstateEnvelope();
  const sectionMap: Record<BusinessEstateSectionId, Record<string, string>> = {
    identity: envelope.sections.identity,
    offers: envelope.sections.offers,
    brand: envelope.sections.brand,
    direction: envelope.sections.direction,
    "work-style": envelope.sections.workStyle,
    tools: envelope.sections.tools,
  };
  const section = sectionMap[sectionId];
  if (!sectionHasContent(section)) return "not-started";
  if (sectionNeedsReview(sectionId, section, envelope.approval)) {
    return "ready-to-review";
  }
  if (envelope.sectionUpdatedAt[sectionId]) return "updated";
  return "started";
}

export function summarizeBusinessEstateSection(
  sectionId: BusinessEstateSectionId,
): string {
  const sections = getBusinessEstateSections();
  const envelope = getBusinessEstateEnvelope();
  const pick = (path: string, fallback = ""): string => {
    const [sid, key] = path.split(".");
    const section = sections[sid as keyof BusinessEstateSections] as Record<
      string,
      string
    >;
    const value = section?.[key] ?? "";
    if (!value.trim()) return fallback;
    if (envelope.approval[path] !== true) return "Saved information needs review";
    return value.trim();
  };

  switch (sectionId) {
    case "identity": {
      const name = pick("identity.businessName");
      const role = pick("identity.roleTitle");
      if (name && role) return `${name} — ${role}`;
      return name || role || "Add who you are and what you do.";
    }
    case "offers":
      return (
        pick("offers.mainOffer") ||
        pick("offers.services") ||
        "Describe what you offer and who it helps."
      );
    case "brand":
      return pick("brand.tagline") || pick("brand.tone") || "Shape how you sound.";
    case "direction":
      return (
        pick("direction.currentPriority") ||
        pick("direction.currentGoals") ||
        "Capture what you are building toward."
      );
    case "work-style":
      return (
        pick("work-style.shariSupportStyle") ||
        pick("work-style.planningPreferences") ||
        "Note how you work best with Spark Estate."
      );
    case "tools":
      return pick("tools.websitePlatform") || "List the tools your business uses.";
    default:
      return "";
  }
}

/**
 * Backward-compatibility mirror: derive the legacy flat BusinessProfile shape
 * FROM the canonical estate envelope. This is a one-way, envelope → legacy
 * projection so older code paths that still read getBusinessProfile() keep
 * working. It is NOT a second source of truth — never edit the legacy shape
 * directly for new work, and never treat it as canonical (see the compatibility
 * boundary at the top of this file). Remove only after downstream consumers are
 * migrated to the envelope and verified.
 */
function syncLegacyBusinessProfile(
  sections: BusinessEstateSections,
  approval: BusinessEstateFieldApproval,
): void {
  const legacy: Partial<BusinessProfile> = {};

  if (approval["identity.roleTitle"] && sections.identity.roleTitle.trim()) {
    legacy.role = sections.identity.roleTitle.trim();
  }
  if (approval["offers.mainOffer"] && sections.offers.mainOffer.trim()) {
    legacy.sells = sections.offers.mainOffer.trim();
  }
  if (approval["direction.currentGoals"] && sections.direction.currentGoals.trim()) {
    legacy.goals = sections.direction.currentGoals
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  if (approval["brand.tone"] && sections.brand.tone.trim()) {
    legacy.tone = sections.brand.tone.trim();
  }

  if (Object.keys(legacy).length > 0) {
    saveBusinessProfile(legacy);
  }
}

export function saveBusinessEstateSection(
  sectionId: BusinessEstateSectionId,
  values: Record<string, string>,
): BusinessEstateSections {
  const raw = readRawDocument() ?? {};
  const envelope = parseEnvelope(raw);
  const sectionKey =
    sectionId === "work-style" ? "workStyle" : sectionId;

  const nextSection = {
    ...(envelope.sections[sectionKey as keyof BusinessEstateSections] as Record<
      string,
      string
    >),
    ...values,
  };

  const nextApproval = { ...envelope.approval };
  for (const key of Object.keys(values)) {
    nextApproval[`${sectionId}.${key}`] = true;
  }

  const nextEnvelope: EstateEnvelope = {
    ...envelope,
    sections: {
      ...envelope.sections,
      [sectionKey]: nextSection,
    },
    approval: nextApproval,
    sectionUpdatedAt: {
      ...envelope.sectionUpdatedAt,
      [sectionId]: new Date().toISOString(),
    },
  };

  const profile = getBusinessProfile();
  writeRawDocument({
    ...raw,
    role: profile?.role ?? raw.role ?? "",
    goals: profile?.goals ?? raw.goals ?? [],
    sells: profile?.sells ?? raw.sells ?? "",
    idealClient: profile?.idealClient ?? raw.idealClient ?? "",
    traits: profile?.traits ?? raw.traits ?? [],
    tone: profile?.tone ?? raw.tone ?? "",
    audienceResearch: profile?.audienceResearch ?? raw.audienceResearch ?? "",
    updatedAt: new Date().toISOString(),
    estate: nextEnvelope,
  });

  syncLegacyBusinessProfile(nextEnvelope.sections, nextApproval);
  return nextEnvelope.sections;
}

export const BUSINESS_ESTATE_SECTIONS: readonly {
  id: BusinessEstateSectionId;
  title: string;
  description: string;
}[] = [
  {
    id: "identity",
    title: "Business Identity",
    description:
      "The foundation of who your business is and why it exists.",
  },
  {
    id: "offers",
    title: "What I Offer",
    description:
      "The products, services, programs, and outcomes you provide.",
  },
  {
    id: "brand",
    title: "Brand and Message",
    description: "How your business sounds, looks, and communicates.",
  },
  {
    id: "direction",
    title: "Business Direction",
    description:
      "What you are focused on now and where the business is going next.",
  },
  {
    id: "work-style",
    title: "How I Work Best",
    description:
      "The patterns and preferences that help Spark Estate support you well.",
  },
  {
    id: "tools",
    title: "Business Tools and Systems",
    description: "The tools and systems your business currently uses.",
  },
] as const;

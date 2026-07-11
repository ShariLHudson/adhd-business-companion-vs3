/**
 * Pending "Would you like to save this?" offer — Evidence Vault / Hall of Accomplishments.
 * Evidence Capture Standard (246) + Evidence Intelligence (245–248).
 */

import {
  detectsEvidenceCaptureMoment,
  shouldRecommendEvidenceVault,
  suggestsHallOverVault,
} from "./evidenceIntelligence";
import {
  buildWinSaveOffer,
  detectsWinSaveRequest,
  parseWinSaveChoice,
  preferredWinSaveDestination,
  type WinSaveDestination,
  type WinSaveOffer,
} from "./winSaveOffer";
import { quickAddEvidenceEntry } from "@/lib/evidenceBankStore";
import {
  quickAddHallAchievement,
  type HallAchievementType,
} from "@/lib/growthPortfolioStore";

export {
  detectsWinSaveRequest,
  detectsEncouragementNeed,
  preferredWinSaveDestination,
  buildWinSaveOffer,
  parseWinSaveChoice,
  EVIDENCE_VAULT_ENCOURAGEMENT_LINE,
} from "./winSaveOffer";

export {
  detectsEvidenceCaptureMoment,
  suggestsHallOverVault,
  shouldRecommendEvidenceVault,
  EVIDENCE_CAPTURE_PROMPT,
  EVIDENCE_VAULT_EMOTIONAL_ROLE,
  HALL_OF_ACCOMPLISHMENTS_EMOTIONAL_ROLE,
} from "./evidenceIntelligence";

const STORAGE_KEY = "companion-win-save-pending-v1";

const WIN_SAVE_STRIP_RE =
  /\b(?:save\s+this\s+win|save\s+this\s+(?:as\s+)?(?:evidence|proof)|add\s+this\s+to\s+(?:my\s+)?(?:hall\s+of\s+)?accomplishments|add\s+this\s+to\s+(?:my\s+)?(?:evidence\s+)?vault|preserve\s+this\s+(?:win|moment|proof)|file\s+this\s+(?:win|as\s+evidence))\b/gi;

export type WinSavePending = {
  seedText: string;
  offer: WinSaveOffer;
  offeredAtTurn: number;
  savedAt: string;
};

export function saveWinSavePending(pending: WinSavePending): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    /* noop */
  }
}

export function loadWinSavePending(): WinSavePending | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WinSavePending;
    if (!parsed?.offer || typeof parsed.seedText !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearWinSavePending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function createWinSavePending(input: {
  seedText: string;
  offeredAtTurn: number;
}): WinSavePending {
  return {
    seedText: input.seedText.trim(),
    offer: buildWinSaveOffer(input.seedText),
    offeredAtTurn: input.offeredAtTurn,
    savedAt: new Date().toISOString(),
  };
}

export function formatWinSaveOfferMessage(offer: WinSaveOffer): string {
  return [
    offer.prompt,
    "",
    ...offer.options.map((option, index) => `${index + 1}. ${option.label}`),
    "",
    "Reply with a number or option name.",
  ].join("\n");
}

function inferHallAchievementType(text: string): HallAchievementType {
  const t = text.toLowerCase();
  if (/\bdegree|graduat/.test(t)) return "Degree";
  if (/\bcertif/.test(t)) return "Certification";
  if (/\bbook|publish/.test(t)) return "Book";
  if (/\bawards?|won\b/.test(t)) return "Award";
  if (/\blaunch/.test(t)) return "Launch";
  if (/\bbusiness|opened\s+(?:my\s+)?company/.test(t)) return "Business";
  if (/\bcareer\s+milestone/.test(t)) return "Career Milestone";
  if (/\bpersonal\s+victor/.test(t)) return "Personal Victory";
  if (/\bfinished\s+(?:the\s+)?project/.test(t)) return "Finished Project";
  if (suggestsHallOverVault(text)) return "Milestone";
  return "Major Achievement";
}

export function applyWinSaveDestination(
  destination: WinSaveDestination,
  seedText: string,
): { ack: string; openPlaceId?: "evidence-vault" | "portfolio" } {
  const text = seedText.trim() || "A win worth keeping";
  if (destination === "not-now") {
    return { ack: "No problem — we can save it another time." };
  }
  if (destination === "evidence-vault") {
    quickAddEvidenceEntry({ text, category: "Small Win", confidenceBoost: true });
    return {
      ack: "Saved to your Evidence Vault. It's there when you need to remember who you are.",
      openPlaceId: "evidence-vault",
    };
  }
  if (destination === "hall-of-accomplishments") {
    quickAddHallAchievement({
      title: text.slice(0, 80),
      description: text,
      achievementType: inferHallAchievementType(text),
    });
    return {
      ack: "Added to your Hall of Accomplishments. Look what you've accomplished.",
      openPlaceId: "portfolio",
    };
  }
  quickAddEvidenceEntry({ text, category: "Small Win", confidenceBoost: true });
  quickAddHallAchievement({
    title: text.slice(0, 80),
    description: text,
    achievementType: inferHallAchievementType(text),
  });
  return {
    ack: "Saved to both — Evidence Vault for hard days, Hall of Accomplishments for celebration.",
    openPlaceId: "evidence-vault",
  };
}

export function resolveWinSaveReply(
  userText: string,
  pending: WinSavePending | null,
):
  | {
      handled: true;
      ack: string;
      openPlaceId?: "evidence-vault" | "portfolio";
    }
  | { handled: false } {
  if (!pending) return { handled: false };
  const choice = parseWinSaveChoice(userText);
  if (!choice) return { handled: false };
  clearWinSavePending();
  return {
    handled: true,
    ...applyWinSaveDestination(choice, pending.seedText),
  };
}

type WinSaveHandleResult =
  | {
      kind: "offer";
      message: string;
      pending: WinSavePending;
    }
  | {
      kind: "saved";
      ack: string;
      openPlaceId?: "evidence-vault" | "portfolio";
    };

/** Explicit "save this win" / "add this to Hall" — menu or direct destination. */
export function handleWinSaveRequest(input: {
  userText: string;
  seedText?: string;
  offeredAtTurn: number;
}): WinSaveHandleResult | null {
  if (!detectsWinSaveRequest(input.userText)) return null;
  const seed =
    input.seedText?.trim() ||
    input.userText.replace(WIN_SAVE_STRIP_RE, "").trim() ||
    input.userText.trim();
  const preferred = preferredWinSaveDestination(input.userText);
  if (preferred) {
    return {
      kind: "saved",
      ...applyWinSaveDestination(preferred, seed),
    };
  }
  const pending = createWinSavePending({
    seedText: seed,
    offeredAtTurn: input.offeredAtTurn,
  });
  return {
    kind: "offer",
    message: formatWinSaveOfferMessage(pending.offer),
    pending,
  };
}

/**
 * 246 — when a moment worth saving is detected (not an explicit save request),
 * offer permission-first capture. Never auto-saves.
 */
export function handleEvidenceCaptureMoment(input: {
  userText: string;
  offeredAtTurn: number;
}): WinSaveHandleResult | null {
  if (detectsWinSaveRequest(input.userText)) return null;
  if (!detectsEvidenceCaptureMoment(input.userText)) return null;
  const pending = createWinSavePending({
    seedText: input.userText.trim(),
    offeredAtTurn: input.offeredAtTurn,
  });
  return {
    kind: "offer",
    message: formatWinSaveOfferMessage(pending.offer),
    pending,
  };
}

export type SoftEncouragementOffer = {
  kind: "soft-encouragement";
  line: string;
  placeId: "evidence-vault";
};

export function detectsSoftDiscouragement(text: string): boolean {
  const t = text.trim();
  if (
    /\b(?:evidence\s+vault|show\s+(?:me\s+)?proof|i\s+need\s+encouragement|remind\s+me\s+what|open\s+(?:my\s+)?(?:hall|vault))\b/i.test(
      t,
    )
  ) {
    return false;
  }
  return (
    shouldRecommendEvidenceVault(t) ||
    /\b(?:(?:i'?m\s+)?(?:feeling\s+)?(?:discouraged|stuck|defeated)|doubt(?:ing)?\s+myself|don'?t\s+trust\s+myself|imposter)\b/i.test(
      t,
    )
  );
}

/**
 * Single recommended next step for My Business Estate overview.
 */
import { getBusinessEstateSectionStatus } from "@/lib/profile/businessEstateProfile";
import { fieldPathHasValue } from "@/lib/profile/guidedStageCompletion";
import { isBusinessBasicsComplete } from "./businessBasics";
import type { EstateRecommendation } from "./types";

function hasPeopleIHelpFoundation(): boolean {
  try {
    const raw = localStorage.getItem("companion-ideal-clients-v1");
    if (!raw) return false;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function hasMainOffer(): boolean {
  return fieldPathHasValue("offers.mainOffer");
}

function hasValues(): boolean {
  return fieldPathHasValue("identity.coreValues");
}

function hasGoals(): boolean {
  return fieldPathHasValue("direction.currentGoals");
}

function hasBrandVoice(): boolean {
  return (
    fieldPathHasValue("brand.tone") || fieldPathHasValue("brand.brandPersonality")
  );
}

function hasSupportPreferences(): boolean {
  return fieldPathHasValue("work-style.shariSupportStyle");
}

const CANDIDATES: EstateRecommendation[] = [
  {
    id: "business-basics",
    title: "Identity Office — Business Basics",
    subtitle: "Tell Shari what your business is and where it stands today.",
    detail: "Help Shari learn the foundation of your business.",
    meta: "3 short questions · About 3 minutes",
    primaryLabel: "Start Business Basics",
    target: { kind: "business-basics" },
  },
  {
    id: "people-i-help-overview",
    title: "People I Help",
    subtitle: "Describe who you serve so guidance stays relevant.",
    detail: "Optional — open when you are ready.",
    meta: "Overview · About 5 minutes",
    primaryLabel: "Open People I Help",
    target: { kind: "people-i-help" },
  },
  {
    id: "main-offer",
    title: "Offer Suite — Main Offer",
    subtitle: "Name the offer you most want Shari to remember.",
    detail: "A clear main offer makes suggestions more useful.",
    meta: "One focused step",
    primaryLabel: "Enter Offer Suite",
    target: { kind: "room", sectionId: "offers" },
  },
  {
    id: "support-preferences",
    title: "Working Style Study — Support Preferences",
    subtitle: "Teach Shari how you like to be supported.",
    detail: "Optional preferences that shape pacing and tone.",
    meta: "A few short choices",
    primaryLabel: "Enter Working Style Study",
    target: { kind: "room", sectionId: "work-style" },
  },
  {
    id: "return-plan",
    title: "Return Plan",
    subtitle: "Plan how Shari should help you restart after interruptions.",
    detail: "Coming in a later pass.",
    meta: "Coming Later",
    primaryLabel: "Coming Later",
    target: { kind: "coming-later" },
  },
  {
    id: "what-would-make-spark-useful",
    title: "My Spark Impact",
    subtitle: "What would make Spark genuinely useful to you?",
    detail: "Coming in a later pass.",
    meta: "Coming Later",
    primaryLabel: "Coming Later",
    target: { kind: "coming-later" },
  },
  {
    id: "values",
    title: "Identity Office — Values",
    subtitle: "Share what your business stands for.",
    detail: "Planned for a later Identity Office pass.",
    meta: "Coming Later",
    primaryLabel: "Coming Later",
    target: { kind: "coming-later" },
  },
  {
    id: "goals",
    title: "Strategy Desk — Goals",
    subtitle: "Name what you are building toward.",
    detail: "Open Strategy Desk when you want direction support.",
    meta: "When you are ready",
    primaryLabel: "Enter Strategy Desk",
    target: { kind: "room", sectionId: "direction" },
  },
  {
    id: "brand-voice",
    title: "Brand Studio — Brand Voice",
    subtitle: "Shape how your business sounds.",
    detail: "Optional voice preferences for clearer writing help.",
    meta: "When useful",
    primaryLabel: "Enter Brand Studio",
    target: { kind: "room", sectionId: "brand" },
  },
  {
    id: "current-business-season",
    title: "Strategy Desk — Current Business Season",
    subtitle: "Name the season your business is in.",
    detail: "Planned for a later Strategy Desk pass.",
    meta: "Coming Later",
    primaryLabel: "Coming Later",
    target: { kind: "coming-later" },
  },
];

function isCandidateDone(id: EstateRecommendation["id"]): boolean {
  switch (id) {
    case "business-basics":
      return isBusinessBasicsComplete();
    case "people-i-help-overview":
      return hasPeopleIHelpFoundation();
    case "main-offer":
      return hasMainOffer();
    case "support-preferences":
      return hasSupportPreferences();
    case "return-plan":
    case "what-would-make-spark-useful":
    case "values":
    case "current-business-season":
      // Not implemented — skip so we never recommend a dead end first
      return true;
    case "goals":
      return hasGoals();
    case "brand-voice":
      return hasBrandVoice();
    default:
      return false;
  }
}

/**
 * One recommendation only. Skips completed early items.
 * Prefer actionable targets over Coming Later.
 */
export function getEstateRecommendation(): EstateRecommendation {
  for (const candidate of CANDIDATES) {
    if (isCandidateDone(candidate.id)) continue;
    if (candidate.target.kind === "coming-later") continue;
    if (candidate.id === "business-basics") {
      const progressStarted =
        getBusinessEstateSectionStatus("identity") !== "not-started" &&
        !isBusinessBasicsComplete();
      return {
        ...candidate,
        primaryLabel: progressStarted
          ? "Continue Business Basics"
          : "Start Business Basics",
      };
    }
    return candidate;
  }

  // Fallback: most useful unfinished implemented room
  const fallbackRooms = ["offers", "work-style", "direction", "brand"] as const;
  for (const sectionId of fallbackRooms) {
    const status = getBusinessEstateSectionStatus(sectionId);
    if (status === "not-started" || status === "started") {
      const fromList = CANDIDATES.find(
        (c) => c.target.kind === "room" && c.target.sectionId === sectionId,
      );
      if (fromList) return fromList;
    }
  }

  return {
    id: "business-basics",
    title: "Keep building at your pace",
    subtitle:
      "You already have a useful foundation. Add more whenever it would help.",
    detail: "Everything here stays optional.",
    meta: "Whenever you are ready",
    primaryLabel: "Review Business Basics",
    target: { kind: "business-basics" },
  };
}

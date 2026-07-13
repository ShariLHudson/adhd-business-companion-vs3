import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import { getGuidedFieldDef } from "@/lib/profile/guidedFieldRegistry";

export type BusinessEstateFieldType = "text" | "textarea";

export type BusinessEstateFieldDef = {
  key: string;
  label: string;
  type: BusinessEstateFieldType;
  placeholder?: string;
  /** Slice 1–2 guided fields */
  guided?: boolean;
};

/**
 * Field order for each Business Area.
 * Slice 1: stage, mission, vision, coreValues
 * Slice 2: motivation, return plan, decision style, work preferences
 */
export const BUSINESS_ESTATE_SECTION_FIELDS: Record<
  BusinessEstateSectionId,
  readonly BusinessEstateFieldDef[]
> = {
  identity: [
    { key: "businessName", label: "Business name", type: "text" },
    { key: "founderName", label: "Founder or owner name", type: "text" },
    { key: "roleTitle", label: "Role or title", type: "text" },
    { key: "website", label: "Website", type: "text" },
    {
      key: "businessStage",
      label: "Business stage",
      type: "text",
      guided: true,
    },
    {
      key: "shortDescription",
      label: "Short description",
      type: "textarea",
      placeholder: "A clear sentence about what your business does.",
    },
    {
      key: "businessStory",
      label: "Business story",
      type: "textarea",
    },
    { key: "mission", label: "Mission", type: "textarea", guided: true },
    { key: "vision", label: "Vision", type: "textarea", guided: true },
    { key: "coreValues", label: "Core values", type: "textarea", guided: true },
    {
      key: "coreValueNotes",
      label: "Why these values matter (optional)",
      type: "textarea",
      placeholder: "Optional notes about why a value matters to you.",
    },
    {
      key: "whyBusinessMatters",
      label: "Why this business matters",
      type: "textarea",
      guided: true,
    },
    {
      key: "whatInspiredYou",
      label: "What inspired you to begin",
      type: "textarea",
      guided: true,
    },
    {
      key: "hopedImpact",
      label: "Impact you hope to make",
      type: "textarea",
      guided: true,
    },
    {
      key: "whatHelpsYouContinue",
      label: "What helps you continue when things are difficult",
      type: "textarea",
      guided: true,
    },
  ],
  offers: [
    { key: "mainOffer", label: "Main offer", type: "textarea" },
    { key: "products", label: "Products", type: "textarea" },
    { key: "services", label: "Services", type: "textarea" },
    { key: "programs", label: "Programs", type: "textarea" },
    { key: "memberships", label: "Memberships", type: "textarea" },
    { key: "workshops", label: "Workshops", type: "textarea" },
    { key: "speakingTopics", label: "Speaking topics", type: "textarea" },
    {
      key: "offersInDevelopment",
      label: "Offers currently being developed",
      type: "textarea",
    },
    {
      key: "problemsSolved",
      label: "Problems the business solves",
      type: "textarea",
    },
    {
      key: "outcomesCreated",
      label: "Outcomes the business helps create",
      type: "textarea",
    },
  ],
  brand: [
    { key: "tagline", label: "Tagline", type: "text" },
    { key: "brandPersonality", label: "Brand personality", type: "textarea" },
    { key: "tone", label: "Tone", type: "text" },
    { key: "keyMessages", label: "Key messages", type: "textarea" },
    { key: "wordsToUse", label: "Words to use", type: "textarea" },
    { key: "wordsToAvoid", label: "Words to avoid", type: "textarea" },
    { key: "brandColors", label: "Brand colors", type: "text" },
    { key: "visualPreferences", label: "Visual preferences", type: "textarea" },
    { key: "contentBoundaries", label: "Content boundaries", type: "textarea" },
    {
      key: "valuesToReflect",
      label: "Values the business should reflect",
      type: "textarea",
    },
  ],
  direction: [
    { key: "currentPriority", label: "Current priority", type: "textarea" },
    { key: "currentGoals", label: "Current goals", type: "textarea" },
    { key: "mainProject", label: "Main project", type: "textarea" },
    { key: "nextMilestone", label: "Next milestone", type: "textarea" },
    { key: "openDecisions", label: "Decisions still open", type: "textarea" },
    {
      key: "ideasConsidering",
      label: "Ideas being considered",
      type: "textarea",
    },
    {
      key: "ideasParked",
      label: "Ideas parked for later",
      type: "textarea",
    },
    { key: "currentChallenges", label: "Current challenges", type: "textarea" },
    {
      key: "successLooksLike",
      label: "What success looks like next",
      type: "textarea",
    },
  ],
  "work-style": [
    {
      key: "preferredTimeOfDay",
      label: "Preferred work time",
      type: "text",
      guided: true,
    },
    {
      key: "preferredSessionLength",
      label: "Preferred session length",
      type: "text",
      guided: true,
    },
    {
      key: "soundPreference",
      label: "Work environment",
      type: "text",
      guided: true,
    },
    {
      key: "structurePreference",
      label: "Structure preference",
      type: "text",
      guided: true,
    },
    {
      key: "thinkingOrderPreference",
      label: "Thinking order",
      type: "text",
      guided: true,
    },
    {
      key: "collaborationPreference",
      label: "Working style",
      type: "text",
      guided: true,
    },
    {
      key: "decisionStyle",
      label: "Decision style",
      type: "textarea",
      guided: true,
    },
    {
      key: "overwhelmTriggers",
      label: "What usually makes returning difficult",
      type: "textarea",
      guided: true,
    },
    {
      key: "restartHelpers",
      label: "Smallest restart action",
      type: "textarea",
      guided: true,
    },
    {
      key: "returnSupportTone",
      label: "Support tone when you return",
      type: "text",
      guided: true,
    },
    {
      key: "shariShouldAvoid",
      label: "What Shari should avoid",
      type: "textarea",
      guided: true,
    },
    {
      key: "returnOfferPreferences",
      label: "On return, Shari may offer",
      type: "textarea",
      guided: true,
    },
    { key: "bestFocusTimes", label: "Best focus times (notes)", type: "textarea" },
    { key: "energyPatterns", label: "Energy patterns", type: "textarea" },
    {
      key: "planningPreferences",
      label: "Planning preferences (notes)",
      type: "textarea",
    },
    {
      key: "communicationPreferences",
      label: "Communication preferences (notes)",
      type: "textarea",
    },
    {
      key: "reminderPreferences",
      label: "Reminder preferences",
      type: "textarea",
    },
    { key: "commonFriction", label: "Common friction points", type: "textarea" },
    {
      key: "shariSupportStyle",
      label: "How Shari should support you (notes)",
      type: "textarea",
    },
  ],
  tools: [
    { key: "websitePlatform", label: "Website platform", type: "text" },
    { key: "calendar", label: "Calendar", type: "text" },
    { key: "fileStorage", label: "File storage", type: "text" },
    { key: "designTools", label: "Design tools", type: "text" },
    { key: "socialPlatforms", label: "Social platforms", type: "text" },
    { key: "paymentTools", label: "Payment tools", type: "text" },
    { key: "otherSystems", label: "Other systems", type: "text" },
  ],
};

export function sectionStorageKey(
  sectionId: BusinessEstateSectionId,
): keyof import("@/lib/profile/businessEstateProfile").BusinessEstateSections {
  return sectionId === "work-style" ? "workStyle" : sectionId;
}

export function fieldDisplayLabel(
  sectionId: BusinessEstateSectionId,
  field: BusinessEstateFieldDef,
): string {
  const guided = getGuidedFieldDef(sectionId, field.key);
  return guided?.question ?? field.label;
}

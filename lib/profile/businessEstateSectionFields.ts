import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";

export type BusinessEstateFieldType = "text" | "textarea";

export type BusinessEstateFieldDef = {
  key: string;
  label: string;
  type: BusinessEstateFieldType;
  placeholder?: string;
};

export const BUSINESS_ESTATE_SECTION_FIELDS: Record<
  BusinessEstateSectionId,
  readonly BusinessEstateFieldDef[]
> = {
  identity: [
    { key: "businessName", label: "Business name", type: "text" },
    { key: "founderName", label: "Founder or owner name", type: "text" },
    { key: "roleTitle", label: "Role or title", type: "text" },
    { key: "website", label: "Website", type: "text" },
    { key: "businessStage", label: "Business stage", type: "text" },
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
    { key: "mission", label: "Mission", type: "textarea" },
    { key: "vision", label: "Vision", type: "textarea" },
    { key: "coreValues", label: "Core values", type: "textarea" },
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
    { key: "bestFocusTimes", label: "Best focus times", type: "textarea" },
    { key: "energyPatterns", label: "Energy patterns", type: "textarea" },
    {
      key: "planningPreferences",
      label: "Planning preferences",
      type: "textarea",
    },
    {
      key: "communicationPreferences",
      label: "Communication preferences",
      type: "textarea",
    },
    {
      key: "reminderPreferences",
      label: "Reminder preferences",
      type: "textarea",
    },
    { key: "commonFriction", label: "Common friction points", type: "textarea" },
    {
      key: "restartHelpers",
      label: "What helps you restart",
      type: "textarea",
    },
    {
      key: "overwhelmTriggers",
      label: "What causes overwhelm",
      type: "textarea",
    },
    {
      key: "shariSupportStyle",
      label: "How Shari should support you",
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

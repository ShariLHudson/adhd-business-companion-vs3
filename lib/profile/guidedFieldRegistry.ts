/**
 * Guided field registry — Slice 1 + Slice 2.
 * Slice 1 entries are unchanged; Slice 2 is appended.
 */

import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_STAGE_CHOICES,
  CORE_VALUE_SUGGESTIONS,
  type GuidedFieldChoice,
  type GuidedFieldDefinition,
} from "@/lib/profile/guidedFieldTypes";
import { SLICE2_GUIDED_FIELDS } from "@/lib/profile/guidedFieldRegistrySlice2";

function def(
  partial: Omit<GuidedFieldDefinition, "saveRequiresApproval">,
): GuidedFieldDefinition {
  return { ...partial, saveRequiresApproval: true };
}

/** Slice 1 — do not alter these definitions. */
const SLICE1_REGISTRY: GuidedFieldDefinition[] = [
  def({
    sectionId: "identity",
    fieldKey: "businessStage",
    question: "Where is your business right now?",
    definition:
      "A simple picture of how far along the business is — not a grade, just orientation.",
    whyItMatters:
      "Knowing your season helps you choose next steps that fit, instead of copying advice meant for a different stage.",
    howThisHelpsShari:
      "I can adjust suggestions to fit where your business is now instead of giving launch advice to an established business or scaling advice to someone still exploring an idea.",
    inputType: "single_select",
    choices: [...BUSINESS_STAGE_CHOICES],
    examples: [
      {
        id: "stage-idea",
        businessType: "Consultant exploring a practice",
        example: "Idea",
        whyItWorks:
          "Names an exploring season without pressure to look further along than you are.",
      },
      {
        id: "stage-growing",
        businessType: "Local service with steady clients",
        example: "Growing",
        whyItWorks:
          "Signals customers exist and consistency is the focus — not starting over.",
      },
      {
        id: "stage-paused",
        businessType: "Maker stepping back for a season",
        example: "Paused",
        whyItWorks:
          "Honors rest without treating the business as finished or failed.",
      },
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
    enableResearchWithShari: true,
    relatedFieldPaths: [
      "identity.shortDescription",
      "identity.mission",
      "offers.mainOffer",
    ],
  }),
  def({
    sectionId: "identity",
    fieldKey: "mission",
    question: "What is your business here to do?",
    definition:
      "A mission statement explains why your business exists now, who it helps, and what meaningful change it helps create.",
    whyItMatters:
      "It can help you evaluate offers, write clearer marketing, choose priorities, and stay connected to the purpose behind the business.",
    howThisHelpsShari:
      "I can use your mission when helping with content, offers, planning, decisions, Chamber guidance, and Boardroom discussions.",
    distinctionNote:
      "Mission: why the business exists and what it does now. Vision: the future or impact the business hopes to help create.",
    inputType: "textarea",
    guidedQuestions: [
      "Who do you help?",
      "What need, problem, or desire do you address?",
      "What change do you help create?",
      "How do you help create that change?",
      "Why does this work matter to you?",
    ],
    examples: [
      {
        id: "mission-coach",
        businessType: "Coach or consultant",
        example:
          "I help overwhelmed founders keep important work moving without shame.",
        whyItWorks:
          "Names who is helped, the struggle, and the change — in everyday language.",
      },
      {
        id: "mission-handmade",
        businessType: "Handmade-product business",
        example:
          "I make thoughtful goods that help people bring a little calm into ordinary days.",
        whyItWorks: "Connects the craft to a feeling people want, not a slogan.",
      },
      {
        id: "mission-local",
        businessType: "Local service business",
        example:
          "We help busy households keep their spaces cared for so life feels lighter at home.",
        whyItWorks: "Clear who, what, and why — without corporate fluff.",
      },
      {
        id: "mission-author",
        businessType: "Author or speaker",
        example:
          "I write and speak so people who feel behind can find steadier next steps.",
        whyItWorks: "Purpose is human and specific, not a generic inspiration line.",
      },
      {
        id: "mission-membership",
        businessType: "Membership or online community",
        example:
          "We gather entrepreneurs who want belonging and practical support in the hard seasons.",
        whyItWorks: "States the community’s job without sounding like a pitch deck.",
      },
      {
        id: "mission-education",
        businessType: "Education or course business",
        example:
          "I teach practical skills so creative people can earn from their work with less confusion.",
        whyItWorks: "Outcome and audience are obvious in one breath.",
      },
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: [
      "identity.vision",
      "identity.coreValues",
      "offers.problemsSolved",
      "offers.outcomesCreated",
    ],
  }),
  def({
    sectionId: "identity",
    fieldKey: "vision",
    question: "What future would you like your business to help create?",
    definition:
      "A vision statement describes the future, impact, or change you hope your business will contribute to over time.",
    whyItMatters:
      "Your vision can help you decide which opportunities fit, what kind of growth matters, and what you do not want to lose as the business develops.",
    howThisHelpsShari:
      "I can compare plans, goals, projects, and opportunities with the future you actually want—not just with what might produce more work or revenue.",
    distinctionNote:
      "Mission: why the business exists and what it does now. Vision: the future or impact the business hopes to help create.",
    inputType: "textarea",
    guidedQuestions: [
      "What future do you hope to help create?",
      "What would be different for the people you serve?",
      "What impact would make this business feel worthwhile?",
      "What do you hope the business becomes known for?",
      "What do you want growth to make possible?",
    ],
    examples: [
      {
        id: "vision-coach",
        businessType: "Coach or consultant",
        example:
          "A world where entrepreneurs feel accompanied instead of alone in the hard seasons.",
        whyItWorks: "Points to a felt future without promising impossible scale.",
      },
      {
        id: "vision-handmade",
        businessType: "Handmade-product business",
        example:
          "Homes filled with objects that feel personal, lasting, and kindly made.",
        whyItWorks: "Vision is sensory and human — easy to picture.",
      },
      {
        id: "vision-local",
        businessType: "Local service business",
        example:
          "A neighborhood where people trust the helpers who care for their everyday life.",
        whyItWorks: "Local impact is clear without corporate grandiosity.",
      },
      {
        id: "vision-author",
        businessType: "Author or speaker",
        example:
          "Readers and audiences who leave with more courage and a next step they can actually take.",
        whyItWorks: "Focuses on the change in people, not fame metrics.",
      },
      {
        id: "vision-membership",
        businessType: "Membership or online community",
        example:
          "A steady circle where members return because they feel known and usefully supported.",
        whyItWorks: "Names belonging and usefulness as the future worth building.",
      },
      {
        id: "vision-education",
        businessType: "Education or course business",
        example:
          "Learners who finish with skill, confidence, and a path that fits their real life.",
        whyItWorks: "Success is capability — not course completion vanity.",
      },
    ],
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeDevelop: true,
    enableResearchWithShari: true,
    relatedFieldPaths: [
      "identity.mission",
      "identity.coreValues",
      "direction.successLooksLike",
    ],
  }),
  def({
    sectionId: "identity",
    fieldKey: "coreValues",
    question: "What values guide this business?",
    definition:
      "Core values are the principles you want your business choices, relationships, and work to reflect.",
    whyItMatters:
      "Values help you decide what fits, what does not fit, and how you want people to experience your business.",
    howThisHelpsShari:
      "I can use your values when helping you evaluate opportunities, write content, shape offers, set boundaries, and compare choices.",
    inputType: "chips_plus_custom",
    choices: [...CORE_VALUE_SUGGESTIONS],
    examples: [
      {
        id: "values-service",
        businessType: "Care-centered service",
        example: "Compassion, Reliability, Personal Connection",
        whyItWorks:
          "Shows how you want people to feel and what you will protect in the work.",
      },
      {
        id: "values-maker",
        businessType: "Creative studio",
        example: "Creativity, Quality, Simplicity",
        whyItWorks: "Guides craft and boundaries without a long manifesto.",
      },
      {
        id: "values-faith",
        businessType: "Faith-rooted practice",
        example: "Faith, Integrity, Service",
        whyItWorks: "Names the center of decision-making in plain words.",
      },
    ],
    guidedQuestions: [
      "What do you want customers to feel when working with you?",
      "What would you refuse to sacrifice for growth?",
      "What do you want your business to be known for?",
      "Which qualities matter most when you make a difficult decision?",
    ],
    allowCustom: true,
    allowImNotSure: true,
    enableExplainThis: true,
    enableShowExamples: true,
    enableHelpMeChoose: true,
    enableResearchWithShari: true,
    relatedFieldPaths: ["brand.valuesToReflect", "identity.mission"],
  }),
];

const REGISTRY: GuidedFieldDefinition[] = [
  ...SLICE1_REGISTRY,
  ...SLICE2_GUIDED_FIELDS,
];

const BY_PATH = new Map(
  REGISTRY.map((d) => [`${d.sectionId}.${d.fieldKey}`, d] as const),
);

export function listGuidedFieldDefs(
  sectionId?: BusinessEstateSectionId,
): GuidedFieldDefinition[] {
  if (!sectionId) return [...REGISTRY];
  return REGISTRY.filter((d) => d.sectionId === sectionId);
}

export function getGuidedFieldDef(
  sectionId: BusinessEstateSectionId,
  key: string,
): GuidedFieldDefinition | undefined {
  return BY_PATH.get(`${sectionId}.${key}`);
}

/** Best-effort match for display only — never auto-saves. */
export function findBusinessStageChoice(
  value: string,
): GuidedFieldChoice | undefined {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return undefined;
  return BUSINESS_STAGE_CHOICES.find(
    (c) =>
      c.id === trimmed ||
      c.label.toLowerCase() === trimmed ||
      trimmed.includes(c.label.toLowerCase()) ||
      c.label.toLowerCase().includes(trimmed),
  );
}

export function isGuidedIdentityField(key: string): boolean {
  return (
    key === "businessStage" ||
    key === "mission" ||
    key === "vision" ||
    key === "coreValues" ||
    key === "whyBusinessMatters" ||
    key === "whatInspiredYou" ||
    key === "hopedImpact" ||
    key === "whatHelpsYouContinue"
  );
}

export function isSlice1GuidedField(key: string): boolean {
  return (
    key === "businessStage" ||
    key === "mission" ||
    key === "vision" ||
    key === "coreValues"
  );
}

export type { GuidedFieldChoice, GuidedFieldDefinition };

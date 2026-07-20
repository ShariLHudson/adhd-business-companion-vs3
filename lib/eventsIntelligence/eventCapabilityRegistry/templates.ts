/**
 * 053 — Asset Templates (Layer 3)
 * Optional starting layouts — never a second Creation Record.
 */

import type { EventAssetTemplateDefinition } from "./types";

const ALL_TYPES = { mode: "all" as const };
const ALL_FORMATS = { mode: "all" as const };

export const EVENT_ASSET_TEMPLATES: readonly EventAssetTemplateDefinition[] = [
  {
    templateId: "tpl-agenda-one-day-workshop",
    assetTypeId: "agenda",
    label: "One-day workshop agenda",
    description: "Morning open · learning blocks · break · practice · close.",
    applicableEventTypes: {
      mode: "include",
      eventTypes: ["workshop", "training", "custom"],
    },
    formatApplicability: ALL_FORMATS,
    starterOutline: [
      "Welcome & orientation",
      "Context & outcomes",
      "Learning block 1",
      "Break",
      "Learning block 2 / practice",
      "Beta / feedback capture",
      "Close & next steps",
    ],
    status: "active",
    version: "053.1",
  },
  {
    templateId: "tpl-agenda-multi-day-conference",
    assetTypeId: "agenda",
    label: "Multi-day conference agenda",
    description: "Day-by-day arc with keynotes, breaks, and networking.",
    applicableEventTypes: {
      mode: "include",
      eventTypes: ["conference", "summit", "multi_day", "retreat"],
    },
    formatApplicability: ALL_FORMATS,
    starterOutline: [
      "Day 1 — Arrival & opening",
      "Day 1 — Core sessions",
      "Day 2 — Deep work / tracks",
      "Day 2 — Closing & next steps",
    ],
    status: "active",
    version: "053.1",
  },
  {
    templateId: "tpl-agenda-webinar",
    assetTypeId: "agenda",
    label: "Webinar agenda",
    description: "Short virtual arc with Q&A.",
    applicableEventTypes: {
      mode: "include",
      eventTypes: ["webinar"],
    },
    formatApplicability: {
      mode: "include",
      formats: ["virtual", "hybrid"],
    },
    starterOutline: [
      "Welcome & tech check",
      "Teaching segment",
      "Demo / walkthrough",
      "Q&A",
      "Close & CTA",
    ],
    status: "active",
    version: "053.1",
  },
  {
    templateId: "tpl-budget-simple",
    assetTypeId: "event_budget",
    label: "Simple event budget",
    description: "Core categories for a focused gathering.",
    applicableEventTypes: ALL_TYPES,
    formatApplicability: ALL_FORMATS,
    starterOutline: [
      "Venue / platform",
      "Facilitation",
      "Materials",
      "Marketing",
      "Contingency",
    ],
    status: "active",
    version: "053.1",
  },
  {
    templateId: "tpl-confirmation-workshop",
    assetTypeId: "registration_confirmation_email",
    label: "Workshop confirmation email",
    description: "Warm confirmation with what to expect.",
    applicableEventTypes: {
      mode: "include",
      eventTypes: ["workshop", "training", "webinar", "custom"],
    },
    formatApplicability: ALL_FORMATS,
    starterOutline: [
      "You're registered",
      "Date & access details",
      "What to bring / prepare",
      "How to reach us",
    ],
    status: "active",
    version: "053.1",
  },
  {
    templateId: "tpl-run-of-show-delivery",
    assetTypeId: "run_of_show",
    label: "Delivery-day run of show",
    description: "Minute-by-minute team plan.",
    applicableEventTypes: ALL_TYPES,
    formatApplicability: ALL_FORMATS,
    starterOutline: [
      "T-60 setup",
      "Doors / join open",
      "Program blocks",
      "Breaks",
      "Close & reset",
    ],
    status: "active",
    version: "053.1",
  },
];

export function listEventAssetTemplates(
  assetTypeId?: string,
): EventAssetTemplateDefinition[] {
  const all = EVENT_ASSET_TEMPLATES.filter((t) => t.status !== "deprecated");
  return assetTypeId
    ? all.filter((t) => t.assetTypeId === assetTypeId)
    : [...all];
}

export function getEventAssetTemplate(
  templateId: string,
): EventAssetTemplateDefinition | null {
  return EVENT_ASSET_TEMPLATES.find((t) => t.templateId === templateId) ?? null;
}

export function templatesForSectionAssetTypes(
  assetTypeIds: readonly string[],
): EventAssetTemplateDefinition[] {
  const set = new Set(assetTypeIds);
  return EVENT_ASSET_TEMPLATES.filter(
    (t) => t.status !== "deprecated" && set.has(t.assetTypeId),
  );
}

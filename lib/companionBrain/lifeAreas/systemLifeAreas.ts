/**
 * System Life Areas™ — permanent, ship with the product.
 */

import type { LifeArea } from "./types";

type SystemLifeAreaDef = LifeArea & {
  keywords: string[];
};

const defs: SystemLifeAreaDef[] = [
  {
    id: "sys:business",
    name: "Business",
    kind: "system",
    color: "#4a6fa5",
    legacyDomain: "business",
    keywords: ["business", "revenue", "founder", "strategy", "operations"],
  },
  {
    id: "sys:marketing",
    name: "Marketing",
    kind: "system",
    color: "#5b7fc4",
    legacyDomain: "business",
    keywords: [
      "marketing",
      "newsletter",
      "campaign",
      "launch",
      "funnel",
      "content",
      "post",
      "audience",
    ],
  },
  {
    id: "sys:health",
    name: "Health",
    kind: "system",
    color: "#2e8b57",
    legacyDomain: "health",
    keywords: [
      "health",
      "doctor",
      "dentist",
      "exercise",
      "bike",
      "walk",
      "sleep",
      "therapy",
      "medication",
      "appointment",
    ],
  },
  {
    id: "sys:relationships-networking",
    name: "Relationships & Networking",
    kind: "system",
    color: "#d4688a",
    legacyDomain: "relationships",
    keywords: [
      "linkedin",
      "network",
      "networking",
      "connect",
      "introduction",
      "referral",
      "relationship",
      "reach out",
      "follow up with",
    ],
  },
  {
    id: "sys:family",
    name: "Family",
    kind: "system",
    color: "#c97b5a",
    legacyDomain: "relationships",
    keywords: [
      "family",
      "mom",
      "dad",
      "daughter",
      "son",
      "grandkids",
      "grandson",
      "granddaughter",
      "spouse",
      "partner",
    ],
  },
  {
    id: "sys:home",
    name: "Home",
    kind: "system",
    color: "#b8896a",
    legacyDomain: "personal",
    keywords: ["home", "house", "laundry", "cleaning", "repair", "yard", "garden"],
  },
  {
    id: "sys:finance",
    name: "Finance",
    kind: "system",
    color: "#3d8b7a",
    legacyDomain: "business",
    keywords: ["finance", "invoice", "budget", "tax", "bank", "payment", "pricing"],
  },
  {
    id: "sys:learning",
    name: "Learning",
    kind: "system",
    color: "#9a6fb0",
    legacyDomain: "learning",
    keywords: ["learn", "study", "course", "research", "read", "training", "webinar"],
  },
  {
    id: "sys:personal-growth",
    name: "Personal Growth",
    kind: "system",
    color: "#e8954a",
    legacyDomain: "personal",
    keywords: ["journal", "reflection", "habit", "mindset", "coaching", "growth"],
  },
  {
    id: "sys:creative",
    name: "Creative",
    kind: "system",
    color: "#d4a03c",
    legacyDomain: "personal",
    keywords: ["creative", "design", "paint", "write", "craft", "art", "music"],
  },
  {
    id: "sys:travel",
    name: "Travel",
    kind: "system",
    color: "#5a9fb8",
    legacyDomain: "personal",
    keywords: ["travel", "flight", "hotel", "trip", "vacation", "itinerary"],
  },
  {
    id: "sys:technology",
    name: "Technology",
    kind: "system",
    color: "#6b7fa8",
    legacyDomain: "business",
    keywords: ["app", "software", "tech", "website", "code", "deploy", "bug", "api"],
  },
  {
    id: "sys:administration",
    name: "Administration",
    kind: "system",
    color: "#7a8a96",
    legacyDomain: "business",
    keywords: ["admin", "paperwork", "file", "organize", "crm", "schedule meeting"],
  },
  {
    id: "sys:spiritual",
    name: "Spiritual",
    kind: "system",
    color: "#8a7ab5",
    legacyDomain: "personal",
    keywords: ["church", "prayer", "spiritual", "faith", "worship", "bible"],
  },
  {
    id: "sys:community",
    name: "Community",
    kind: "system",
    color: "#6a9a7a",
    legacyDomain: "relationships",
    keywords: ["community", "volunteer", "group", "club", "neighbor"],
  },
];

export const SYSTEM_LIFE_AREAS: LifeArea[] = defs.map(
  ({ keywords: _keywords, ...area }) => area,
);

export const SYSTEM_LIFE_AREA_KEYWORDS: Record<string, string[]> = Object.fromEntries(
  defs.map((d) => [d.id, d.keywords]),
);

export function getSystemLifeArea(id: string): LifeArea | undefined {
  return SYSTEM_LIFE_AREAS.find((a) => a.id === id);
}

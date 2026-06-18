// Create catalog — categorized business assets users can build beside chat.

import type { AppSection } from "./companionUi";
import { sortByDropdownLabel, sortDropdownLabels } from "./dropdownSort";

export type CreateCatalogItem = {
  label: string;
  emoji: string;
  /** Extra phrases for intent matching (lowercase). */
  matchTerms?: string[];
  /** Opens a non–content-generator workspace when set. */
  route?: AppSection;
};

export type CreateCatalogCategory = {
  id: string;
  label: string;
  items: CreateCatalogItem[];
};

export const CREATE_CATALOG: CreateCatalogCategory[] = [
  {
    id: "business-assets",
    label: "Business Assets",
    items: [
      {
        label: "Automation",
        emoji: "🔄",
        matchTerms: ["automation", "automate", "workflow automation"],
      },
      {
        label: "Checklist",
        emoji: "✅",
        matchTerms: ["checklist", "task list"],
      },
      {
        label: "Claude Prompt",
        emoji: "🤖",
        matchTerms: ["claude prompt", "ai prompt", "chatgpt prompt"],
      },
      {
        label: "GHL Workflow",
        emoji: "⚙️",
        matchTerms: [
          "ghl",
          "go high level",
          "highlevel",
          "ghl workflow",
          "ghl automation",
          "ghl instructions",
        ],
      },
      {
        label: "Newsletter",
        emoji: "📰",
        matchTerms: ["newsletter"],
      },
      {
        label: "Offer",
        emoji: "🎁",
        matchTerms: ["offer", "offer stack", "pricing offer"],
      },
      {
        label: "Process",
        emoji: "🔁",
        matchTerms: ["process doc", "process document", "business process"],
      },
      {
        label: "Sales Page",
        emoji: "💰",
        matchTerms: ["sales page", "sales letter"],
      },
      {
        label: "Landing Page",
        emoji: "🌐",
        matchTerms: ["landing page", "lead capture page"],
      },
      {
        label: "Lead Magnet",
        emoji: "🧲",
        matchTerms: ["lead magnet", "freebie", "opt-in", "opt in"],
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        label: "Blog Post",
        emoji: "📝",
        matchTerms: ["blog", "blog post", "article"],
      },
      {
        label: "Email",
        emoji: "✉️",
        matchTerms: ["email", "e-mail", "cold email", "follow-up email"],
      },
      {
        label: "Facebook Post",
        emoji: "📘",
        matchTerms: ["facebook", "facebook post", "fb post", "fb"],
      },
      {
        label: "LinkedIn Post",
        emoji: "💼",
        matchTerms: ["linkedin post", "linkedin", "professional post"],
      },
      {
        label: "Presentation",
        emoji: "📊",
        matchTerms: ["presentation", "slide deck", "slides", "deck"],
      },
      {
        label: "Social Post",
        emoji: "📱",
        matchTerms: [
          "social post",
          "social media post",
          "social campaign",
          "social media",
          "caption",
          "instagram",
        ],
      },
      {
        label: "Video Script",
        emoji: "🎬",
        matchTerms: ["script", "video script", "podcast script"],
      },
      {
        label: "Workshop",
        emoji: "🎓",
        matchTerms: [
          "workshop",
          "workshop plan",
          "workshop outline",
          "webinar plan",
          "webinar",
        ],
      },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    items: [
      {
        label: "Business Plan",
        emoji: "🏢",
        matchTerms: ["business plan"],
      },
      {
        label: "Document",
        emoji: "📄",
        matchTerms: ["document", "general document"],
      },
      {
        label: "Client Avatar",
        emoji: "👤",
        route: "client-avatars",
        matchTerms: ["client avatar", "ideal client", "icp", "buyer persona"],
      },
      {
        label: "Proposal",
        emoji: "📄",
        matchTerms: ["proposal", "scope of work", "sow", "statement of work"],
      },
      {
        label: "SOP",
        emoji: "📋",
        matchTerms: [
          "sop",
          "standard operating procedure",
          "procedure",
          "workflow doc",
        ],
      },
      {
        label: "Training Guide",
        emoji: "📖",
        matchTerms: [
          "training guide",
          "training manual",
          "course outline",
          "training doc",
        ],
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      {
        label: "Content Strategy",
        emoji: "🧭",
        matchTerms: ["content strategy"],
      },
      {
        label: "Email Campaign",
        emoji: "📬",
        matchTerms: [
          "email campaign",
          "email sequence",
          "email series",
          "drip sequence",
          "nurture sequence",
        ],
      },
      {
        label: "Launch Plan",
        emoji: "🚀",
        matchTerms: ["launch plan", "product launch"],
      },
      {
        label: "Marketing Strategy",
        emoji: "🎯",
        matchTerms: ["marketing strategy", "growth strategy", "go-to-market"],
      },
      {
        label: "Sales Funnel",
        emoji: "🔽",
        matchTerms: ["funnel", "sales funnel", "marketing funnel"],
      },
    ],
  },
  {
    id: "planning",
    label: "Planning",
    items: [
      {
        label: "5-Day Plan",
        emoji: "📅",
        matchTerms: ["5 day plan", "5-day plan", "five day plan"],
      },
      {
        label: "Content Calendar",
        emoji: "🗓️",
        matchTerms: ["content calendar", "editorial calendar"],
      },
      {
        label: "Marketing Plan",
        emoji: "📋",
        matchTerms: ["marketing plan", "content plan"],
      },
    ],
  },
  {
    id: "relationships",
    label: "Relationships",
    items: [
      {
        label: "Client Check-In",
        emoji: "🤝",
        matchTerms: ["client check-in", "check in", "check-in"],
      },
      {
        label: "Follow-Up Email",
        emoji: "✉️",
        matchTerms: ["follow up email", "follow-up email", "follow up"],
      },
      {
        label: "Referral Request",
        emoji: "💬",
        matchTerms: ["referral request", "referral ask", "referral"],
      },
      {
        label: "Testimonial Request",
        emoji: "⭐",
        matchTerms: ["testimonial request", "testimonial ask", "testimonial"],
      },
    ],
  },
  {
    id: "strategies",
    label: "Strategies",
    items: [
      {
        label: "Business Strategy",
        emoji: "🏢",
        matchTerms: [
          "business strategy",
          "strategic plan",
          "strategy doc",
        ],
      },
      {
        label: "Personal Companion Strategy",
        emoji: "🧠",
        matchTerms: [
          "personal companion strategy",
          "personal strategy",
          "companion strategy",
          "adhd strategy",
        ],
      },
    ],
  },
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function allCatalogItems(): CreateCatalogItem[] {
  return CREATE_CATALOG.flatMap((c) => c.items);
}

/** User-facing catalog — categories and types in alphabetical order. */
export function sortedCreateCatalog(): CreateCatalogCategory[] {
  return sortByDropdownLabel(CREATE_CATALOG, (c) => c.label).map((cat) => ({
    ...cat,
    items: sortByDropdownLabel(cat.items, (i) => i.label),
  }));
}

export function catalogCategory(id: string) {
  return CREATE_CATALOG.find((c) => c.id === id);
}

/** Dropdown label for step 2, e.g. "Content Types". */
export function catalogTypesPickerLabel(categoryId: string): string {
  const cat = catalogCategory(categoryId);
  return cat ? `${cat.label} Types` : "Types";
}

/** All items in a category for the type dropdown (alphabetical). */
export function dropdownItemsInCategory(categoryId: string): CreateCatalogItem[] {
  const cat = catalogCategory(categoryId);
  if (!cat) return [];
  return sortByDropdownLabel(cat.items, (i) => i.label);
}

/** Labels for content-type pickers (excludes routed tools). */
export function createCatalogTypeLabels(): string[] {
  return sortDropdownLabels(
    allCatalogItems()
      .filter((i) => !i.route)
      .map((i) => i.label),
  );
}

export function findCatalogItem(label: string): CreateCatalogItem | undefined {
  const t = label.trim().toLowerCase();
  return allCatalogItems().find((i) => i.label.toLowerCase() === t);
}

/** Intent rules — one regex per catalog item (most-specific labels first in catalog). */
export function catalogIntentTypeRules(): { type: string; re: RegExp }[] {
  return allCatalogItems()
    .filter((i) => !i.route)
    .map((item) => {
      const terms = [item.label, ...(item.matchTerms ?? [])].map(escapeRegex);
      return {
        type: item.label,
        re: new RegExp(`\\b(${terms.join("|")})\\b`, "gi"),
      };
    });
}

/** Match user text to a catalog create type or routed section. */
export function matchCatalogFromText(text: string): {
  type?: string;
  route?: AppSection;
} | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  let best: { index: number; item: CreateCatalogItem } | null = null;

  for (const item of allCatalogItems()) {
    const terms = [item.label.toLowerCase(), ...(item.matchTerms ?? [])];
    for (const term of terms) {
      const re = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
      const match = re.exec(t);
      if (!match) continue;
      const idx = match.index;
      if (!best || idx > best.index) best = { index: idx, item };
    }
  }

  if (!best) return null;
  if (best.item.route) return { route: best.item.route };
  return { type: best.item.label };
}

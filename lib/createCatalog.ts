// Create catalog — categorized business assets users can build beside chat.

import type { AppSection } from "./companionUi";

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
    id: "business",
    label: "Business Assets",
    items: [
      {
        label: "Proposal",
        emoji: "📄",
        matchTerms: ["proposal", "scope of work", "sow", "statement of work"],
      },
      {
        label: "Client Avatar",
        emoji: "👤",
        route: "client-avatars",
        matchTerms: ["client avatar", "ideal client", "icp", "buyer persona"],
      },
      {
        label: "Offer",
        emoji: "🎁",
        matchTerms: ["offer", "offer stack", "pricing offer"],
      },
      {
        label: "Sales Page",
        emoji: "💰",
        matchTerms: ["sales page", "landing page", "sales letter"],
      },
      {
        label: "Funnel",
        emoji: "🔽",
        matchTerms: ["funnel", "sales funnel", "marketing funnel"],
      },
      {
        label: "Workshop",
        emoji: "🎓",
        route: "projects",
        matchTerms: [
          "workshop",
          "workshop plan",
          "workshop outline",
          "webinar plan",
          "webinar",
        ],
      },
      {
        label: "SOP",
        emoji: "📋",
        matchTerms: ["sop", "standard operating procedure", "procedure", "workflow doc"],
      },
      {
        label: "Business Plan",
        emoji: "🏢",
        matchTerms: ["business plan"],
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        label: "LinkedIn Post",
        emoji: "💼",
        matchTerms: ["linkedin post", "linkedin", "professional post"],
      },
      {
        label: "Email",
        emoji: "✉️",
        matchTerms: ["email", "e-mail", "cold email", "follow-up email"],
      },
      {
        label: "Email Sequence",
        emoji: "📬",
        matchTerms: ["email sequence", "email series", "drip sequence", "nurture sequence"],
      },
      {
        label: "Blog",
        emoji: "📝",
        matchTerms: ["blog", "blog post", "article"],
      },
      {
        label: "Script",
        emoji: "🎬",
        matchTerms: ["script", "video script", "podcast script"],
      },
      {
        label: "Newsletter",
        emoji: "📰",
        matchTerms: ["newsletter"],
      },
      {
        label: "Presentation",
        emoji: "📊",
        matchTerms: ["presentation", "slide deck", "slides", "deck"],
      },
      {
        label: "Social Campaign",
        emoji: "📱",
        matchTerms: ["social campaign", "social post", "social media campaign", "caption"],
      },
    ],
  },
  {
    id: "planning",
    label: "Planning",
    items: [
      {
        label: "Marketing Plan",
        emoji: "🧭",
        matchTerms: ["marketing plan", "content plan"],
      },
      {
        label: "Launch Plan",
        emoji: "🚀",
        matchTerms: ["launch plan", "product launch"],
      },
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
    ],
  },
  {
    id: "implementation",
    label: "Implementation",
    items: [
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
        label: "Process",
        emoji: "🔁",
        matchTerms: ["process doc", "process document", "business process"],
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

/** Labels for content-type pickers (excludes routed tools). */
export function createCatalogTypeLabels(): string[] {
  return allCatalogItems()
    .filter((i) => !i.route)
    .map((i) => i.label);
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
      const terms = [
        item.label,
        ...(item.matchTerms ?? []),
      ].map(escapeRegex);
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

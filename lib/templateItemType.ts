import { normalizeArtifactType } from "./artifactType";
import type { TemplateCategory, TemplateItem } from "./companionStore";

const SUBCATEGORY_ITEM_TYPE: Record<string, string> = {
  "Social posts": "Social Post",
  Articles: "Blog Post",
  Scripts: "Video Script",
  Ideas: "content",
  "Service descriptions": "Offer",
  "Pricing pages": "Sales Page",
  Funnels: "Sales Funnel",
  "Product offers": "Offer",
  "Launch sequences": "Email Campaign",
  "Follow-ups": "Email",
  "Nurture emails": "Email",
  "Sales emails": "Email",
  "Marketing strategies": "Marketing Strategy",
  "Growth plans": "Business Strategy",
  "Positioning frameworks": "Business Strategy",
  "Campaign structures": "Marketing Plan",
  "Workflow templates": "SOP",
  SOPs: "SOP",
  "Automation flows": "SOP",
  "Focus plans": "content",
  "Brain dump structures": "content",
  "Reset routines": "content",
  "Weekly planning": "content",
};

const CATEGORY_ITEM_TYPE: Record<TemplateCategory, string> = {
  content: "Social Post",
  offers: "Offer",
  emails: "Email",
  strategy: "Business Strategy",
  systems: "SOP",
  execution: "content",
  other: "content",
};

const TITLE_HINTS: { re: RegExp; type: string }[] = [
  { re: /\bworkshop\b/i, type: "Workshop" },
  { re: /\bwebinar\b/i, type: "Workshop" },
  { re: /\bnewsletter\b/i, type: "Newsletter" },
  { re: /\bsop\b/i, type: "SOP" },
  { re: /\bproposal\b/i, type: "Proposal" },
  { re: /\bpresentation\b/i, type: "Presentation" },
  { re: /\btraining\b/i, type: "Training Guide" },
  { re: /\bemail\b/i, type: "Email" },
  { re: /\bfollow[- ]?up\b/i, type: "Email" },
  { re: /\bsocial\b/i, type: "Social Post" },
];

/** Map a saved template library item to a Create catalog item type. */
export function itemTypeFromTemplate(template: TemplateItem): string {
  const sub = template.subcategory?.trim();
  if (sub && SUBCATEGORY_ITEM_TYPE[sub]) {
    return SUBCATEGORY_ITEM_TYPE[sub];
  }
  for (const { re, type } of TITLE_HINTS) {
    if (re.test(template.title)) return type;
  }
  if (sub) {
    const fromCatalog = normalizeArtifactType(sub.replace(/s$/i, ""));
    if (fromCatalog !== "content") return fromCatalog;
  }
  return normalizeArtifactType(CATEGORY_ITEM_TYPE[template.category]);
}

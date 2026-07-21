import { getObjectType } from "./objectTypes";
import type {
  SharedObjectCreationAuthority,
  SharedObjectTypeId,
} from "./types";

export type MappedObjectHint = {
  objectTypeId: SharedObjectTypeId;
  creationAuthority: SharedObjectCreationAuthority;
};

/** Map deliverable / context labels → shared object + honest authority. */
export function mapLabelToSharedObject(label: string): MappedObjectHint {
  const n = label.trim().toLowerCase();

  const rules: Array<{ re: RegExp; hint: MappedObjectHint }> = [
    {
      re: /\b(dashboard|kpi dashboard|scorecard)\b/,
      hint: { objectTypeId: "dashboard", creationAuthority: "prepare" },
    },
    {
      re: /\b(metric|kpi)\b/,
      hint: {
        objectTypeId: "metric_definition",
        creationAuthority: "prepare",
      },
    },
    {
      re: /\b(invoice)\b/,
      hint: { objectTypeId: "invoice", creationAuthority: "prepare" },
    },
    {
      re: /\b(payment|paid|payout)\b/,
      hint: {
        objectTypeId: "payment",
        creationAuthority: "completed_elsewhere",
      },
    },
    {
      re: /\b(proposal|line sheet)\b/,
      hint: { objectTypeId: "proposal", creationAuthority: "fully_create" },
    },
    {
      re: /\b(agreement|contract)\b/,
      hint: {
        objectTypeId: "agreement",
        creationAuthority: "completed_elsewhere",
      },
    },
    {
      re: /\b(subscription)\b/,
      hint: { objectTypeId: "subscription", creationAuthority: "prepare" },
    },
    {
      re: /\b(pricing|price list|margin|costing|financial model)\b/,
      hint: { objectTypeId: "pricing_model", creationAuthority: "prepare" },
    },
    {
      re: /\b(offer|package)\b/,
      hint: { objectTypeId: "offer", creationAuthority: "prepare" },
    },
    {
      re: /\b(product|sku|assortment)\b/,
      hint: { objectTypeId: "product", creationAuthority: "prepare" },
    },
    {
      re: /\b(service suite|services)\b/,
      hint: { objectTypeId: "service", creationAuthority: "prepare" },
    },
    {
      re: /\b(project|launch roadmap|operating calendar)\b/,
      hint: {
        objectTypeId: "project",
        creationAuthority: "completed_elsewhere",
      },
    },
    {
      re: /\b(checklist|task list|next actions)\b/,
      hint: { objectTypeId: "checklist", creationAuthority: "fully_create" },
    },
    {
      re: /\b(task)\b/,
      hint: { objectTypeId: "task", creationAuthority: "prepare" },
    },
    {
      re: /\b(avatar|audience|customer journey|clients)\b/,
      hint: {
        objectTypeId: "client_avatar",
        creationAuthority: "user_provided",
      },
    },
    {
      re: /\b(vendor|supplier)\b/,
      hint: {
        objectTypeId: "vendor_account",
        creationAuthority: "user_provided",
      },
    },
    {
      re: /\b(inventory|stock)\b/,
      hint: {
        objectTypeId: "inventory_item",
        creationAuthority: "user_provided",
      },
    },
    {
      re: /\b(location|space|store layout)\b/,
      hint: { objectTypeId: "location", creationAuthority: "user_provided" },
    },
    {
      re: /\b(template|manual|playbook|workflow|sop)\b/,
      hint: { objectTypeId: "template", creationAuthority: "fully_create" },
    },
    {
      re: /\b(decision)\b/,
      hint: { objectTypeId: "decision", creationAuthority: "prepare" },
    },
    {
      re: /\b(risk)\b/,
      hint: { objectTypeId: "risk", creationAuthority: "prepare" },
    },
    {
      re: /\b(content|copy|email|message)\b/,
      hint: { objectTypeId: "content_asset", creationAuthority: "prepare" },
    },
    {
      re: /\b(plan|snapshot|brief|architecture|map|roadmap|calendar)\b/,
      hint: {
        objectTypeId: "create_artifact",
        creationAuthority: "fully_create",
      },
    },
  ];

  for (const r of rules) {
    if (r.re.test(n)) return r.hint;
  }

  return {
    objectTypeId: "create_artifact",
    creationAuthority: "prepare",
  };
}

export function mapKnownContextKeyToObject(
  key: string,
): MappedObjectHint | null {
  const k = key.trim().toLowerCase();
  const table: Record<string, MappedObjectHint> = {
    purpose: { objectTypeId: "business", creationAuthority: "user_provided" },
    vision: { objectTypeId: "business", creationAuthority: "user_provided" },
    mission: { objectTypeId: "business", creationAuthority: "user_provided" },
    stage: { objectTypeId: "business", creationAuthority: "user_provided" },
    audience: {
      objectTypeId: "client_avatar",
      creationAuthority: "user_provided",
    },
    customers: {
      objectTypeId: "client_avatar",
      creationAuthority: "user_provided",
    },
    clients: {
      objectTypeId: "client_avatar",
      creationAuthority: "user_provided",
    },
    offers: { objectTypeId: "offer", creationAuthority: "user_provided" },
    products: { objectTypeId: "product", creationAuthority: "user_provided" },
    services: { objectTypeId: "service", creationAuthority: "user_provided" },
    pricing: {
      objectTypeId: "pricing_model",
      creationAuthority: "user_provided",
    },
    channels: { objectTypeId: "business", creationAuthority: "user_provided" },
    inventory: {
      objectTypeId: "inventory_item",
      creationAuthority: "user_provided",
    },
    active_business: {
      objectTypeId: "business",
      creationAuthority: "user_provided",
    },
  };
  return table[k] ?? null;
}

export function authorityFromCreateabilityState(
  creationState: string,
): SharedObjectCreationAuthority {
  switch (creationState) {
    case "direct":
    case "structured":
    case "composed":
      return "fully_create";
    case "connected":
      return "completed_elsewhere";
    case "draft_only":
      return "prepare";
    case "future":
      return "completed_elsewhere";
    default:
      return "prepare";
  }
}

export function makeSharedDependencyId(
  blueprintId: string,
  objectTypeId: SharedObjectTypeId,
  sourceLabel: string,
): string {
  const slug = sourceLabel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 48);
  return `${blueprintId}::${objectTypeId}::${slug || "dep"}`;
}

export function resolveDefaultAuthority(
  objectTypeId: SharedObjectTypeId,
): SharedObjectCreationAuthority {
  return getObjectType(objectTypeId)?.defaultAuthority ?? "prepare";
}

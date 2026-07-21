import type { CanonicalContextEntity } from "./types";

export type MappedContextKey = {
  canonicalFieldId: string;
  entity: CanonicalContextEntity;
};

/**
 * Map adaptive knownContextKeys → canonical field IDs (274).
 * Best-effort; unmapped keys land on blueprint_session.current_goal for audit visibility.
 */
export function mapKnownContextKey(key: string): MappedContextKey {
  const k = key.trim().toLowerCase();

  const table: Record<string, MappedContextKey> = {
    active_business: {
      canonicalFieldId: "business.business_id",
      entity: "business",
    },
    purpose: { canonicalFieldId: "business.vision", entity: "business" },
    vision: { canonicalFieldId: "business.vision", entity: "business" },
    mission: { canonicalFieldId: "business.mission", entity: "business" },
    specialty: {
      canonicalFieldId: "business_dna.positioning",
      entity: "business_dna",
    },
    audience: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    customers: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    clients: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    payers: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    readers: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    buyers: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    member: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    learner: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    fit: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    non_fit: {
      canonicalFieldId: "client_avatar.frustrations",
      entity: "client_avatar",
    },
    users: {
      canonicalFieldId: "client_avatar.description",
      entity: "client_avatar",
    },
    offers: { canonicalFieldId: "offer.name", entity: "offer" },
    services: {
      canonicalFieldId: "product_or_service.name",
      entity: "product_or_service",
    },
    products: {
      canonicalFieldId: "product_or_service.name",
      entity: "product_or_service",
    },
    pricing: {
      canonicalFieldId: "offer.description",
      entity: "offer",
    },
    channels: { canonicalFieldId: "business.channels", entity: "business" },
    marketplaces: { canonicalFieldId: "business.channels", entity: "business" },
    calendar: { canonicalFieldId: "business.constraints", entity: "business" },
    shows: { canonicalFieldId: "business.channels", entity: "business" },
    goals: { canonicalFieldId: "business.goals", entity: "business" },
    priorities: { canonicalFieldId: "business.goals", entity: "business" },
    constraints: {
      canonicalFieldId: "business.constraints",
      entity: "business",
    },
    space: { canonicalFieldId: "business.location", entity: "business" },
    information: {
      canonicalFieldId: "business.description",
      entity: "business",
    },
    process: {
      canonicalFieldId: "business.description",
      entity: "business",
    },
    workflow: {
      canonicalFieldId: "business.description",
      entity: "business",
    },
    strategy: {
      canonicalFieldId: "business_dna.positioning",
      entity: "business_dna",
    },
    author_identity: {
      canonicalFieldId: "business_dna.positioning",
      entity: "business_dna",
    },
    course: { canonicalFieldId: "offer.name", entity: "offer" },
    course_model: { canonicalFieldId: "offer.description", entity: "offer" },
    membership: { canonicalFieldId: "offer.name", entity: "offer" },
    membership_model: {
      canonicalFieldId: "offer.description",
      entity: "offer",
    },
    model: { canonicalFieldId: "offer.description", entity: "offer" },
    delivery: { canonicalFieldId: "offer.description", entity: "offer" },
    publishing_path: {
      canonicalFieldId: "offer.description",
      entity: "offer",
    },
    publish: { canonicalFieldId: "offer.description", entity: "offer" },
    demand: {
      canonicalFieldId: "client_avatar.goals",
      entity: "client_avatar",
    },
    validation: {
      canonicalFieldId: "client_avatar.goals",
      entity: "client_avatar",
    },
    inventory: {
      canonicalFieldId: "product_or_service.name",
      entity: "product_or_service",
    },
    systems: {
      canonicalFieldId: "business.description",
      entity: "business",
    },
    roles: { canonicalFieldId: "business.constraints", entity: "business" },
    handoffs: { canonicalFieldId: "business.constraints", entity: "business" },
    owners: { canonicalFieldId: "business.constraints", entity: "business" },
    next_actions: {
      canonicalFieldId: "blueprint_session.current_goal",
      entity: "blueprint_session",
    },
    next_action: {
      canonicalFieldId: "blueprint_session.current_goal",
      entity: "blueprint_session",
    },
    next_step: {
      canonicalFieldId: "blueprint_session.current_goal",
      entity: "blueprint_session",
    },
  };

  return (
    table[k] ?? {
      canonicalFieldId: "blueprint_session.current_goal",
      entity: "blueprint_session",
    }
  );
}

export function makeDependencyId(
  blueprintId: string,
  questionId: string | undefined,
  knownContextKey: string,
): string {
  const q = questionId?.trim() || "context";
  const key = knownContextKey.trim().toLowerCase().replace(/\s+/g, "_");
  return `${blueprintId}::${q}::${key}`;
}

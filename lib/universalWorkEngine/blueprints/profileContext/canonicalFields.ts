import type { CanonicalFieldDef } from "./types";

/**
 * Master Canonical Field Registry seed (274).
 * Does not invent a second profile store — these IDs map to Business Estate / DNA / avatars.
 */
export const MASTER_CANONICAL_FIELDS: readonly CanonicalFieldDef[] = [
  // Business
  {
    fieldId: "business.business_id",
    entity: "business",
    name: "Business ID",
    required: true,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.name",
    entity: "business",
    name: "Business name",
    required: true,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.type",
    entity: "business",
    name: "Business type",
    required: true,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.description",
    entity: "business",
    name: "Description",
    required: true,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.business_model",
    entity: "business",
    name: "Business model",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.stage",
    entity: "business",
    name: "Stage",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.location",
    entity: "business",
    name: "Location",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.service_area",
    entity: "business",
    name: "Service area",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.channels",
    entity: "business",
    name: "Channels",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.mission",
    entity: "business",
    name: "Mission",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.vision",
    entity: "business",
    name: "Vision",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.values",
    entity: "business",
    name: "Values",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.goals",
    entity: "business",
    name: "Goals",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  {
    fieldId: "business.constraints",
    entity: "business",
    name: "Constraints",
    required: false,
    sourceOfTruth: "Business Profile",
  },
  // Business DNA
  {
    fieldId: "business_dna.positioning",
    entity: "business_dna",
    name: "Positioning",
    required: false,
    sourceOfTruth: "Business DNA",
  },
  {
    fieldId: "business_dna.tone",
    entity: "business_dna",
    name: "Tone",
    required: false,
    sourceOfTruth: "Business DNA",
  },
  {
    fieldId: "business_dna.voice",
    entity: "business_dna",
    name: "Voice",
    required: false,
    sourceOfTruth: "Business DNA",
  },
  // Client avatar
  {
    fieldId: "client_avatar.avatar_id",
    entity: "client_avatar",
    name: "Avatar ID",
    required: true,
    sourceOfTruth: "People I Help / Client Avatar",
  },
  {
    fieldId: "client_avatar.name",
    entity: "client_avatar",
    name: "Avatar name",
    required: true,
    sourceOfTruth: "People I Help / Client Avatar",
  },
  {
    fieldId: "client_avatar.description",
    entity: "client_avatar",
    name: "Avatar description",
    required: false,
    sourceOfTruth: "People I Help / Client Avatar",
  },
  {
    fieldId: "client_avatar.goals",
    entity: "client_avatar",
    name: "Avatar goals",
    required: false,
    sourceOfTruth: "People I Help / Client Avatar",
  },
  {
    fieldId: "client_avatar.frustrations",
    entity: "client_avatar",
    name: "Avatar frustrations",
    required: false,
    sourceOfTruth: "People I Help / Client Avatar",
  },
  // Offer / product / service
  {
    fieldId: "offer.offer_id",
    entity: "offer",
    name: "Offer ID",
    required: true,
    sourceOfTruth: "Offers",
  },
  {
    fieldId: "offer.name",
    entity: "offer",
    name: "Offer name",
    required: true,
    sourceOfTruth: "Offers",
  },
  {
    fieldId: "offer.description",
    entity: "offer",
    name: "Offer description",
    required: false,
    sourceOfTruth: "Offers",
  },
  {
    fieldId: "product_or_service.item_id",
    entity: "product_or_service",
    name: "Product/service ID",
    required: true,
    sourceOfTruth: "Products & Services",
  },
  {
    fieldId: "product_or_service.name",
    entity: "product_or_service",
    name: "Product/service name",
    required: true,
    sourceOfTruth: "Products & Services",
  },
  // Brand
  {
    fieldId: "brand.brand_voice",
    entity: "brand",
    name: "Brand voice",
    required: false,
    sourceOfTruth: "Brand Context",
  },
  {
    fieldId: "brand.tone",
    entity: "brand",
    name: "Brand tone",
    required: false,
    sourceOfTruth: "Brand Context",
  },
  // Session
  {
    fieldId: "blueprint_session.business_id",
    entity: "blueprint_session",
    name: "Session business",
    required: true,
    sourceOfTruth: "Blueprint Context Envelope",
  },
  {
    fieldId: "blueprint_session.selected_avatar_ids",
    entity: "blueprint_session",
    name: "Selected avatars",
    required: false,
    sourceOfTruth: "Blueprint Context Envelope",
  },
  {
    fieldId: "blueprint_session.selected_offer_ids",
    entity: "blueprint_session",
    name: "Selected offers",
    required: false,
    sourceOfTruth: "Blueprint Context Envelope",
  },
  {
    fieldId: "blueprint_session.current_goal",
    entity: "blueprint_session",
    name: "Current goal",
    required: false,
    sourceOfTruth: "Blueprint Context Envelope",
  },
] as const;

export function getCanonicalField(
  fieldId: string,
): CanonicalFieldDef | undefined {
  return MASTER_CANONICAL_FIELDS.find((f) => f.fieldId === fieldId);
}

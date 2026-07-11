/**
 * Universal Growth Capture — capture once, file to one primary home.
 */

import type { EcosystemObjectKind } from "@/lib/intelligence/intelligenceReadyTypes";
import type { GrowthAttachment } from "@/lib/growthAttachments";

/** Primary databases — each item has exactly one home. */
export type GrowthPrimaryDestination =
  | "portfolio"
  | "evidence-bank"
  | "journal"
  | "uncategorized";

export type GrowthCaptureItem = {
  id: string;
  body: string;
  attachments: GrowthAttachment[];
  suggestedDestination: GrowthPrimaryDestination;
  filedDestination?: GrowthPrimaryDestination;
  /** Id in the primary database after filing */
  filedRecordId?: string;
  createdAt: string;
  updatedAt: string;
  originatedFromId?: string;
  originatedFromKind?: EcosystemObjectKind;
};

export type GrowthDestinationSuggestion = {
  destination: GrowthPrimaryDestination;
  confidence: "high" | "medium" | "low";
  reason: string;
};

export const GROWTH_PRIMARY_DESTINATIONS: {
  id: GrowthPrimaryDestination;
  label: string;
  subtitle: string;
}[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    subtitle: "What I've created",
  },
  {
    id: "evidence-bank",
    label: "Evidence Vault",
    subtitle: "Proof that it worked",
  },
  {
    id: "journal",
    label: "Journal",
    subtitle: "Private reflection",
  },
];

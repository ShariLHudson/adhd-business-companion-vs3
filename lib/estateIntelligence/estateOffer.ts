/**
 * Estate Intelligence™ — workspace offers for room routing (Welcome Home concierge).
 */

import type { WorkspaceOffer } from "@/lib/workspaceMode";
import type { EstateIntelligenceEvaluation } from "./types";
import { estateRegistryEntryById } from "./estateRegistry";
import { resolveInstituteDrawerForText } from "@/lib/momentumInstitute/drawerWall/estateDrawerBridge";

const ESTATE_OFFER_LABELS: Partial<Record<string, string>> = {
  "peaceful-places": "Step into Peaceful Places™",
  "momentum-builder": "Step into Momentum Builder™",
  "clear-my-mind": "Step into Clear My Mind™",
  "decision-compass": "Step into Decision Compass™",
  "observatory": "Explore the Observatory™",
  "library": "Visit the Library™",
  "momentum-institute": "Explore the Momentum Institute™",
  "creative-studio": "Step into Creative Studio™",
  "soundscapes-focus-audio": "Listen in Peaceful Places™",
  "growth-journal": "Step into your Journal™",
};

/** Secondary estate destination when both apply (e.g. overwhelm + scattered thoughts). */
export function secondaryEstateEntryId(
  evaluation: EstateIntelligenceEvaluation | null | undefined,
): string | null {
  if (!evaluation?.bestMatch) return null;
  const text = evaluation.userText.toLowerCase();
  const primary = evaluation.bestMatch.entry.id;
  if (
    primary === "momentum-builder" &&
    /\b(?:thoughts|head|scatter|jumble|clear)\b/.test(text)
  ) {
    return "clear-my-mind";
  }
  if (
    primary === "clear-my-mind" &&
    /\b(?:overwhelm|stuck|start|today|momentum)\b/.test(text)
  ) {
    return "momentum-builder";
  }
  return evaluation.bestMatch.entry.relatedEntryIds?.[0] ?? null;
}

export function workspaceOfferFromEstateEvaluation(
  evaluation: EstateIntelligenceEvaluation | null | undefined,
): WorkspaceOffer | null {
  if (!evaluation?.route || !evaluation.bestMatch) return null;
  if (evaluation.suppressed) return null;
  if (evaluation.bestMatch.confidence !== "high") return null;

  const section = evaluation.route.primarySection;
  if (!section) return null;

  const entry = evaluation.route.primaryEntry;
  const buttonLabel =
    ESTATE_OFFER_LABELS[entry.id] ?? `Step into ${entry.name}`;

  const secondaryId = secondaryEstateEntryId(evaluation);
  const secondaryEntry = secondaryId
    ? estateRegistryEntryById(secondaryId)
    : undefined;
  const secondarySection = secondaryEntry?.primarySection;

  const drawerHint =
    entry.id === "momentum-institute"
      ? resolveInstituteDrawerForText(evaluation.userText)
      : null;

  return {
    section,
    buttonLabel,
    line: drawerHint?.invitationLine ?? evaluation.route.invitation,
    instituteDrawerId: drawerHint?.drawerId,
    secondary:
      secondarySection && secondaryEntry
        ? {
            section: secondarySection,
            buttonLabel:
              ESTATE_OFFER_LABELS[secondaryEntry.id] ??
              `Step into ${secondaryEntry.name}`,
          }
        : undefined,
  };
}

export function shouldSuppressGenericFeatureHints(
  evaluation: EstateIntelligenceEvaluation | null | undefined,
): boolean {
  return estateHighConfidenceRoutingActive(evaluation);
}

/** Estate routing wins over stress relief / parallel decision-compass offers. */
export function estateHighConfidenceRoutingActive(
  evaluation: EstateIntelligenceEvaluation | null | undefined,
): boolean {
  return Boolean(workspaceOfferFromEstateEvaluation(evaluation));
}

/**
 * Create Foundation routing authority.
 *
 * Once a request is classified as a supported Create Foundation document type
 * (including Checklist), Universal Creation discovery must not own, intercept,
 * recreate, or resume that request.
 */

import {
  UNIVERSAL_DOCUMENT_PLUGINS,
} from "@/lib/universalCreation/documentRegistry";
import type { UniversalDocumentType } from "@/lib/universalCreation/types";
import {
  classificationTypeFromWorkingIntent,
  deriveCreationIdentity,
  isDocumentClassificationType,
} from "./deriveCreationIdentity";

/**
 * UC plugins that still require pre-workspace discovery interviews.
 * Create Foundation document types (Checklist, …) never use these paths.
 */
const PRE_WORKSPACE_DISCOVERY_UC_TYPES = new Set<string>([
  "email",
  "sales_funnel",
  "website",
  "presentation",
  "business_plan",
  "social_post",
]);

/** Classification labels that open Create Foundation (no UC discovery). */
const CREATE_FOUNDATION_DIRECT_LABELS = new Set([
  "checklist",
  "newsletter",
  "sop",
  "proposal",
  "document",
  "guide",
  "playbook",
  "workbook",
  "agenda",
  "template",
  "course",
  "training manual",
  "lead magnet",
  "landing page",
  "offer",
  "course outline",
]);

export type CreateFoundationClassification = {
  originalRequest: string;
  workingIntent: string;
  classificationType: string;
  universalDocumentType: UniversalDocumentType | null;
  /** True → open Create Foundation; UC discovery must not run. */
  routeDirectlyToCreateFoundation: boolean;
};

/** Lightweight detect — avoids importing orchestrator (circular risk). */
function detectDocumentTypeForFoundationRouting(
  userText: string,
): UniversalDocumentType | null {
  const t = userText.trim();
  if (!t) return null;
  if (
    /\b(?:workshop|webinar|conference|retreat|summit|meetup|networking\s+event|launch\s+event|event\s+plan)\b/i.test(
      t,
    )
  ) {
    return null;
  }
  for (const plugin of UNIVERSAL_DOCUMENT_PLUGINS) {
    if (plugin.detectPatterns.some((re) => re.test(t))) {
      return plugin.id;
    }
  }
  return null;
}

/**
 * Sole authority gate used by continuity, CREATE_FAST_PATH, and frictionless.
 */
export function shouldRouteDirectlyToCreateFoundation(input: {
  classificationType?: string | null;
  universalDocumentType?: string | null;
  workingIntent?: string | null;
}): boolean {
  const label = (input.classificationType || "").trim().toLowerCase();
  const ucType = (input.universalDocumentType || "").trim().toLowerCase();
  const intent = (input.workingIntent || "").trim().toLowerCase();

  if (ucType && PRE_WORKSPACE_DISCOVERY_UC_TYPES.has(ucType)) {
    return false;
  }

  if (
    label === "checklist" ||
    ucType === "checklist" ||
    /\bchecklist\b/.test(intent)
  ) {
    return true;
  }

  if (label && CREATE_FOUNDATION_DIRECT_LABELS.has(label)) {
    return isDocumentClassificationType(label);
  }

  if (ucType === "sop" || ucType === "newsletter" || ucType === "proposal") {
    return true;
  }

  if (
    ucType &&
    CREATE_FOUNDATION_DIRECT_LABELS.has(ucType.replace(/_/g, " "))
  ) {
    return true;
  }

  return false;
}

/**
 * Resolve classification before continuity / CREATE_FAST_PATH / frictionless.
 */
export function resolveCreateFoundationClassification(
  userText: string,
): CreateFoundationClassification {
  const originalRequest = userText.trim();
  const identity = deriveCreationIdentity({ originalRequest });
  const classificationType = classificationTypeFromWorkingIntent(
    identity.workingIntent,
  );
  const universalDocumentType =
    detectDocumentTypeForFoundationRouting(originalRequest);
  const routeDirectlyToCreateFoundation = shouldRouteDirectlyToCreateFoundation({
    classificationType,
    universalDocumentType,
    workingIntent: identity.workingIntent,
  });

  return {
    originalRequest,
    workingIntent: identity.workingIntent,
    classificationType,
    universalDocumentType,
    routeDirectlyToCreateFoundation,
  };
}

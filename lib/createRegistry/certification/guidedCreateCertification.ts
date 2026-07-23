/**
 * Guided Create certification evidence model.
 *
 * Canonical visibility still requires founder/authenticated browser proof for
 * verification flags. This module records what integration/jsdom coverage
 * proved vs what remains NOT_RUN for Ready.
 */

import type { CreationLifecycleStatus } from "../types";
import type { GuidedCreationRegistryId } from "../items.seed";

/** How strongly a check was proven. */
export type GuidedCertEvidenceLevel =
  | "not_run"
  | "library_unit"
  | "jsdom_integration"
  | "founder_browser";

export type GuidedCertCheckStatus = "pass" | "fail" | "partial" | "not_run";

export type GuidedCertDimension =
  | "route"
  | "identity"
  | "save"
  | "reopen"
  | "requiredActions"
  | "projectHandoff"
  | "print"
  | "export";

export type GuidedCertDimensionResult = {
  status: GuidedCertCheckStatus;
  evidenceLevel: GuidedCertEvidenceLevel;
  notes: string;
  blocksReady: boolean;
};

export type GuidedTypeCertificationSnapshot = {
  registryId: GuidedCreationRegistryId;
  memberLabel: string;
  dimensions: Record<GuidedCertDimension, GuidedCertDimensionResult>;
  /** Recommended lifecycle after this cert pass — never auto-applied to Ready. */
  recommendedLifecycle: CreationLifecycleStatus;
  /** Recommended flag updates — only true when genuinely certified. */
  recommendedFlags: {
    routeVerified: boolean;
    saveVerified: boolean;
    reopenVerified: boolean;
    requiredActionsVerified: boolean;
    printVerified: boolean;
    exportVerified: boolean;
    projectHandoffVerified: boolean;
  };
  /** Always false until ready + all required flags. */
  canonicalVisible: boolean;
  workshopRoutingNote?: string;
};

/**
 * Post-integration baseline (2026-07-23 guided cert PR).
 * Authenticated Estate browser journeys remain NOT_RUN → verification flags stay false.
 */
export const GUIDED_CREATE_CERTIFICATION_SNAPSHOTS: readonly GuidedTypeCertificationSnapshot[] =
  [
    {
      registryId: "event_plan",
      memberLabel: "Event Plan",
      dimensions: {
        route: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Begin + Anywhere-Origin + UWE event_plan package green; authenticated Estate UI journey NOT_RUN.",
          blocksReady: true,
        },
        identity: {
          status: "pass",
          evidenceLevel: "jsdom_integration",
          notes:
            "forceNew / continue_existing duplicate protection covered by Anywhere-Origin + durable identity tests.",
          blocksReady: false,
        },
        save: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Memory durable backend proves begin/draft/hydrate; live Supabase + refresh browser NOT_RUN.",
          blocksReady: true,
        },
        reopen: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Active Workspace Registry + hydrate restore same workspace id; authenticated Continue Working UI NOT_RUN.",
          blocksReady: true,
        },
        requiredActions: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Command catalog exposes rename/archive/trash/restore/duplicate/print/export; guided-surface browser actions NOT_RUN.",
          blocksReady: true,
        },
        projectHandoff: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Canonical work link + connect-once Project Home proven; explicit member Project conversion UI NOT_RUN.",
          blocksReady: false,
        },
        print: {
          status: "not_run",
          evidenceLevel: "not_run",
          notes: "Print command exists; no browser proof on guided Event Plan.",
          blocksReady: false,
        },
        export: {
          status: "not_run",
          evidenceLevel: "not_run",
          notes: "Export command exists; no browser proof on guided Event Plan.",
          blocksReady: false,
        },
      },
      recommendedLifecycle: "testing",
      recommendedFlags: {
        routeVerified: false,
        saveVerified: false,
        reopenVerified: false,
        requiredActionsVerified: false,
        printVerified: false,
        exportVerified: false,
        projectHandoffVerified: false,
      },
      canonicalVisible: false,
      workshopRoutingNote:
        "Workshop is a Browse subtype of Event (catalogLabel Workshop) and opens UWE event_plan / workshop blueprint — not a separate registry seed.",
    },
    {
      registryId: "marketing_plan",
      memberLabel: "Marketing Plan",
      dimensions: {
        route: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Begin domain + launchFromCreate marketing_plan proven; Estate authenticated journey NOT_RUN.",
          blocksReady: true,
        },
        identity: {
          status: "pass",
          evidenceLevel: "jsdom_integration",
          notes: "UWE package registration + Anywhere-Origin identity path covered.",
          blocksReady: false,
        },
        save: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Shared durable pipeline proven; browser refresh NOT_RUN.",
          blocksReady: true,
        },
        reopen: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Registry hydrate path proven; Continue Working UI NOT_RUN.",
          blocksReady: true,
        },
        requiredActions: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Commands available; surface actions NOT_RUN.",
          blocksReady: true,
        },
        projectHandoff: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Canonical sync supports Marketing Plan; explicit UI conversion NOT_RUN.",
          blocksReady: false,
        },
        print: {
          status: "not_run",
          evidenceLevel: "not_run",
          notes: "Not browser-certified.",
          blocksReady: false,
        },
        export: {
          status: "not_run",
          evidenceLevel: "not_run",
          notes: "Not browser-certified.",
          blocksReady: false,
        },
      },
      recommendedLifecycle: "testing",
      recommendedFlags: {
        routeVerified: false,
        saveVerified: false,
        reopenVerified: false,
        requiredActionsVerified: false,
        printVerified: false,
        exportVerified: false,
        projectHandoffVerified: false,
      },
      canonicalVisible: false,
    },
    {
      registryId: "business_plan",
      memberLabel: "Business Plan",
      dimensions: {
        route: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Business Plan Begin now sets isBusinessPlanDomain and launches Anywhere-Origin; founder browser NOT_RUN. Industry detector still skips bare 'business plan' wording without catalog label.",
          blocksReady: true,
        },
        identity: {
          status: "pass",
          evidenceLevel: "jsdom_integration",
          notes: "business_plan package registration proven.",
          blocksReady: false,
        },
        save: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Shared durable pipeline; browser NOT_RUN.",
          blocksReady: true,
        },
        reopen: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Shared reopen pipeline; browser NOT_RUN.",
          blocksReady: true,
        },
        requiredActions: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Commands available; surface actions NOT_RUN.",
          blocksReady: true,
        },
        projectHandoff: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Canonical sync + connect-once; UI conversion NOT_RUN.",
          blocksReady: false,
        },
        print: {
          status: "not_run",
          evidenceLevel: "not_run",
          notes: "Not browser-certified.",
          blocksReady: false,
        },
        export: {
          status: "not_run",
          evidenceLevel: "not_run",
          notes: "Not browser-certified.",
          blocksReady: false,
        },
      },
      recommendedLifecycle: "testing",
      recommendedFlags: {
        routeVerified: false,
        saveVerified: false,
        reopenVerified: false,
        requiredActionsVerified: false,
        printVerified: false,
        exportVerified: false,
        projectHandoffVerified: false,
      },
      canonicalVisible: false,
    },
    {
      registryId: "facebook_community",
      memberLabel: "Facebook Community",
      dimensions: {
        route: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Begin domain + live registration tests; authenticated Estate journey NOT_RUN.",
          blocksReady: true,
        },
        identity: {
          status: "pass",
          evidenceLevel: "jsdom_integration",
          notes: "No shadow workspace / package registration proven.",
          blocksReady: false,
        },
        save: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Shared durable pipeline; browser NOT_RUN.",
          blocksReady: true,
        },
        reopen: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Shared reopen pipeline; browser NOT_RUN.",
          blocksReady: true,
        },
        requiredActions: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes: "Commands available; surface actions NOT_RUN.",
          blocksReady: true,
        },
        projectHandoff: {
          status: "partial",
          evidenceLevel: "jsdom_integration",
          notes:
            "Blueprint recommends explicit Project bridge (never auto-convert); UI conversion NOT_RUN.",
          blocksReady: false,
        },
        print: {
          status: "not_run",
          evidenceLevel: "not_run",
          notes: "Not browser-certified.",
          blocksReady: false,
        },
        export: {
          status: "not_run",
          evidenceLevel: "not_run",
          notes: "Not browser-certified.",
          blocksReady: false,
        },
      },
      recommendedLifecycle: "testing",
      recommendedFlags: {
        routeVerified: false,
        saveVerified: false,
        reopenVerified: false,
        requiredActionsVerified: false,
        printVerified: false,
        exportVerified: false,
        projectHandoffVerified: false,
      },
      canonicalVisible: false,
    },
  ] as const;

export function getGuidedCertificationSnapshot(
  id: GuidedCreationRegistryId,
): GuidedTypeCertificationSnapshot | undefined {
  return GUIDED_CREATE_CERTIFICATION_SNAPSHOTS.find((s) => s.registryId === id);
}

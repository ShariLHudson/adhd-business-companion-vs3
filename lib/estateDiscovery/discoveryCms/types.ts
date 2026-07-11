/**
 * Discovery Content Management System — types.
 */

import type {
  DiscoveryCategorySlug,
  DiscoveryDestinationType,
  DiscoveryEditorialMeta,
  DiscoveryFutureMeta,
  DiscoveryLibraryItem,
  DiscoveryPriority,
  DiscoveryRegistryStatus,
  DiscoveryTargetRegistry,
  DiscoveryTriggerRule,
} from "../types";

/** Editorial statuses excluding legacy Future */
export type DiscoveryContentStatus = Exclude<DiscoveryRegistryStatus, "Future">;

export type DiscoveryCmsRecord = DiscoveryLibraryItem & {
  createdAt: string;
  author: string;
  editorial?: DiscoveryEditorialMeta;
  future?: DiscoveryFutureMeta;
};

export type DiscoveryValidationIssue = {
  code: string;
  field?: string;
  message: string;
  severity: "error" | "warning";
};

export type DiscoveryContentValidationResult = {
  discoveryId: string;
  valid: boolean;
  issues: DiscoveryValidationIssue[];
};

export type DiscoveryVoiceLintResult = {
  discoveryId: string;
  passed: boolean;
  violations: Array<{
    field: string;
    pattern: string;
    excerpt: string;
  }>;
};

export type DiscoveryCmsLibraryFile = {
  registry: string;
  version: string;
  cms?: {
    editorialWorkflow: DiscoveryContentStatus[];
    voiceStandardsDoc: string;
  };
  items: DiscoveryCmsRecord[];
};

export type DiscoveryContentRepository = {
  list(): DiscoveryCmsRecord[];
  getById(id: string): DiscoveryCmsRecord | null;
  listByStatus(status: DiscoveryContentStatus): DiscoveryCmsRecord[];
};

export type NewDiscoveryDraft = {
  id: string;
  title: string;
  category: DiscoveryCategorySlug;
  discoveryText: string;
  priority?: DiscoveryPriority;
  author?: string;
  targetRegistry: DiscoveryTargetRegistry;
  targetId: string;
  relatedRoom?: string | null;
  relatedFeature?: string | null;
  destinationRoute?: string | null;
  destinationType?: DiscoveryDestinationType | null;
  triggerRules?: DiscoveryTriggerRule[];
};

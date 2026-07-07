/**
 * Discovery CMS — content repository (JSON V1, Supabase-ready).
 */

import discoveryLibraryJson from "@/docs/estate-intelligence/discovery-library.json";
import type {
  DiscoveryCmsLibraryFile,
  DiscoveryCmsRecord,
  DiscoveryContentRepository,
  DiscoveryContentStatus,
  NewDiscoveryDraft,
} from "./types";
import { isDiscoveryEligibleForMembers } from "./validation";
import { editorialStatus } from "./workflow";

const LIBRARY = discoveryLibraryJson as DiscoveryCmsLibraryFile;

function normalizeRecord(record: DiscoveryCmsRecord): DiscoveryCmsRecord {
  return {
    ...record,
    companionResponse: record.companionResponse ?? null,
    collectionId: record.collectionId ?? null,
    author: record.author ?? record.createdBy ?? "Unknown",
    createdAt: record.createdAt ?? record.lastUpdated,
    createdBy: record.createdBy ?? record.author,
  };
}

export class JsonDiscoveryContentRepository implements DiscoveryContentRepository {
  private items: DiscoveryCmsRecord[];

  constructor(items: DiscoveryCmsRecord[] = LIBRARY.items) {
    this.items = items.map(normalizeRecord);
  }

  list(): DiscoveryCmsRecord[] {
    return [...this.items];
  }

  getById(id: string): DiscoveryCmsRecord | null {
    return this.items.find((item) => item.id === id) ?? null;
  }

  listByStatus(status: DiscoveryContentStatus): DiscoveryCmsRecord[] {
    return this.items.filter(
      (item) => editorialStatus(item.status) === status,
    );
  }
}

let defaultRepository: DiscoveryContentRepository | null = null;

export function getDiscoveryContentRepository(): DiscoveryContentRepository {
  if (!defaultRepository) {
    defaultRepository = new JsonDiscoveryContentRepository();
  }
  return defaultRepository;
}

export function setDiscoveryContentRepository(
  repository: DiscoveryContentRepository,
): void {
  defaultRepository = repository;
}

export function getAllDiscoveryRecords(): DiscoveryCmsRecord[] {
  return getDiscoveryContentRepository().list();
}

export function getDiscoveryRecordById(id: string): DiscoveryCmsRecord | null {
  return getDiscoveryContentRepository().getById(id);
}

export function getMemberReadyDiscoveryRecords(): DiscoveryCmsRecord[] {
  return getAllDiscoveryRecords().filter(isDiscoveryEligibleForMembers);
}

export function createDiscoveryDraftTemplate(
  draft: NewDiscoveryDraft,
): DiscoveryCmsRecord {
  const now = new Date().toISOString().slice(0, 10);

  return {
    id: draft.id,
    status: "Draft",
    priority: draft.priority ?? "Helpful",
    category: draft.category,
    title: draft.title,
    subtitle: null,
    image: null,
    discoveryText: draft.discoveryText,
    whyItMatters: null,
    foodForThought: null,
    primaryButton: null,
    companionResponse: null,
    collectionId: null,
    destinationRoute: draft.destinationRoute ?? null,
    destinationType: draft.destinationType ?? null,
    saveAllowed: true,
    relatedRoom: draft.relatedRoom ?? null,
    relatedFeature: draft.relatedFeature ?? null,
    relatedTool: null,
    relatedSparkCards: [],
    targetRegistry: draft.targetRegistry,
    targetId: draft.targetId,
    triggerRules: draft.triggerRules ?? [],
    tags: [],
    keywords: [],
    version: 1,
    createdAt: now,
    lastUpdated: now,
    author: draft.author ?? "Shari",
    createdBy: draft.author ?? "Shari",
    editorial: { reviewNotes: null, approvedAt: null },
    future: {
      featured: false,
      scheduling: null,
      seasonal: null,
      translations: null,
      memberSegments: null,
      difficulty: null,
      estimatedReadingMinutes: null,
    },
  };
}

export function getDiscoveryCmsMetadata(): DiscoveryCmsLibraryFile["cms"] {
  return LIBRARY.cms;
}

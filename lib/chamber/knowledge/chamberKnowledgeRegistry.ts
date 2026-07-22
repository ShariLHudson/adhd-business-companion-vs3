/**
 * Chamber knowledge registry — member id → knowledge pack paths / contracts.
 *
 * Single registry for Chamber retrieval. Extends existing Chamber chat path;
 * does not create a parallel RAG system.
 *
 * Approved / runtime-canonical packs get contracts + path selection.
 * Other members remain specialty-prompt or architecture-pack-only until libraries ship.
 */

import { CHAMBER_MEMBER_IDS, type ChamberMemberId } from "../chamberMemberRegistry";
import {
  CLIENT_RELATIONSHIPS_DOCS,
  CLIENT_RELATIONSHIPS_DOCS_ROOT,
  CLIENT_RELATIONSHIPS_RUNTIME_CONTRACT,
} from "./clientRelationshipsContracts";
import {
  EVENTS_INTELLIGENCE_CANONICAL_FILES,
  EVENTS_INTELLIGENCE_ROOT,
} from "@/lib/eventsIntelligence/knowledgeManifest";
import type { ChamberKnowledgeDocRef, ChamberKnowledgePack } from "./types";

const EVENTS_DOCS: readonly ChamberKnowledgeDocRef[] =
  EVENTS_INTELLIGENCE_CANONICAL_FILES.map((path) => ({
    path,
    role: "events-canonical",
  }));

/**
 * Lightweight Events operating contract for Chamber registry bridge.
 * Full planning runtime remains lib/eventsIntelligence/.
 */
const EVENTS_RUNTIME_CONTRACT = {
  memberId: "events" as const,
  libraryVersion: "events-intelligence-canonical-v1",
  primaryOwns: [
    "Event lifecycle planning (discovery → follow-up)",
    "Event purpose, format, logistics, and experience design",
    "Event Record / foundation questions (guide path)",
  ],
  doesNotOwn: [
    "Talk It Out reflective coaching loops",
    "Generic marketing campaigns unrelated to the event",
    "Full Create Estate catalog for non-event work",
  ],
  retrievalSignals: [
    "event",
    "retreat",
    "workshop",
    "webinar",
    "conference",
    "gathering",
  ],
  negativeSignals: [
    "Pure relationship conflict without an event → Client Relationships",
    "Generic content calendar without event → Content / Marketing",
  ],
  safetyRules: [
    "Clear event goal → begin planning; never reflective trap loops.",
    "One concrete foundation question at a time.",
    "Never invent venues, prices, or vendor facts without confirmation.",
  ],
  productionCompletionRules: [
    "Canonical knowledge: docs/visual-spark-studios/Events-Intelligence/",
    "Runtime owner: lib/eventsIntelligence (bridge via this registry).",
    "Architecture packs 431–442: foundation partial; advanced ops not fully certified.",
  ],
  collaborationBridges: [
    "Events + Marketing — promotion for a planned event",
    "Events + Project Management — execution tracking after plan confirms",
  ],
  defaultRetrievalRoles: ["events-canonical"],
};

type PackSeed = Omit<ChamberKnowledgePack, "memberId" | "displayName"> & {
  displayName: string;
};

const APPROVED_AND_BRIDGED: Partial<Record<ChamberMemberId, PackSeed>> = {
  "client-relationships": {
    displayName: "Client Relationships Intelligence",
    libraryStatus: "founder-approved",
    wiringStatus: "fully",
    docsRoot: CLIENT_RELATIONSHIPS_DOCS_ROOT,
    architecturePackNote: "419–430 Client Relationship completion packs",
    docs: CLIENT_RELATIONSHIPS_DOCS,
    contract: CLIENT_RELATIONSHIPS_RUNTIME_CONTRACT,
    runtimeBridge: null,
  },
  events: {
    displayName: "Events Intelligence",
    libraryStatus: "runtime-canonical",
    wiringStatus: "partially",
    docsRoot: EVENTS_INTELLIGENCE_ROOT,
    architecturePackNote: "431–442 Events completion packs",
    docs: EVENTS_DOCS,
    contract: EVENTS_RUNTIME_CONTRACT,
    runtimeBridge: "eventsIntelligence",
  },
};

/** Architecture-v2 pack notes for members without chamber-knowledge libraries yet. */
const ARCH_PACK_NOTES: Partial<Record<ChamberMemberId, string>> = {
  "ai-technology": "408–418 AI / Intelligence",
  content: "443–454 Content",
  "creative-studio": "455–466 Creative Studio",
  "data-analytics": "467–478 Data & Analytics",
  finance: "479–490 Finance",
  horizons: "491–502 Horizons",
  "people-culture": "503–514 Human Resources",
  innovations: "515–526 Innovations",
  "knowledge-management": "527–538 Knowledge",
  leadership: "539–550 Leadership",
  learning: "551–562 Learning",
  marketing: "563–574 Marketing",
  momentum: "575–586 Momentum",
};

function specialtyOnlyPack(
  memberId: ChamberMemberId,
  displayName: string,
): ChamberKnowledgePack {
  return {
    memberId,
    displayName,
    libraryStatus: ARCH_PACK_NOTES[memberId]
      ? "architecture-pack-only"
      : "not-built",
    wiringStatus: ARCH_PACK_NOTES[memberId]
      ? "docs-only"
      : "specialty-prompt-only",
    docsRoot: null,
    architecturePackNote: ARCH_PACK_NOTES[memberId] ?? null,
    docs: [],
    contract: null,
    runtimeBridge: null,
  };
}

const DISPLAY_NAMES: Record<ChamberMemberId, string> = {
  "ai-technology": "AI & Technology Intelligence",
  "client-relationships": "Client Relationships Intelligence",
  content: "Content Intelligence",
  "creative-studio": "Creative Studio Intelligence",
  "data-analytics": "Data & Analytics Intelligence",
  events: "Events Intelligence",
  finance: "Finance Intelligence",
  horizons: "Horizons Intelligence",
  innovations: "Innovations Intelligence",
  "knowledge-management": "Knowledge Management Intelligence",
  leadership: "Leadership Intelligence",
  learning: "Learning Intelligence",
  marketing: "Marketing Intelligence",
  momentum: "Momentum Intelligence",
  networking: "Networking Intelligence",
  partnerships: "Partnerships Intelligence",
  "people-culture": "People & Culture Intelligence",
  presentations: "Presentations Intelligence",
  "project-management": "Project Management Intelligence",
  research: "Research Intelligence",
  sales: "Sales Intelligence",
  strategy: "Strategy Intelligence",
  systems: "Systems Intelligence",
  wellness: "Wellness Intelligence",
};

function buildPack(memberId: ChamberMemberId): ChamberKnowledgePack {
  const seeded = APPROVED_AND_BRIDGED[memberId];
  if (seeded) {
    return { memberId, ...seeded };
  }
  return specialtyOnlyPack(memberId, DISPLAY_NAMES[memberId]);
}

const PACKS: readonly ChamberKnowledgePack[] = CHAMBER_MEMBER_IDS.map(buildPack);

const PACK_BY_ID = new Map<ChamberMemberId, ChamberKnowledgePack>(
  PACKS.map((p) => [p.memberId, p]),
);

export function listChamberKnowledgePacks(): readonly ChamberKnowledgePack[] {
  return PACKS;
}

export function getChamberKnowledgePack(
  memberId: string,
): ChamberKnowledgePack | undefined {
  return PACK_BY_ID.get(memberId as ChamberMemberId);
}

export function isChamberKnowledgeWired(memberId: string): boolean {
  const pack = getChamberKnowledgePack(memberId);
  return pack?.wiringStatus === "fully" || pack?.wiringStatus === "partially";
}

/** Members with founder-approved or runtime-canonical libraries. */
export function listWiredChamberKnowledgeMemberIds(): ChamberMemberId[] {
  return PACKS.filter(
    (p) => p.wiringStatus === "fully" || p.wiringStatus === "partially",
  ).map((p) => p.memberId);
}

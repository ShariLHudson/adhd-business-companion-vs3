/**
 * Sprint 3 — Authenticated browser journeys J-001 … J-008 + Trust Journey.
 * Library status ≠ CERTIFIED. Only browser evidence can promote.
 */

import type { CertificationStatus, TestResultStatus } from "./types";
import { blankEmotionalQualityAudit, type EmotionalQualityRow } from "./emotionalQuality";

export type CertificationJourneyId =
  | "J-001"
  | "J-002"
  | "J-003"
  | "J-004"
  | "J-005"
  | "J-006"
  | "J-007"
  | "J-008"
  | "TRUST";

export type CertificationJourneyRow = {
  id: CertificationJourneyId;
  name: string;
  path: string;
  library: TestResultStatus;
  browser: TestResultStatus;
  emotional: TestResultStatus;
  certification: CertificationStatus;
  notes: string;
  evidencePath: string | null;
};

export const CERTIFICATION_JOURNEYS: readonly CertificationJourneyRow[] = [
  {
    id: "J-001",
    name: "Shari → Workshop → Agenda → Leave → Return",
    path: "Shari → Discovery → Foundation → Workspace → Agenda → Leave → Return tomorrow → Same Event / Focus / Recommendation → Continuous conversation",
    library: "PASS",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "TESTING",
    notes:
      "j001WorkshopJourney.test.ts PASS. Authenticated browser pack not executed this sprint.",
    evidencePath: "lib/createCertification/j001WorkshopJourney.test.ts",
  },
  {
    id: "J-002",
    name: "Create NL → Same Event Workspace",
    path: "Create → Natural language → Same Event Workspace → No duplicates",
    library: "PASS",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "TESTING",
    notes: "enterCreationFromCreate + oneCreationPlatform gates; browser pending.",
    evidencePath: "lib/universalCreationPlatform/oneCreationPlatform.test.ts",
  },
  {
    id: "J-003",
    name: "Projects Continue → Same Event",
    path: "Projects → Continue → Same Event → Same Recommendation → Same Lifecycle",
    library: "PARTIAL",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "TESTING",
    notes: "Active work list wired; full lifecycle identity needs browser proof.",
    evidencePath: "lib/createEstate/listActiveCreationWorkspaces.ts",
  },
  {
    id: "J-004",
    name: "Marketing → Landing → Existing Event",
    path: "Marketing → Landing Page → Existing Event → Same Workspace",
    library: "PARTIAL",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "TESTING",
    notes: "Weakest live path — Marketing → existing event still needs browser proof.",
    evidencePath: null,
  },
  {
    id: "J-005",
    name: "Search → Workshop → Same Workspace",
    path: "Search → Workshop → Same Workspace → Never creates duplicates",
    library: "PASS",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "TESTING",
    notes: "enterCreationFromSearch wired in CPC; browser pending.",
    evidencePath: "lib/universalCreationEntrypoint/",
  },
  {
    id: "J-006",
    name: "Refresh / Restart / Restore",
    path: "Refresh → Browser restart → Tab close → Workspace + Focus + Conversation restored",
    library: "PARTIAL",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "TESTING",
    notes:
      "Continuity now uses localStorage + welcome-back bridge. Full chat history restore still limited to bridge + Event Record.",
    evidencePath: "lib/creationContinuity/",
  },
  {
    id: "J-007",
    name: "150% zoom / keyboard / scroll",
    path: "150% · Keyboard · Touchpad · Scroll · A11y · Current Focus reachable",
    library: "PARTIAL",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "TESTING",
    notes: "CREATE_SCROLL_AND_REACHABILITY_RULE + CSS; browser zoom not run.",
    evidencePath: "lib/createEstate/",
  },
  {
    id: "J-008",
    name: "Type change same record",
    path: "Workshop → Webinar → Conference → Same Event Record · Recs update · Lifecycle · Relationships",
    library: "PASS",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "TESTING",
    notes: "applyEventTypeChangeRequest library PASS; browser pending.",
    evidencePath: "lib/eventsIntelligence/changeEventType.ts",
  },
  {
    id: "TRUST",
    name: "Permanent Trust Journey (release gate)",
    path: "Discover → Plan → Leave → Return → Type change → Agenda → Landing → Marketing → Leave → Return next week → Complete → Archive → Version 2",
    library: "NOT_RUN",
    browser: "NOT_RUN",
    emotional: "NOT_RUN",
    certification: "NOT_STARTED",
    notes:
      "Permanent release scenario — docs/create-experience/TRUST_JOURNEY_CERTIFICATION.md",
    evidencePath: "docs/create-experience/TRUST_JOURNEY_CERTIFICATION.md",
  },
] as const;

export type BrowserEvidencePack = {
  journeyId: CertificationJourneyId;
  ranAt: string | null;
  authenticated: boolean;
  screenshots: string[];
  logNotes: string[];
  emotional: EmotionalQualityRow[];
  verdict: CertificationStatus;
};

export function emptyBrowserEvidencePack(
  journeyId: CertificationJourneyId,
): BrowserEvidencePack {
  return {
    journeyId,
    ranAt: null,
    authenticated: false,
    screenshots: [],
    logNotes: [
      "Sprint 3: No authenticated browser harness executed in-repo (no Playwright/Cypress suite for Estate Create).",
      "Library evidence recorded; browser remains NOT_RUN until founder runs authenticated pack.",
    ],
    emotional: blankEmotionalQualityAudit(),
    verdict: "TESTING",
  };
}

/** Platform is CERTIFIED only when every journey is browser PASS + emotional PASS. */
export function platformCertificationBlockedBy(): string[] {
  const blockers: string[] = [];
  for (const j of CERTIFICATION_JOURNEYS) {
    if (j.browser !== "PASS") {
      blockers.push(`${j.id}: browser=${j.browser}`);
    }
    if (j.emotional !== "PASS" && j.id !== "TRUST") {
      blockers.push(`${j.id}: emotional=${j.emotional}`);
    }
  }
  return blockers;
}

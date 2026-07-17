/**
 * Legacy workspace → Estate Experience mapping.
 * Every legacy surface must appear exactly once here with a disposition.
 *
 * @see docs/estate/ESTATE_REGISTRY.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateExperienceId } from "./types";

export type LegacyDisposition = "keep" | "move" | "remove";

export type LegacyWorkspaceEntry = {
  /** Legacy identifier (section id, trademark, or UI label) */
  legacyId: string;
  legacyLabel: string;
  disposition: LegacyDisposition;
  experienceId: EstateExperienceId;
  spaceId: string;
  /** Primary tool (`AppSection` or catalog tool name) */
  toolId: AppSection | string;
  memberFacingReplacement: string;
  notes: string;
};

/**
 * Machine-readable audit — source of truth for migration.
 * Status: `move` = route exists but legacy shell/label remains.
 */
export const LEGACY_WORKSPACE_MAP: readonly LegacyWorkspaceEntry[] = [
  {
    legacyId: "creative-studio",
    legacyLabel: "Creative Studio",
    disposition: "move",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "content-generator",
    memberFacingReplacement: "Create",
    notes: "Trademark retired. Space id unchanged; experience routing live.",
  },
  {
    legacyId: "content-generator",
    legacyLabel: "Documents / Create workspace",
    disposition: "move",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "content-generator",
    memberFacingReplacement: "Create",
    notes: "Internal section id kept. User-facing title must be Create, not Documents.",
  },
  {
    legacyId: "email-generator",
    legacyLabel: "Email Workspace",
    disposition: "remove",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "Email",
    memberFacingReplacement: "Create → Email",
    notes: "Duplicate of Create email tool. Remove standalone section.",
  },
  {
    legacyId: "marketing-workspace",
    legacyLabel: "Marketing Workspace",
    disposition: "remove",
    experienceId: "business",
    spaceId: "round-table",
    toolId: "Marketing Plan",
    memberFacingReplacement: "Business or Momentum",
    notes: "No standalone marketing workspace — plan in Momentum, ops in Business.",
  },
  {
    legacyId: "sop-workspace",
    legacyLabel: "SOP Workspace",
    disposition: "remove",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "SOP",
    memberFacingReplacement: "Create → SOP",
    notes: "Folded into Create catalog.",
  },
  {
    legacyId: "proposal-workspace",
    legacyLabel: "Proposal Workspace",
    disposition: "remove",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "Proposal",
    memberFacingReplacement: "Create → Proposal",
    notes: "Folded into Create catalog.",
  },
  {
    legacyId: "templates-library",
    legacyLabel: "Templates Library",
    disposition: "move",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "templates-library",
    memberFacingReplacement: "Create → Templates",
    notes: "Tool inside Create, not a top-level workspace.",
  },
  {
    legacyId: "saved-work",
    legacyLabel: "Created Content / Saved Work",
    disposition: "move",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "saved-work",
    memberFacingReplacement: "Create → Recent work",
    notes: "Or Business content library — pick one canonical home.",
  },
  {
    legacyId: "content-types",
    legacyLabel: "Content Types",
    disposition: "remove",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "create-catalog",
    memberFacingReplacement: "Create arrival suggestions",
    notes: "Replaced by Create catalog categories.",
  },
  {
    legacyId: "momentum-builder",
    legacyLabel: "Momentum Builder",
    disposition: "move",
    experienceId: "momentum",
    spaceId: "momentum-builder",
    toolId: "momentum-builder",
    memberFacingReplacement: "Momentum",
    notes: "Planning builders live under Momentum experience.",
  },
  {
    legacyId: "plan-my-day",
    legacyLabel: "Plan My Day",
    disposition: "move",
    experienceId: "momentum",
    spaceId: "goals-projects",
    toolId: "plan-my-day",
    memberFacingReplacement: "Momentum → Weekly Plan",
    notes: "Keep tool; route via Momentum not standalone launcher.",
  },
  {
    legacyId: "projects",
    legacyLabel: "Projects workspace",
    disposition: "keep",
    experienceId: "momentum",
    spaceId: "goals-projects",
    toolId: "projects",
    memberFacingReplacement: "Momentum → Projects",
    notes: "Creation-only project spawn → Create; active work → here.",
  },
  {
    legacyId: "client-avatars",
    legacyLabel: "Client Avatar Builder",
    disposition: "move",
    experienceId: "business",
    spaceId: "round-table",
    toolId: "client-avatars",
    memberFacingReplacement: "Business → Client Avatar",
    notes: "Business HQ tool, not Create.",
  },
  {
    legacyId: "business-profile",
    legacyLabel: "Business Profile",
    disposition: "move",
    experienceId: "business",
    spaceId: "round-table",
    toolId: "business-profile",
    memberFacingReplacement: "Business",
    notes: "Part of Business headquarters.",
  },
  {
    legacyId: "playbook",
    legacyLabel: "Strategies / Playbook",
    disposition: "move",
    experienceId: "business",
    spaceId: "round-table",
    toolId: "playbook",
    memberFacingReplacement: "Get Advice → Strategy Library",
    notes:
      "Preserved Strategy Library. Canonical Welcome Home placement: Get Advice → Strategy Library (section playbook). Alias hard-nav open strategies → same panel.",
  },
  {
    legacyId: "decision-compass",
    legacyLabel: "Decision Compass",
    disposition: "keep",
    experienceId: "think",
    spaceId: "decision-compass",
    toolId: "decision-compass",
    memberFacingReplacement: "Think → Decision Compass",
    notes: "Core Think tool.",
  },
  {
    legacyId: "visual-focus",
    legacyLabel: "Visual Thinking",
    disposition: "keep",
    experienceId: "create",
    spaceId: "focus-studio",
    toolId: "visual-focus",
    memberFacingReplacement: "Create → Mind Map / Visual maps",
    notes: "Also Think for pure decision trees — disambiguate by intent.",
  },
  {
    legacyId: "brain-dump",
    legacyLabel: "Clear My Mind",
    disposition: "keep",
    experienceId: "restore",
    spaceId: "clear-my-mind",
    toolId: "brain-dump",
    memberFacingReplacement: "Restore → Clear My Mind",
    notes: "Sunroom / peaceful places family.",
  },
  {
    legacyId: "focus-audio",
    legacyLabel: "Peaceful Places / Focus Audio",
    disposition: "keep",
    experienceId: "restore",
    spaceId: "peaceful-places",
    toolId: "focus-audio",
    memberFacingReplacement: "Restore or Focus → Soundscapes",
    notes: "Split by intent: calm → Restore; concentrate → Focus.",
  },
  {
    legacyId: "focus-timer",
    legacyLabel: "Focus Timer",
    disposition: "keep",
    experienceId: "focus",
    spaceId: "focus-studio",
    toolId: "focus-timer",
    memberFacingReplacement: "Focus → Pomodoro",
    notes: "",
  },
  {
    legacyId: "growth-journal",
    legacyLabel: "Journal workspace",
    disposition: "keep",
    experienceId: "journal",
    spaceId: "journal",
    toolId: "growth-journal",
    memberFacingReplacement: "Journal Gazebo",
    notes: "",
  },
  {
    legacyId: "momentum-institute",
    legacyLabel: "Momentum Institute / Study",
    disposition: "move",
    experienceId: "think",
    spaceId: "study-hall",
    toolId: "momentum-institute",
    memberFacingReplacement: "Study Hall → Learn",
    notes: "Member-facing Learn experience; institute drawers are tools.",
  },
  {
    legacyId: "evidence-bank",
    legacyLabel: "Evidence Vault",
    disposition: "keep",
    experienceId: "grow",
    spaceId: "evidence-vault",
    toolId: "evidence-bank",
    memberFacingReplacement: "Grow → Evidence Vault",
    notes: "",
  },
  {
    legacyId: "wins-this-week",
    legacyLabel: "Celebration Garden",
    disposition: "keep",
    experienceId: "grow",
    spaceId: "celebration-garden",
    toolId: "wins-this-week",
    memberFacingReplacement: "Celebrate → Celebration Garden",
    notes: "Play/Celebrate crossover — wins live in Grow.",
  },
  {
    legacyId: "growth-reports",
    legacyLabel: "Celebration Hall",
    disposition: "keep",
    experienceId: "grow",
    spaceId: "celebration-room",
    toolId: "growth-reports",
    memberFacingReplacement: "Celebrate → Celebration Hall",
    notes: "",
  },
  {
    legacyId: "quick-recharge",
    legacyLabel: "Game Room / Quick Recharge",
    disposition: "keep",
    experienceId: "play",
    spaceId: "game-room",
    toolId: "quick-recharge",
    memberFacingReplacement: "Play",
    notes: "",
  },
  {
    legacyId: "welcome-room",
    legacyLabel: "Welcome Home dashboard",
    disposition: "move",
    experienceId: "explore",
    spaceId: "welcome-home",
    toolId: "welcome-room",
    memberFacingReplacement: "Explore → Welcome Home",
    notes: "No dashboard cards — conversational arrival only.",
  },
  {
    legacyId: "google-workspace",
    legacyLabel: "Google Workspace",
    disposition: "move",
    experienceId: "business",
    spaceId: "round-table",
    toolId: "google-workspace",
    memberFacingReplacement: "Business → Sheets/Docs bridge",
    notes: "Integration tool, not a workspace brand.",
  },
  {
    legacyId: "how-do-i",
    legacyLabel: "How Do I",
    disposition: "remove",
    experienceId: "explore",
    spaceId: "homestead",
    toolId: "guidebook",
    memberFacingReplacement: "Estate Guide + conversation",
    notes: "Software help center — replace with Guidebook object.",
  },
  {
    legacyId: "workspace-offer-ui",
    legacyLabel: "Workspace offer cards / Step into…",
    disposition: "remove",
    experienceId: "create",
    spaceId: "creative-studio",
    toolId: "experience-routing",
    memberFacingReplacement: "Navigate → open tool (high confidence)",
    notes: "No permission cards for high-confidence intents.",
  },
];

export const ESTATE_LEGACY_MIGRATION_FREEZE =
  "Stop adding new features until every remaining legacy workspace, menu, route, prompt, and launcher has either been removed or mapped in LEGACY_WORKSPACE_MAP.";

export function legacyEntryForSection(
  section: AppSection,
): LegacyWorkspaceEntry | undefined {
  return LEGACY_WORKSPACE_MAP.find((e) => e.toolId === section);
}

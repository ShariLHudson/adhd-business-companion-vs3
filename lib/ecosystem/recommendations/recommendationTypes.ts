// Founder Ecosystem — Phase 10 Stage-Aware Recommendation types.
//
// Turns journey stage + focus + operating state + advisors + profile into
// concrete, linked, actionable recommendations. Everything is derived; all
// guidance is observational, non-therapeutic, non-legal.

import type { ID, ISODateString } from "../models";
import type { Level } from "../dashboardTypes";
import type { BusinessStage, FounderFocus } from "../journey/journeyTypes";

export type { Level };

// ---- Actionable links / assisted actions -------------------------------
export type ActionTarget =
  | "workspace" // open a Spark Studio workspace (focus, time-block, clear-my-mind…)
  | "project" // open a specific project
  | "template" // open a saved template
  | "snippet" // insert a snippet
  | "create" // open Create to draft something
  | "google-doc" // create/open a Google Doc
  | "google-sheet"
  | "calendar" // schedule via Google Calendar
  | "ghl-workflow" // trigger a GoHighLevel workflow (if connected)
  | "none";

export type ActionLink = {
  target: ActionTarget;
  label: string; // button text, e.g. "Open Focus Session"
  ref?: string; // workspace kind / projectId / template id / workflow id
  requiresConnection?: "google" | "ghl"; // gated integrations
};

export type AssistedAction = {
  kind: "email-draft" | "social-post" | "sop" | "proposal" | "outline" | "checklist";
  prompt: string; // what Shari would help draft
  link: ActionLink;
};

// ---- A single recommendation -------------------------------------------
export type RecommendationCategory =
  | "focus-today"
  | "next-action"
  | "marketing"
  | "sales"
  | "operations"
  | "product"
  | "content"
  | "systems"
  | "mindset"; // accountability/motivation, non-therapeutic

export type Recommendation = {
  id: ID;
  title: string;
  rationale: string; // why this, at this stage/focus
  category: RecommendationCategory;
  focus: FounderFocus | null;
  priority: number; // 0–100
  estimatedMinutes: number;
  links: ActionLink[];
  assisted?: AssistedAction;
  avoid?: string; // the stage distraction to skip
  source: "journey" | "operating-state" | "advisor" | "fallback";
};

// ---- Advisor notes ------------------------------------------------------
export type AdvisorNote = {
  advisor: "ceo" | "marketing" | "sales" | "operations" | "productivity";
  note: string;
  kind: "guidance" | "risk" | "opportunity" | "accountability";
};

// ---- Time allocation ----------------------------------------------------
export type TimeAllocationSlice = {
  label: string;
  minutes: number;
  focus: FounderFocus | "rest";
};

// ---- The recommendation set (engine output) ----------------------------
export type FounderRecommendations = {
  founderId: ID;
  generatedAt: ISODateString;
  stage: BusinessStage;
  primaryFocus: FounderFocus | null;
  energy: Level;
  availableMinutes: number;
  headline: string; // "Today, focus on …"
  recommendations: Recommendation[];
  timeAllocation: TimeAllocationSlice[];
  advisorNotes: AdvisorNote[];
  alerts: { kind: "risk" | "opportunity"; label: string }[];
  hasProjects: boolean;
};

// ---- Inputs the host can pass (energy / time / connections) ------------
export type RecommendationContext = {
  now?: Date;
  energy?: Level; // from Adjust My Day / latest check-in
  availableMinutes?: number; // time the founder has today
  googleConnected?: boolean;
  ghlConnected?: boolean;
  profile?: import("../journey/founderJourneyEngine").BusinessProfileInput;
};

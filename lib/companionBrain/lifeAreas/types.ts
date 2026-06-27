/**
 * Life Area Intelligence — shared types for ecosystem-wide reuse.
 */

import type { PlanLifeDomain } from "@/lib/planMyDay/types";

export type LifeAreaKind = "system" | "user" | "smart";

export type LifeArea = {
  id: string;
  name: string;
  kind: LifeAreaKind;
  color?: string;
  icon?: string;
  description?: string;
  /** Maps to brain themes via Plan My Day adapter */
  legacyDomain?: PlanLifeDomain;
  rememberForSuggestions?: boolean;
  createdAt?: string;
};

export type LifeAreaCorrection = {
  /** Normalized phrase fingerprint */
  phrase: string;
  lifeAreaId: string;
  confidence: number;
  timesConfirmed: number;
  lastConfirmedAt: string;
};

export type LifeAreaClassificationResult = {
  primaryLifeAreaId: string;
  primaryLifeAreaName: string;
  secondaryLifeAreaIds: string[];
  confidence: number;
  matchedSignals: string[];
  alternateSuggestions: {
    lifeAreaId: string;
    name: string;
    confidence: number;
  }[];
  needsConfirmation: boolean;
};

export type ClassifyLifeAreaInput = {
  taskText: string;
  projects?: { id: string; name: string }[];
  contacts?: string[];
  companies?: string[];
  offers?: string[];
  calendarContext?: string[];
  previousCorrections?: LifeAreaCorrection[];
};

export type SmartLifeAreaSuggestion = {
  proposedName: string;
  relatedPhrases: string[];
  taskCount: number;
  confidence: number;
};

export type CreateUserLifeAreaInput = {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  rememberForSuggestions?: boolean;
};

/** Confidence at or above this — companion applies without asking. */
export const LIFE_AREA_AUTO_APPLY_THRESHOLD = 0.72;

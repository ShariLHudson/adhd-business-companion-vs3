/**
 * Reflection Engine™ — memory-to-insight types (no chat dependency).
 */

import type { MemoryDateRange } from "../types";

export type ReflectionTimeRange = MemoryDateRange;

export type ReflectionReport = {
  themes: string[];
  emotionalPatterns: string[];
  behaviorPatterns: string[];
  wins: string[];
  challenges: string[];
  insights: string[];
  summary: string;
  /** ISO timestamp when report was generated */
  generatedAt: string;
  entryCount: number;
  insufficientData: boolean;
};

export const REFLECTION_INSUFFICIENT_SUMMARY =
  "Not enough data to generate reflection yet.";

/** Minimum stored entries in range before pattern analysis runs. */
export const REFLECTION_MIN_ENTRIES = 2;

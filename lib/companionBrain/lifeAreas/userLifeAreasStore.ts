/**
 * User Life Areas — custom areas that sync locally (Supabase-ready shape).
 */

import type { CreateUserLifeAreaInput, LifeArea } from "./types";

const STORAGE_KEY = "companion-user-life-areas-v1";
const RECENT_KEY = "companion-life-area-recent-v1";
const MAX_RECENT = 8;

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

function uid(): string {
  return `user:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readUserLifeAreas(): LifeArea[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is LifeArea =>
        Boolean(a) &&
        typeof a === "object" &&
        typeof (a as LifeArea).id === "string" &&
        typeof (a as LifeArea).name === "string" &&
        (a as LifeArea).kind === "user",
    );
  } catch {
    return [];
  }
}

function writeUserLifeAreas(areas: LifeArea[]): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
  } catch {
    /* storage unavailable */
  }
}

export function createUserLifeArea(input: CreateUserLifeAreaInput): LifeArea {
  const trimmed = input.name.trim();
  if (!trimmed) {
    throw new Error("Life Area name is required");
  }
  const existing = readUserLifeAreas();
  const hit = existing.find(
    (a) => a.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (hit) return hit;

  const area: LifeArea = {
    id: uid(),
    name: trimmed,
    kind: "user",
    color: input.color,
    icon: input.icon,
    description: input.description?.trim() || undefined,
    rememberForSuggestions: input.rememberForSuggestions !== false,
    createdAt: new Date().toISOString(),
    legacyDomain: "business",
  };
  writeUserLifeAreas([...existing, area]);
  return area;
}

export function readRecentLifeAreaIds(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

export function touchRecentLifeArea(lifeAreaId: string): void {
  if (!hasStorage() || !lifeAreaId) return;
  const prev = readRecentLifeAreaIds().filter((id) => id !== lifeAreaId);
  const next = [lifeAreaId, ...prev].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

export function resetUserLifeAreasForTests(): void {
  if (!hasStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(RECENT_KEY);
}

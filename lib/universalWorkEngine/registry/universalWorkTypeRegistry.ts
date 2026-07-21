/**
 * Authoritative Universal Work Type registry.
 * Work Type packages register configuration only — never private save/identity/commands.
 */

import type { WorkTypePackage } from "../types";
import { UnknownWorkTypeError } from "../types";

const byId = new Map<string, WorkTypePackage>();

export function registerWorkTypePackage(pkg: WorkTypePackage): void {
  const id = pkg.workTypeId.trim();
  if (!id) {
    throw new Error("Work Type package requires workTypeId");
  }
  if (!pkg.version?.trim()) {
    throw new Error(`Work Type "${id}" requires version`);
  }
  if (!pkg.sections?.length) {
    throw new Error(`Work Type "${id}" requires section definitions`);
  }
  byId.set(id, { ...pkg, workTypeId: id });
}

export function getWorkTypePackage(
  workTypeId: string | null | undefined,
): WorkTypePackage | null {
  const id = workTypeId?.trim();
  if (!id) return null;
  return byId.get(id) ?? null;
}

/** Fail safely and visibly — never silent template fallthrough for resolved ids. */
export function requireWorkTypePackage(workTypeId: string): WorkTypePackage {
  const pkg = getWorkTypePackage(workTypeId);
  if (!pkg) throw new UnknownWorkTypeError(workTypeId);
  return pkg;
}

export function listWorkTypePackages(): WorkTypePackage[] {
  return [...byId.values()];
}

export function isWorkTypeRegistered(workTypeId: string): boolean {
  return byId.has(workTypeId.trim());
}

export function clearWorkTypePackageRegistryForTests(): void {
  byId.clear();
}

/**
 * Label → Work Type ID (shared with workTypeSchema resolver semantics).
 * Resolved IDs must be registered packages or bootstrap must fail visibly.
 */
export function resolveWorkTypeIdFromMemberLabel(
  typeLabel: string | null | undefined,
): string | null {
  const t = (typeLabel ?? "").trim().toLowerCase();
  if (!t) return null;
  if (
    /\b(event|retreat|workshop|webinar|conference|summit|panel|launch|networking|fundraiser|training|trade\s*show)\b/.test(
      t,
    ) ||
    t === "event plan" ||
    t.includes("event plan")
  ) {
    return "event_plan";
  }
  if (/\bsop\b|standard operating/.test(t)) return "sop";
  if (/checklist/.test(t)) return "checklist";
  if (/proposal/.test(t)) return "proposal";
  if (
    /\b(craft\s+show\s+(?:business|blueprint)|handmade|maker\s+business|etsy\s+(?:shop|store)|art\s+fair\s+business)\b/.test(
      t,
    ) ||
    (t.includes("business plan") &&
      /\b(craft|handmade|maker|show|store|etsy)\b/.test(t))
  ) {
    return "business_plan";
  }
  if (/marketing/.test(t)) return "marketing_plan";
  if (t === "cert probe" || t === "cert_probe") return "cert_probe";
  return null;
}

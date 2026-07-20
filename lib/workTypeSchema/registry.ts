import type { WorkTypeId, WorkTypeSchema } from "./types";

const byId = new Map<WorkTypeId, WorkTypeSchema>();

export function registerWorkTypeSchema(schema: WorkTypeSchema): void {
  byId.set(schema.workTypeId, schema);
}

export function getWorkTypeSchema(
  workTypeId: WorkTypeId | null | undefined,
): WorkTypeSchema | null {
  const id = workTypeId?.trim();
  if (!id) return null;
  return byId.get(id) ?? null;
}

export function listWorkTypeSchemas(): WorkTypeSchema[] {
  return [...byId.values()];
}

/** Resolve schema from Create type label (Retreat → event_plan, SOP → sop, …). */
export function resolveWorkTypeIdFromLabel(
  typeLabel: string | null | undefined,
): WorkTypeId | null {
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
  if (/marketing/.test(t)) return "marketing_plan";
  return null;
}

export function getWorkTypeSchemaForCreateLabel(
  typeLabel: string | null | undefined,
): WorkTypeSchema | null {
  return getWorkTypeSchema(resolveWorkTypeIdFromLabel(typeLabel));
}

/** Test helper — callers should re-register schemas they need. */
export function clearWorkTypeSchemaRegistryForTests(): void {
  byId.clear();
}

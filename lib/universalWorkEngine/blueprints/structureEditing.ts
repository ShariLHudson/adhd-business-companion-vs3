/**
 * Blueprint structure editing — stable IDs, order-only moves, soft-delete + undo (099).
 */

import type { BlueprintDefinition, BlueprintGroup, BlueprintSectionDef } from "./types";
import { registerBlueprint, requireBlueprint, resolveBlueprintVersion } from "./registry";
import { recordBlueprintAudit } from "./auditHistory";
import { ALL_BLUEPRINT_DEPTH_MODES } from "./types";

export type StructureUndoEntry = {
  id: string;
  at: string;
  label: string;
  previous: BlueprintDefinition;
};

const undoByBlueprint = new Map<string, StructureUndoEntry[]>();

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

function bumpPatch(version: string): string {
  const parts = version.split(".").map((n) => Number.parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] = (parts[2] ?? 0) + 1;
  return parts.join(".");
}

function pushUndo(bp: BlueprintDefinition, label: string): void {
  const list = undoByBlueprint.get(bp.blueprintId) ?? [];
  list.unshift({
    id: newId("undo"),
    at: nowIso(),
    label,
    previous: structuredClone
      ? structuredClone(bp)
      : (JSON.parse(JSON.stringify(bp)) as BlueprintDefinition),
  });
  undoByBlueprint.set(bp.blueprintId, list.slice(0, 40));
}

export function resetStructureUndoForTests(): void {
  undoByBlueprint.clear();
}

export function listStructureUndo(blueprintId: string): StructureUndoEntry[] {
  return [...(undoByBlueprint.get(blueprintId) ?? [])];
}

function commitStructure(
  previous: BlueprintDefinition,
  next: BlueprintDefinition,
  label: string,
  publishNewVersion: boolean,
): BlueprintDefinition {
  pushUndo(previous, label);
  const versioned: BlueprintDefinition = {
    ...next,
    supportedDepthModes: next.supportedDepthModes?.length
      ? next.supportedDepthModes
      : ALL_BLUEPRINT_DEPTH_MODES,
    version: publishNewVersion ? bumpPatch(previous.version) : next.version,
  };
  registerBlueprint(versioned);
  recordBlueprintAudit({
    blueprintId: versioned.blueprintId,
    blueprintVersion: versioned.version,
    action: "register",
    detail: `structure:${label}`,
  });
  return versioned;
}

function activeSections(bp: BlueprintDefinition): BlueprintSectionDef[] {
  return bp.sections.filter((s) => !s.softDeleted);
}

function ensureGroups(bp: BlueprintDefinition): BlueprintGroup[] {
  return [...(bp.groups ?? [])].sort((a, b) => a.order - b.order);
}

export function addBlueprintSection(
  blueprintId: string,
  input: {
    title: string;
    groupId?: string | null;
    required?: boolean;
    skippable?: boolean;
    starterPrompt?: string;
  },
  options?: { asNewVersion?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const id = newId("sec");
  const groups = ensureGroups(bp);
  const groupId = input.groupId ?? groups[0]?.groupId ?? null;
  const section: BlueprintSectionDef = {
    id,
    title: input.title.trim() || "New section",
    role: input.required === false ? "optional" : "required",
    required: input.required !== false,
    skippable: input.skippable ?? true,
    starterPrompt: input.starterPrompt,
    groupId,
    order: activeSections(bp).length,
  };
  let nextGroups = groups;
  if (groupId) {
    nextGroups = groups.map((g) =>
      g.groupId === groupId
        ? { ...g, sectionIds: [...g.sectionIds, id] }
        : g,
    );
  }
  return commitStructure(
    bp,
    { ...bp, sections: [...bp.sections, section], groups: nextGroups },
    `add_section:${id}`,
    options?.asNewVersion !== false,
  );
}

export function renameBlueprintSection(
  blueprintId: string,
  sectionId: string,
  title: string,
  options?: { asNewVersion?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const sections = bp.sections.map((s) =>
    s.id === sectionId ? { ...s, title: title.trim() || s.title } : s,
  );
  return commitStructure(
    bp,
    { ...bp, sections },
    `rename_section:${sectionId}`,
    options?.asNewVersion !== false,
  );
}

export function duplicateBlueprintSection(
  blueprintId: string,
  sectionId: string,
  options?: { asNewVersion?: boolean; copyContentDefaults?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const source = bp.sections.find((s) => s.id === sectionId && !s.softDeleted);
  if (!source) throw new Error(`Section "${sectionId}" not found`);
  const id = newId("sec");
  const dup: BlueprintSectionDef = {
    ...source,
    id,
    title: `${source.title} (copy)`,
    softDeleted: false,
    protected: false,
    defaultValue: options?.copyContentDefaults ? source.defaultValue : "",
  };
  const groups = ensureGroups(bp).map((g) => {
    if (!g.sectionIds.includes(sectionId)) return g;
    const idx = g.sectionIds.indexOf(sectionId);
    const sectionIds = [...g.sectionIds];
    sectionIds.splice(idx + 1, 0, id);
    return { ...g, sectionIds };
  });
  const defaults = { ...(bp.defaultValues ?? {}) };
  if (!options?.copyContentDefaults) {
    delete defaults[id];
  } else if (defaults[sectionId]) {
    defaults[id] = defaults[sectionId]!;
  }
  return commitStructure(
    bp,
    {
      ...bp,
      sections: [...bp.sections, dup],
      groups,
      defaultValues: defaults,
    },
    `duplicate_section:${sectionId}->${id}`,
    options?.asNewVersion !== false,
  );
}

export function softDeleteBlueprintSection(
  blueprintId: string,
  sectionId: string,
  options?: { asNewVersion?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const target = bp.sections.find((s) => s.id === sectionId);
  if (!target) throw new Error(`Section "${sectionId}" not found`);
  if (target.protected) {
    throw new Error(`Section "${sectionId}" is protected and cannot be deleted`);
  }
  const sections = bp.sections.map((s) =>
    s.id === sectionId ? { ...s, softDeleted: true } : s,
  );
  const groups = ensureGroups(bp).map((g) => ({
    ...g,
    sectionIds: g.sectionIds.filter((id) => id !== sectionId),
  }));
  return commitStructure(
    bp,
    { ...bp, sections, groups },
    `soft_delete_section:${sectionId}`,
    options?.asNewVersion !== false,
  );
}

/** Restore a soft-deleted section into its previous group (or first group). */
export function restoreBlueprintSection(
  blueprintId: string,
  sectionId: string,
  options?: { asNewVersion?: boolean; groupId?: string },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const target = bp.sections.find((s) => s.id === sectionId);
  if (!target) throw new Error(`Section "${sectionId}" not found`);
  if (!target.softDeleted) return bp;
  const groups = ensureGroups(bp);
  const preferred =
    options?.groupId ??
    target.groupId ??
    groups[0]?.groupId ??
    null;
  const sections = bp.sections.map((s) =>
    s.id === sectionId
      ? {
          ...s,
          softDeleted: false,
          groupId: preferred ?? s.groupId,
        }
      : s,
  );
  const nextGroups = preferred
    ? groups.map((g) =>
        g.groupId === preferred && !g.sectionIds.includes(sectionId)
          ? { ...g, sectionIds: [...g.sectionIds, sectionId] }
          : g,
      )
    : groups;
  return commitStructure(
    bp,
    { ...bp, sections, groups: nextGroups },
    `restore_section:${sectionId}`,
    options?.asNewVersion !== false,
  );
}

/** Mark a section required or optional (role + required flag). */
export function setBlueprintSectionRole(
  blueprintId: string,
  sectionId: string,
  role: "required" | "optional",
  options?: { asNewVersion?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  if (!bp.sections.some((s) => s.id === sectionId && !s.softDeleted)) {
    throw new Error(`Section "${sectionId}" not found`);
  }
  const sections = bp.sections.map((s) =>
    s.id === sectionId
      ? {
          ...s,
          role,
          required: role === "required",
        }
      : s,
  );
  return commitStructure(
    bp,
    { ...bp, sections },
    `set_section_role:${sectionId}:${role}`,
    options?.asNewVersion !== false,
  );
}

export function moveBlueprintSection(
  blueprintId: string,
  sectionId: string,
  direction: "up" | "down",
  options?: { asNewVersion?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const groups = ensureGroups(bp);
  const group = groups.find((g) => g.sectionIds.includes(sectionId));
  if (!group) {
    // Flat order among ungrouped active sections
    const active = activeSections(bp);
    const idx = active.findIndex((s) => s.id === sectionId);
    if (idx < 0) throw new Error(`Section "${sectionId}" not found`);
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= active.length) return bp;
    const orderIds = active.map((s) => s.id);
    [orderIds[idx], orderIds[swap]] = [orderIds[swap]!, orderIds[idx]!];
    const rank = new Map(orderIds.map((id, i) => [id, i]));
    const sections = bp.sections.map((s) =>
      rank.has(s.id) ? { ...s, order: rank.get(s.id)! } : s,
    );
    return commitStructure(
      bp,
      { ...bp, sections },
      `move_section:${sectionId}:${direction}`,
      options?.asNewVersion !== false,
    );
  }
  const ids = [...group.sectionIds];
  const idx = ids.indexOf(sectionId);
  const swap = direction === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= ids.length) return bp;
  [ids[idx], ids[swap]] = [ids[swap]!, ids[idx]!];
  const nextGroups = groups.map((g) =>
    g.groupId === group.groupId ? { ...g, sectionIds: ids } : g,
  );
  return commitStructure(
    bp,
    { ...bp, groups: nextGroups },
    `move_section:${sectionId}:${direction}`,
    options?.asNewVersion !== false,
  );
}

export function moveBlueprintSectionToGroup(
  blueprintId: string,
  sectionId: string,
  targetGroupId: string,
  options?: { asNewVersion?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const groups = ensureGroups(bp);
  if (!groups.some((g) => g.groupId === targetGroupId)) {
    throw new Error(`Group "${targetGroupId}" not found`);
  }
  const nextGroups = groups.map((g) => {
    const without = g.sectionIds.filter((id) => id !== sectionId);
    if (g.groupId === targetGroupId) {
      return {
        ...g,
        sectionIds: without.includes(sectionId)
          ? without
          : [...without, sectionId],
      };
    }
    return { ...g, sectionIds: without };
  });
  const sections = bp.sections.map((s) =>
    s.id === sectionId ? { ...s, groupId: targetGroupId } : s,
  );
  return commitStructure(
    bp,
    { ...bp, sections, groups: nextGroups },
    `move_section_to_group:${sectionId}->${targetGroupId}`,
    options?.asNewVersion !== false,
  );
}

export function addBlueprintGroup(
  blueprintId: string,
  title: string,
  options?: { asNewVersion?: boolean; collapsedByDefault?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const groups = ensureGroups(bp);
  const group: BlueprintGroup = {
    groupId: newId("grp"),
    title: title.trim() || "New group",
    order: groups.length,
    collapsedByDefault: options?.collapsedByDefault ?? true,
    sectionIds: [],
  };
  return commitStructure(
    bp,
    { ...bp, groups: [...groups, group] },
    `add_group:${group.groupId}`,
    options?.asNewVersion !== false,
  );
}

export function renameBlueprintGroup(
  blueprintId: string,
  groupId: string,
  title: string,
  options?: { asNewVersion?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const groups = ensureGroups(bp).map((g) =>
    g.groupId === groupId ? { ...g, title: title.trim() || g.title } : g,
  );
  return commitStructure(
    bp,
    { ...bp, groups },
    `rename_group:${groupId}`,
    options?.asNewVersion !== false,
  );
}

export function deleteBlueprintGroup(
  blueprintId: string,
  groupId: string,
  options?: { asNewVersion?: boolean; force?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const groups = ensureGroups(bp);
  const target = groups.find((g) => g.groupId === groupId);
  if (!target) throw new Error(`Group "${groupId}" not found`);
  if (target.sectionIds.length && !options?.force) {
    throw new Error(
      `Group "${groupId}" is not empty — move or delete sections first, or confirm force`,
    );
  }
  return commitStructure(
    bp,
    { ...bp, groups: groups.filter((g) => g.groupId !== groupId) },
    `delete_group:${groupId}`,
    options?.asNewVersion !== false,
  );
}

export function moveBlueprintGroup(
  blueprintId: string,
  groupId: string,
  direction: "up" | "down",
  options?: { asNewVersion?: boolean },
): BlueprintDefinition {
  const bp = requireBlueprint(blueprintId);
  const groups = ensureGroups(bp);
  const idx = groups.findIndex((g) => g.groupId === groupId);
  if (idx < 0) throw new Error(`Group "${groupId}" not found`);
  const swap = direction === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= groups.length) return bp;
  const next = [...groups];
  [next[idx], next[swap]] = [next[swap]!, next[idx]!];
  const reordered = next.map((g, order) => ({ ...g, order }));
  return commitStructure(
    bp,
    { ...bp, groups: reordered },
    `move_group:${groupId}:${direction}`,
    options?.asNewVersion !== false,
  );
}

/** Restore last structure undo for a blueprint (re-registers previous version). */
export function undoBlueprintStructure(
  blueprintId: string,
): BlueprintDefinition | null {
  const list = undoByBlueprint.get(blueprintId);
  const entry = list?.shift();
  if (!entry) return null;
  undoByBlueprint.set(blueprintId, list ?? []);
  registerBlueprint(entry.previous);
  recordBlueprintAudit({
    blueprintId,
    blueprintVersion: entry.previous.version,
    action: "register",
    detail: `undo:${entry.label}`,
  });
  return requireBlueprint(
    blueprintId,
    resolveBlueprintVersion(blueprintId, entry.previous.version),
  );
}

/**
 * Diff two blueprint versions for intentional adopt preview.
 */
export function previewBlueprintStructureUpdate(
  fromBlueprintId: string,
  fromVersion: string,
  toVersion?: string | null,
): {
  addedSectionIds: string[];
  removedSectionIds: string[];
  renamedSections: { id: string; from: string; to: string }[];
  movedSectionIds: string[];
  addedGroupIds: string[];
  removedGroupIds: string[];
} {
  const from = requireBlueprint(fromBlueprintId, fromVersion);
  const to = requireBlueprint(
    fromBlueprintId,
    resolveBlueprintVersion(fromBlueprintId, toVersion),
  );
  const fromSecs = new Map(
    from.sections.filter((s) => !s.softDeleted).map((s) => [s.id, s]),
  );
  const toSecs = new Map(
    to.sections.filter((s) => !s.softDeleted).map((s) => [s.id, s]),
  );
  const addedSectionIds = [...toSecs.keys()].filter((id) => !fromSecs.has(id));
  const removedSectionIds = [...fromSecs.keys()].filter((id) => !toSecs.has(id));
  const renamedSections: { id: string; from: string; to: string }[] = [];
  const movedSectionIds: string[] = [];
  for (const [id, s] of toSecs) {
    const prev = fromSecs.get(id);
    if (!prev) continue;
    if (prev.title !== s.title) {
      renamedSections.push({ id, from: prev.title, to: s.title });
    }
    if ((prev.groupId ?? "") !== (s.groupId ?? "")) {
      movedSectionIds.push(id);
    }
  }
  const fromGroups = new Set((from.groups ?? []).map((g) => g.groupId));
  const toGroups = new Set((to.groups ?? []).map((g) => g.groupId));
  return {
    addedSectionIds,
    removedSectionIds,
    renamedSections,
    movedSectionIds,
    addedGroupIds: [...toGroups].filter((id) => !fromGroups.has(id)),
    removedGroupIds: [...fromGroups].filter((id) => !toGroups.has(id)),
  };
}

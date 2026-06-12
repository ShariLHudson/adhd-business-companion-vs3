import { getFounderOwnerId, getFounderSupabaseAdmin } from "@/lib/supabase/founderServer";

import {
  itemToExperimentRow,
  itemToNoteRow,
  itemToProjectRow,
  rowsToWorkspaceData,
  type FounderExperimentRow,
  type FounderNoteRow,
  type FounderProjectRow,
} from "./dbMapping";
import type { FounderWorkspaceData, FounderWorkspaceItem, FounderWorkspaceItemKind } from "./types";

const PROJECTS_TABLE = "founder_projects";
const EXPERIMENTS_TABLE = "founder_experiments";
const NOTES_TABLE = "founder_notes";

function tableForKind(kind: FounderWorkspaceItemKind): string {
  if (kind === "project") return PROJECTS_TABLE;
  if (kind === "experiment") return EXPERIMENTS_TABLE;
  return NOTES_TABLE;
}

export async function loadFounderWorkspaceFromDb(): Promise<FounderWorkspaceData | null> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return null;
  const ownerId = getFounderOwnerId();

  const [projectsRes, experimentsRes, notesRes] = await Promise.all([
    supabase.from(PROJECTS_TABLE).select("*").eq("owner_id", ownerId),
    supabase.from(EXPERIMENTS_TABLE).select("*").eq("owner_id", ownerId),
    supabase.from(NOTES_TABLE).select("*").eq("owner_id", ownerId),
  ]);

  if (projectsRes.error || experimentsRes.error || notesRes.error) {
    console.error("founder workspace load error", {
      projects: projectsRes.error,
      experiments: experimentsRes.error,
      notes: notesRes.error,
    });
    throw new Error("Could not load founder workspace from database.");
  }

  return rowsToWorkspaceData(
    (projectsRes.data ?? []) as FounderProjectRow[],
    (experimentsRes.data ?? []) as FounderExperimentRow[],
    (notesRes.data ?? []) as FounderNoteRow[],
  );
}

export async function upsertFounderWorkspaceItemInDb(
  item: FounderWorkspaceItem,
  previousKind?: FounderWorkspaceItemKind,
): Promise<void> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured.");
  const ownerId = getFounderOwnerId();

  if (previousKind && previousKind !== item.kind) {
    await deleteFounderWorkspaceItemFromDb(previousKind, item.id);
  }

  if (item.kind === "project") {
    const row = itemToProjectRow(item, ownerId);
    const { error } = await supabase.from(PROJECTS_TABLE).upsert(row);
    if (error) throw error;
    return;
  }
  if (item.kind === "experiment") {
    const row = itemToExperimentRow(item, ownerId);
    const { error } = await supabase.from(EXPERIMENTS_TABLE).upsert(row);
    if (error) throw error;
    return;
  }
  const row = itemToNoteRow(item, ownerId);
  const { error } = await supabase.from(NOTES_TABLE).upsert(row);
  if (error) throw error;
}

export async function deleteFounderWorkspaceItemFromDb(
  kind: FounderWorkspaceItemKind,
  id: string,
): Promise<void> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured.");
  const ownerId = getFounderOwnerId();
  const table = tableForKind(kind);
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", id);
  if (error) throw error;
}

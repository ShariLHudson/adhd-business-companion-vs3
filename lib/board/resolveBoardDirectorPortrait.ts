/**
 * Canonical Board director portrait resolver.
 * Always requires the selected director record — never borrows the Chairman
 * or another director's image.
 */

import {
  BOARD_DIRECTOR_ASSET_BASE,
  getBoardDirectorById,
  listBoardDirectors,
} from "@/lib/board/boardDirectorRegistry";
import type { BoardDirectorDefinition, BoardDirectorId } from "@/lib/board/types";

export type BoardDirectorPortraitSourceField =
  | "portraitPath"
  | "galleryCardPath"
  | "director_id_placeholder";

export type ResolvedBoardDirectorPortrait = {
  src: string;
  alt: string;
  fallback: string;
  directorId: BoardDirectorId;
  sourceField: BoardDirectorPortraitSourceField;
};

const GENERIC_PLACEHOLDER = `${BOARD_DIRECTOR_ASSET_BASE}/director-portrait-placeholder.png`;

function directorPlaceholder(directorId: BoardDirectorId): string {
  return `${BOARD_DIRECTOR_ASSET_BASE}/${directorId}-portrait-fallback.png`;
}

/**
 * Resolve portrait assets from one canonical director record.
 * Fallback order: portraitPath → same director galleryCardPath → director-scoped placeholder.
 * Never returns the Chairman portrait unless `director.id === "board-chair"`.
 */
export function resolveBoardDirectorPortrait(
  director: BoardDirectorDefinition,
): ResolvedBoardDirectorPortrait {
  const alt = `${director.name}, ${director.boardRole}`;
  const directorScopedFallback = directorPlaceholder(director.id);

  if (director.portraitPath?.trim()) {
    return {
      src: director.portraitPath,
      alt,
      fallback: director.galleryCardPath?.trim() || directorScopedFallback,
      directorId: director.id,
      sourceField: "portraitPath",
    };
  }

  if (director.galleryCardPath?.trim()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[board-portrait] Missing portraitPath for ${director.id} (${director.name}); using gallery card.`,
      );
    }
    return {
      src: director.galleryCardPath,
      alt,
      fallback: directorScopedFallback,
      directorId: director.id,
      sourceField: "galleryCardPath",
    };
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[board-portrait] No portrait or gallery asset for ${director.id} (${director.name}); using director-scoped placeholder.`,
    );
  }

  return {
    src: directorScopedFallback,
    alt,
    fallback: GENERIC_PLACEHOLDER,
    directorId: director.id,
    sourceField: "director_id_placeholder",
  };
}

/** Path-only helper for callers that already hold the director record. */
export function resolveBoardDirectorPortraitPath(
  director: BoardDirectorDefinition,
): string {
  return resolveBoardDirectorPortrait(director).src;
}

/**
 * Gallery card path — same-director fallback only (never Chairman).
 */
export function resolveBoardDirectorGalleryCardPath(
  director: BoardDirectorDefinition,
): string {
  if (director.galleryCardPath?.trim()) return director.galleryCardPath;
  if (director.portraitPath?.trim()) return director.portraitPath;
  return directorPlaceholder(director.id);
}

export function resolveBoardDirectorPortraitById(
  directorId: BoardDirectorId | string,
): ResolvedBoardDirectorPortrait | null {
  const director = getBoardDirectorById(directorId);
  if (!director) return null;
  return resolveBoardDirectorPortrait(director);
}

export type BoardDirectorPortraitIntegrityRow = {
  directorId: BoardDirectorId;
  name: string;
  role: string;
  portraitPath: string | null;
  resolvedSrc: string;
  sourceField: BoardDirectorPortraitSourceField;
  seatId: string | null;
  ok: boolean;
  issues: string[];
};

/**
 * Development integrity report: directorId → name → portrait → seat.
 */
export function auditBoardDirectorPortraitIntegrity(
  seats?: ReadonlyArray<{ directorId?: BoardDirectorId; seatId: string }>,
): {
  rows: BoardDirectorPortraitIntegrityRow[];
  duplicatePortraitPaths: string[];
  missingPortraitPaths: BoardDirectorId[];
} {
  const directors = listBoardDirectors();
  const seatByDirector = new Map<string, string>();
  for (const seat of seats ?? []) {
    if (seat.directorId) seatByDirector.set(seat.directorId, seat.seatId);
  }

  const pathOwners = new Map<string, BoardDirectorId[]>();
  const rows: BoardDirectorPortraitIntegrityRow[] = [];
  const missingPortraitPaths: BoardDirectorId[] = [];

  for (const d of directors) {
    const resolved = resolveBoardDirectorPortrait(d);
    const issues: string[] = [];
    if (!d.portraitPath?.trim()) {
      missingPortraitPaths.push(d.id);
      issues.push("portraitPath missing — using fallback");
    }
    if (resolved.directorId !== d.id) {
      issues.push("resolved directorId mismatch");
    }
    const chair = directors.find((x) => x.id === "board-chair");
    if (
      d.id !== "board-chair" &&
      chair?.portraitPath &&
      resolved.src === chair.portraitPath
    ) {
      issues.push("resolved to Chairman portrait");
    }

    const owners = pathOwners.get(resolved.src) ?? [];
    owners.push(d.id);
    pathOwners.set(resolved.src, owners);

    rows.push({
      directorId: d.id,
      name: d.name,
      role: d.boardRole,
      portraitPath: d.portraitPath ?? null,
      resolvedSrc: resolved.src,
      sourceField: resolved.sourceField,
      seatId: seatByDirector.get(d.id) ?? null,
      ok: issues.length === 0,
      issues,
    });
  }

  const duplicatePortraitPaths = [...pathOwners.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([path]) => path);

  return { rows, duplicatePortraitPaths, missingPortraitPaths };
}

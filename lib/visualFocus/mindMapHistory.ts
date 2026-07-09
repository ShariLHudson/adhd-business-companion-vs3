/**
 * Undo/redo stack for Mind Map tree edits (224).
 */

import type { VisualFocusNode } from "../types";
import { cloneTree } from "./mindMapEditing";

export type MindMapHistoryState = {
  past: VisualFocusNode[];
  present: VisualFocusNode;
  future: VisualFocusNode[];
};

export const MIND_MAP_HISTORY_LIMIT = 40;

export function createMindMapHistory(
  root: VisualFocusNode,
): MindMapHistoryState {
  return { past: [], present: cloneTree(root), future: [] };
}

export function pushMindMapHistory(
  state: MindMapHistoryState,
  next: VisualFocusNode,
): MindMapHistoryState {
  const past = [...state.past, cloneTree(state.present)].slice(
    -MIND_MAP_HISTORY_LIMIT,
  );
  return {
    past,
    present: cloneTree(next),
    future: [],
  };
}

export function undoMindMapHistory(
  state: MindMapHistoryState,
): MindMapHistoryState {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1]!;
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [cloneTree(state.present), ...state.future],
  };
}

export function redoMindMapHistory(
  state: MindMapHistoryState,
): MindMapHistoryState {
  if (state.future.length === 0) return state;
  const [next, ...rest] = state.future;
  return {
    past: [...state.past, cloneTree(state.present)],
    present: next!,
    future: rest,
  };
}

export function canUndo(state: MindMapHistoryState): boolean {
  return state.past.length > 0;
}

export function canRedo(state: MindMapHistoryState): boolean {
  return state.future.length > 0;
}

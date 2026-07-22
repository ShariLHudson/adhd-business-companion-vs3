/**
 * Open Crystal Actions from any completion surface without importing page state.
 * CompanionPageClient listens and shows the compact overlay.
 */

import type { CrystalActionItemKind } from "./types";

export const CRYSTAL_ACTIONS_OPEN_EVENT = "companion-crystal-actions-open" as const;

export type CrystalActionsOpenDetail = {
  itemKind: CrystalActionItemKind;
};

export function openCrystalActions(itemKind: CrystalActionItemKind = "document"): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CrystalActionsOpenDetail>(CRYSTAL_ACTIONS_OPEN_EVENT, {
      detail: { itemKind },
    }),
  );
}

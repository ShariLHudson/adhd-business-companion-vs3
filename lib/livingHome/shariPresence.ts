import type { LivingHomeShariPresence } from "./types";

/** Shari Presence — always sheltered inside the doorway. */
export function resolveLivingHomeShariPresence(): LivingHomeShariPresence {
  return {
    placement: "inside-doorway",
    sheltered: true,
  };
}

import type { StablesSaveDestination } from "./types";

/** Where Stables reflections may land — permission first, always. */
export const STABLES_SAVE_DESTINATIONS: readonly StablesSaveDestination[] = [
  {
    id: "journal",
    label: "Journal",
    trademark: "Journal",
    whenAppropriate:
      "Private reflection the member wants to keep — insights, fears, wins.",
  },
  {
    id: "institute-cabinet",
    label: "My Institute Cabinet",
    trademark: "My Institute Cabinet",
    whenAppropriate:
      "A lesson or analogy worth returning to — filed like a kept card.",
  },
  {
    id: "evidence-vault",
    label: "Evidence Vault",
    trademark: "Evidence Vault",
    whenAppropriate:
      "Proof of courage or growth — a moment they want to remember on hard days.",
  },
  {
    id: "growth-profile",
    label: "Growth Profile",
    trademark: "Growth Profile",
    whenAppropriate:
      "Capability earned through reflection and return — quiet profile update.",
  },
] as const;

export function stablesSaveHintForChat(): string {
  return [
    "STABLES SAVE PATHS (permission required):",
    "Reflections may save to Journal, My Institute Cabinet, Evidence Vault, or Growth Profile — only when the member wants.",
    'Ask: "Would you like to keep this somewhere?" — never auto-save vulnerable moments.',
  ].join("\n");
}

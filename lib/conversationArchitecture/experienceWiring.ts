/**
 * Package 210 / 211 — Which experiences use CIE + HCV.
 */

export type ExperienceWiringStatus =
  | "wired_cie_hcv"
  | "partial_hcv_only"
  | "bypass"
  | "prototype_only";

export type ExperienceWiringRecord = {
  experienceId: string;
  label: string;
  status: ExperienceWiringStatus;
  entryModule: string;
  notes: string;
};

export const EXPERIENCE_WIRING: readonly ExperienceWiringRecord[] = [
  {
    experienceId: "talk-it-out",
    label: "Talk It Out",
    status: "wired_cie_hcv",
    entryModule: "lib/talkItOut/reflectiveEngine.ts",
    notes: "Full CIE + HCV via polishTalkItOutDelivery",
  },
  {
    experienceId: "create",
    label: "Create",
    status: "partial_hcv_only",
    entryModule: "lib/createBuilderChat.ts",
    notes: "HCV in polishCreateReply; CIE processTurn not yet primary",
  },
  {
    experienceId: "general-chat",
    label: "Shari global",
    status: "bypass",
    entryModule: "app/api/companion-chat",
    notes: "LLM companion-chat path — not CIE",
  },
  {
    experienceId: "chamber",
    label: "Chamber of Momentum",
    status: "bypass",
    entryModule: "lib/chamber",
    notes: "Persona prompts — not CIE",
  },
  {
    experienceId: "board",
    label: "Round Table Board",
    status: "bypass",
    entryModule: "lib/boardroom",
    notes: "Templated deliberation — not CIE",
  },
  {
    experienceId: "projects",
    label: "Projects",
    status: "bypass",
    entryModule: "lib/projects",
    notes: "Not on CIE/HCV",
  },
  {
    experienceId: "spark-alpha",
    label: "Spark Alpha",
    status: "prototype_only",
    entryModule: "app/spark-alpha",
    notes: "Prototype — must not be treated as production CIE",
  },
] as const;

export function experiencesFullyWired(): ExperienceWiringRecord[] {
  return EXPERIENCE_WIRING.filter((e) => e.status === "wired_cie_hcv");
}

export function experiencesBypassingGovernance(): ExperienceWiringRecord[] {
  return EXPERIENCE_WIRING.filter(
    (e) => e.status === "bypass" || e.status === "prototype_only",
  );
}

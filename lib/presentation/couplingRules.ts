/**
 * Presentation coupling rules — checklist for code review and new features.
 *
 * @see docs/architecture/PRESENTATION_MODES_ARCHITECTURE.md
 */

export const PRESENTATION_COUPLING_RULES = {
  mustNotChangeWithPresentation: [
    "conversations",
    "memory",
    "projects",
    "routing intelligence",
    "tools",
    "workflows",
    "user evidence and history",
  ] as const,
  featureLogicBelongsIn: [
    "lib/<feature>/ modules",
    "shared intelligence layers",
    "section-level data hooks",
  ] as const,
  presentationBelongsIn: [
    "estate room components",
    "workspace shell components",
    "arrival and transition UI",
    "immersive layout CSS",
  ] as const,
  violations: [
    "lib/ modules importing estate room CSS or background assets for business decisions",
    "feature behavior branching on room animation state",
    "data models keyed by presentation mode",
    "routing that requires estate storytelling copy to function",
  ] as const,
} as const;

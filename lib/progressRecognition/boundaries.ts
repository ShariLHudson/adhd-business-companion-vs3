/**
 * 101 — Canonical responsibility boundaries.
 * Shared infrastructure is encouraged; shared purpose is not.
 */

export type RecognitionSurfaceId =
  | "business_pulse"
  | "wins"
  | "hall_of_accomplishments"
  | "evidence_vault"
  | "celebration_garden"
  | "celebration_hall"
  | "celebration_sounds";

export type RecognitionSurfaceBoundary = {
  surfaceId: RecognitionSurfaceId;
  answers: string;
  ownsRecords: boolean;
  mayOverlapWith: readonly RecognitionSurfaceId[];
  neverTreatAs: readonly RecognitionSurfaceId[];
};

export const RECOGNITION_SURFACE_BOUNDARIES: readonly RecognitionSurfaceBoundary[] =
  [
    {
      surfaceId: "business_pulse",
      answers: "How is my business moving forward?",
      ownsRecords: false,
      mayOverlapWith: [],
      neverTreatAs: [
        "wins",
        "hall_of_accomplishments",
        "evidence_vault",
        "celebration_garden",
        "celebration_hall",
      ],
    },
    {
      surfaceId: "wins",
      answers: "How am I moving forward?",
      ownsRecords: true,
      mayOverlapWith: ["celebration_garden"],
      neverTreatAs: ["evidence_vault", "hall_of_accomplishments"],
    },
    {
      surfaceId: "hall_of_accomplishments",
      answers: "What have I achieved?",
      ownsRecords: true,
      mayOverlapWith: ["celebration_hall"],
      neverTreatAs: ["evidence_vault", "wins"],
    },
    {
      surfaceId: "evidence_vault",
      answers:
        "What did I discover, solve, or learn that will help me later?",
      ownsRecords: true,
      mayOverlapWith: [],
      neverTreatAs: [
        "wins",
        "hall_of_accomplishments",
        "celebration_garden",
        "celebration_hall",
      ],
    },
    {
      surfaceId: "celebration_garden",
      answers: "Light, warm recognition of wins",
      ownsRecords: false,
      mayOverlapWith: ["wins"],
      neverTreatAs: ["evidence_vault", "hall_of_accomplishments"],
    },
    {
      surfaceId: "celebration_hall",
      answers: "Recognition of accomplishments",
      ownsRecords: false,
      mayOverlapWith: ["hall_of_accomplishments"],
      neverTreatAs: ["evidence_vault", "wins"],
    },
    {
      surfaceId: "celebration_sounds",
      answers: "Optional sensory celebration layer",
      ownsRecords: false,
      mayOverlapWith: ["celebration_garden", "celebration_hall"],
      neverTreatAs: ["evidence_vault"],
    },
  ] as const;

export function getRecognitionSurfaceBoundary(
  surfaceId: RecognitionSurfaceId,
): RecognitionSurfaceBoundary {
  const found = RECOGNITION_SURFACE_BOUNDARIES.find(
    (b) => b.surfaceId === surfaceId,
  );
  if (!found) {
    throw new Error(`Unknown recognition surface: ${surfaceId}`);
  }
  return found;
}

/** Runtime guard — wins/accomplishments never become Evidence by default. */
export function assertNotEvidenceByDefault(kind: "win" | "accomplishment"): void {
  const evidence = getRecognitionSurfaceBoundary("evidence_vault");
  if (!evidence.neverTreatAs.includes(kind === "win" ? "wins" : "hall_of_accomplishments")) {
    // Structural check against the boundary table itself
    throw new Error("Boundary table corrupted: Evidence must never treat wins/accomplishments as Evidence");
  }
}

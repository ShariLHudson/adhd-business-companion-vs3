import type { KinseyPose, LivingChangeItem, LivingChangeEngineInput } from "./types";
import { isOnCooldown } from "./livingChangeHistory";

const EVENING_POSES: KinseyPose[] = [
  "curled-fireplace",
  "window-gazing",
  "sleeping-beside-chair",
];
const MORNING_POSES: KinseyPose[] = [
  "watching-birds",
  "window-gazing",
  "doorway-greeting",
];
const AFTERNOON_POSES: KinseyPose[] = [
  "sleeping-beside-chair",
  "watching-birds",
  "hidden",
];

function poseForTime(timeOfDay: LivingChangeEngineInput["timeOfDay"]): KinseyPose[] {
  switch (timeOfDay) {
    case "morning":
      return MORNING_POSES;
    case "afternoon":
      return AFTERNOON_POSES;
    case "evening":
    case "night":
      return EVENING_POSES;
    default:
      return ["hidden"];
  }
}

export function resolveKinseyChanges(
  input: LivingChangeEngineInput,
): LivingChangeItem[] {
  if (input.recoveryGentle || input.lowEnergy) {
    return [
      {
        id: "kinsey-sleeping-quiet",
        bucket: "environmental",
        priority: "life_continuity",
        sourceModule: "kinseyResolver",
        cause: "low-energy-day",
        kinsey: "sleeping-beside-chair",
      },
    ];
  }

  const candidates = poseForTime(input.timeOfDay).filter(
    (pose) => pose === "hidden" || !isOnCooldown("kinsey", pose, input.now),
  );

  const pose = candidates[0] ?? "hidden";
  if (pose === "hidden") return [];

  return [
    {
      id: `kinsey-${pose}`,
      bucket: "environmental",
      priority: "life_continuity",
      sourceModule: "kinseyResolver",
      cause: `${input.timeOfDay}-natural-presence`,
      kinsey: pose,
    },
  ];
}

import type {
  CompanionMotionProfile,
  RoomObject,
} from "@/lib/companionEnvironmentIntelligence";
import { welcomeImageCapabilities } from "@/lib/companionEnvironmentIntelligence/welcomeImageCapabilities";

type Props = {
  objects: RoomObject[];
  motion: CompanionMotionProfile;
  photographId?: string;
};

const BAKED_TABLE_KINDS = new Set(["coffee", "tea", "tea-set", "cider"]);

function hasMotion(motion: CompanionMotionProfile, kind: string): boolean {
  return motion.enabled.includes(kind as CompanionMotionProfile["enabled"][number]);
}

function objectsByPlacement(
  objects: RoomObject[],
  placement: RoomObject["placement"],
): RoomObject[] {
  return objects.filter((o) => o.placement === placement);
}

function resolveLayers(input: {
  objects: RoomObject[];
  motion: CompanionMotionProfile;
  photographId?: string;
}): { objects: RoomObject[]; motion: CompanionMotionProfile } {
  const caps = welcomeImageCapabilities(input.photographId);

  const environmentalObjects = input.objects.filter((object) => {
    if (caps.mugBakedIn && BAKED_TABLE_KINDS.has(object.kind)) return false;
    return true;
  });

  const enabled = input.motion.enabled.filter((kind) => {
    if (caps.suppressCurtains && kind === "curtains") return false;
    if (caps.suppressHospitalitySteam && kind === "steam") return false;
    if (!caps.openWindow && kind === "foliage") return false;
    return true;
  });

  return {
    objects: environmentalObjects,
    motion: { enabled },
  };
}

/**
 * Layer 2 — environmental objects. Layer 3 — quiet motion.
 */
export function LivingCompanionRoomLayers({ objects, motion, photographId }: Props) {
  const layers = resolveLayers({ objects, motion, photographId });
  const onTable = objectsByPlacement(layers.objects, "table");
  const onWindow = objectsByPlacement(layers.objects, "window");
  const onFloor = objectsByPlacement(layers.objects, "floor");

  return (
    <div className="companion-welcome-scene__room" aria-hidden="true">
      {onTable.map((object, index) => (
        <div
          key={`table-${object.kind}-${index}`}
          className={`companion-welcome-scene__object companion-welcome-scene__object--${object.kind}`}
          data-label={object.label}
        />
      ))}

      {onWindow.map((object, index) => (
        <div
          key={`window-${object.kind}-${index}`}
          className={`companion-welcome-scene__object companion-welcome-scene__object--${object.kind} companion-welcome-scene__object--window`}
        />
      ))}

      {onFloor.map((object, index) => (
        <div
          key={`floor-${object.kind}-${index}`}
          className={`companion-welcome-scene__object companion-welcome-scene__object--${object.kind} companion-welcome-scene__object--floor`}
        />
      ))}

      <div className="companion-welcome-scene__life companion-welcome-scene__life--room">
        {hasMotion(layers.motion, "sunlight") ? (
          <div className="companion-welcome-scene__sunlight" />
        ) : null}
        {hasMotion(layers.motion, "lamplight") ? (
          <div className="companion-welcome-scene__lamplight" />
        ) : null}
        {hasMotion(layers.motion, "foliage") ? (
          <div className="companion-welcome-scene__foliage" />
        ) : null}
        {hasMotion(layers.motion, "candle") ? (
          <div className="companion-welcome-scene__candle companion-welcome-scene__candle--shelf" />
        ) : null}
        {hasMotion(layers.motion, "steam") ? (
          <div className="companion-welcome-scene__steam" />
        ) : null}
        {hasMotion(layers.motion, "snow") ? (
          <div className="companion-welcome-scene__snow" />
        ) : null}
        {hasMotion(layers.motion, "fireflies") ? (
          <div className="companion-welcome-scene__fireflies" />
        ) : null}
        {hasMotion(layers.motion, "butterflies") ? (
          <div className="companion-welcome-scene__butterflies" />
        ) : null}
        {hasMotion(layers.motion, "rain") ? (
          <div className="companion-welcome-scene__rain" />
        ) : null}
        {hasMotion(layers.motion, "curtains") ? (
          <div className="companion-welcome-scene__curtains" />
        ) : null}
        {hasMotion(layers.motion, "holiday-lights") ? (
          <div className="companion-welcome-scene__holiday-lights" />
        ) : null}
      </div>
    </div>
  );
}

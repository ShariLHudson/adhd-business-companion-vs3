import type {
  CompanionMotionProfile,
  RoomObject,
} from "@/lib/companionEnvironmentIntelligence";
import { COMPANION_PRESENCE_WELCOME_IMAGE_ID } from "@/lib/companionPresenceLibrary";

type Props = {
  objects: RoomObject[];
  motion: CompanionMotionProfile;
  photographId?: string;
};

/** Welcome hero already has books, candle, mug, and flowers in the photograph. */
const BAKED_IN_WELCOME_MOTION = new Set<CompanionMotionProfile["enabled"][number]>([
  "candle",
  "steam",
]);

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
  if (input.photographId !== COMPANION_PRESENCE_WELCOME_IMAGE_ID) {
    return { objects: input.objects, motion: input.motion };
  }

  return {
    objects: [],
    motion: {
      enabled: input.motion.enabled.filter(
        (kind) => !BAKED_IN_WELCOME_MOTION.has(kind),
      ),
    },
  };
}

/**
 * Layer 2 — environmental objects. Layer 3 — quiet motion.
 * Nothing announces itself; the room simply feels prepared.
 */
export function LivingCompanionRoomLayers({ objects, motion, photographId }: Props) {
  const layers = resolveLayers({ objects, motion, photographId });
  const onTable = objectsByPlacement(layers.objects, "table");
  const onWindow = objectsByPlacement(layers.objects, "window");
  const onFloor = objectsByPlacement(layers.objects, "floor");
  const books = layers.objects.filter(
    (object) => object.kind === "book" && object.placement === "shelf",
  );

  return (
    <div className="companion-welcome-scene__room" aria-hidden="true">
      {books.map((book, index) => (
        <div
          key={`book-${index}`}
          className="companion-welcome-scene__book"
          style={{ ["--book-index" as string]: index }}
          data-book-title={book.label}
        >
          <span className="companion-welcome-scene__book-spine">
            {book.label}
          </span>
        </div>
      ))}

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

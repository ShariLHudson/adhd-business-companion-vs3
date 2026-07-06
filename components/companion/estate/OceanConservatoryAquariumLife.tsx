"use client";

import { AquariumFishSvg } from "@/components/companion/estate/AquariumFishSvg";
import {
  OCEAN_AQUARIUM_BUBBLES,
  OCEAN_AQUARIUM_CORAL,
  OCEAN_AQUARIUM_FISH,
  OCEAN_AQUARIUM_PARTICLES,
  OCEAN_AQUARIUM_PLANTS,
} from "@/lib/oceanConservatory/aquariumLifeConfig";
import { OCEAN_CONSERVATORY_ROOM_LIGHTS } from "@/lib/oceanConservatory/roomLightsConfig";

type OceanConservatoryAquariumLifeProps = {
  /** Room plate URL — enables subtle drift on photographed fish inside the tank */
  backgroundImageUrl?: string | null;
};

/**
 * Living aquarium overlay — Ocean Conservatory™ only.
 * Tank life animates inside the clip; room candles/lanterns flicker outside it.
 */
export function OceanConservatoryAquariumLife({
  backgroundImageUrl,
}: OceanConservatoryAquariumLifeProps) {
  return (
    <div
      className="ocean-conservatory-aquarium-life"
      aria-hidden="true"
      data-ocean-aquarium-life=""
    >
      <div className="ocean-conservatory-aquarium-life__room-lights">
        {OCEAN_CONSERVATORY_ROOM_LIGHTS.map((light) => (
          <div
            key={light.id}
            className={[
              "estate-light-glow",
              light.kind === "lantern"
                ? "estate-light-glow--lantern"
                : "estate-light-glow--candle",
              !light.steady && light.delayStep
                ? `estate-light-glow--delay-${light.delayStep}`
                : null,
              "ocean-conservatory-aquarium-life__room-light",
              light.steady
                ? "ocean-conservatory-aquarium-life__room-light--steady"
                : null,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: light.left,
              top: light.top,
              width: light.width,
              height: light.height,
            }}
          />
        ))}
      </div>

      {backgroundImageUrl ? (
        <div
          className="ocean-conservatory-aquarium-life__tank-photo-drift"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      ) : null}

      <div className="ocean-conservatory-aquarium-life__tank">
        <div className="ocean-conservatory-aquarium-life__caustics" />
        <div className="ocean-conservatory-aquarium-life__rays" />

        {OCEAN_AQUARIUM_PLANTS.map((plant) => (
          <div
            key={plant.id}
            className="ocean-conservatory-aquarium-life__plant-sway"
            style={{
              left: plant.left,
              bottom: plant.bottom,
              width: plant.width,
              height: plant.height,
              animationDuration: `${plant.durationSec}s`,
              animationDelay: `${plant.delaySec}s`,
            }}
          >
            <div className="ocean-conservatory-aquarium-life__plant-sway__field" />
          </div>
        ))}

        {OCEAN_AQUARIUM_CORAL.map((coral) => (
          <div
            key={coral.id}
            className={`ocean-conservatory-aquarium-life__coral-sway ocean-conservatory-aquarium-life__coral-sway--${coral.tone}`}
            style={{
              left: coral.left,
              bottom: coral.bottom,
              width: coral.width,
              height: coral.height,
              animationDuration: `${coral.durationSec}s`,
              animationDelay: `${coral.delaySec}s`,
            }}
          >
            <div className="ocean-conservatory-aquarium-life__coral-sway__field" />
          </div>
        ))}

        {OCEAN_AQUARIUM_PARTICLES.map((particle) => (
          <div
            key={particle.id}
            className="ocean-conservatory-aquarium-life__particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDuration: `${particle.durationSec}s`,
              animationDelay: `${particle.delaySec}s`,
            }}
          />
        ))}

        {OCEAN_AQUARIUM_BUBBLES.map((bubble) => (
          <div
            key={bubble.id}
            className="ocean-conservatory-aquarium-life__bubble"
            style={{
              left: bubble.left,
              bottom: bubble.bottom,
              width: bubble.size,
              height: bubble.size,
              animationDuration: `${bubble.durationSec}s`,
              animationDelay: `${bubble.delaySec}s`,
            }}
          />
        ))}

        {OCEAN_AQUARIUM_FISH.map((fish) => (
          <div
            key={fish.id}
            className={`ocean-conservatory-aquarium-life__fish ocean-conservatory-aquarium-life__fish--${fish.path}`}
            style={{
              animationDuration: `${fish.durationSec}s`,
              animationDelay: `${fish.delaySec}s`,
            }}
          >
            <div
              className={`ocean-conservatory-aquarium-life__fish-body ocean-conservatory-aquarium-life__fish-body--depth-${fish.depth}`}
              style={{ animationDelay: `${fish.delaySec * 0.37}s` }}
            >
              <AquariumFishSvg
                id={fish.id}
                tone={fish.tone}
                shape={fish.shape}
                size={fish.size}
                depth={fish.depth}
              />
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

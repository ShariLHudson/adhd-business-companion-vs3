"use client";

import { useSyncExternalStore } from "react";
import {
  ESTATE_SCENE_CROSSFADE_MS,
  getEstateSceneTransitionState,
  subscribeEstateSceneTransition,
} from "@/lib/estate/estateSceneTransition";

/**
 * Persistent estate scene layer — survives room unmounts during navigation.
 * Holds the outgoing photograph until the incoming plate is ready, then crossfades.
 */
export function EstateSceneTransitionHost() {
  const scene = useSyncExternalStore(
    subscribeEstateSceneTransition,
    getEstateSceneTransitionState,
    getEstateSceneTransitionState,
  );

  const showOutgoing =
    scene.phase === "crossfading" && scene.outgoing?.imageUrl;
  const showIncoming =
    scene.active?.imageUrl &&
    (scene.phase === "ready" || scene.phase === "idle");
  const showIncomingFade =
    scene.phase === "crossfading" && scene.incoming?.imageUrl;
  const showActiveHold =
    scene.phase === "preparing" && scene.active?.imageUrl;
  /** First plate or cold start — show destination art while it decodes, never a blank host. */
  const showIncomingPreparing =
    scene.phase === "preparing" &&
    scene.incoming?.imageUrl &&
    !scene.active?.imageUrl;

  return (
    <div
      className={[
        "estate-scene-transition-host",
        scene.plateObjectFit === "contain"
          ? "estate-scene-transition-host--show-full-plate"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!scene.active && !scene.incoming}
      data-phase={scene.phase}
    >
      {showOutgoing ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`out-${scene.outgoing!.imageUrl}`}
          src={scene.outgoing!.imageUrl}
          alt=""
          className="estate-scene-transition-host__plate estate-scene-transition-host__plate--outgoing"
          decoding="async"
        />
      ) : null}

      {showActiveHold ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`hold-${scene.active!.imageUrl}`}
          src={scene.active!.imageUrl}
          alt=""
          className="estate-scene-transition-host__plate estate-scene-transition-host__plate--hold"
          decoding="async"
        />
      ) : null}

      {showIncoming ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`in-${scene.active!.imageUrl}`}
          src={scene.active!.imageUrl}
          alt=""
          className="estate-scene-transition-host__plate estate-scene-transition-host__plate--active"
          decoding="async"
        />
      ) : null}

      {showIncomingFade ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`fade-${scene.incoming!.imageUrl}`}
          src={scene.incoming!.imageUrl}
          alt=""
          className="estate-scene-transition-host__plate estate-scene-transition-host__plate--incoming"
          decoding="async"
          style={{ transitionDuration: `${ESTATE_SCENE_CROSSFADE_MS}ms` }}
        />
      ) : null}

      {showIncomingPreparing ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`prep-${scene.incoming!.imageUrl}`}
          src={scene.incoming!.imageUrl}
          alt=""
          className="estate-scene-transition-host__plate estate-scene-transition-host__plate--preparing"
          decoding="async"
        />
      ) : null}
    </div>
  );
}

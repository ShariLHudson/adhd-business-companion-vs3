"use client";

import type { ReactNode } from "react";

type Props = {
  side: "left" | "right";
  /** Peaceful Places pathway — matched lampposts with lanterns on both sides. */
  pathway?: boolean;
  children: ReactNode;
};

/**
 * Wrought-iron estate lamppost — lantern on top, category signs hang from the side.
 */
export function EstateSignpost({ side, pathway = false, children }: Props) {
  return (
    <aside
      className={`estate-lamppost estate-lamppost--${side}${
        pathway ? " estate-lamppost--pathway" : ""
      }`}
      aria-label={side === "left" ? "Estate path signs, left" : "Estate path signs, right"}
    >
      <div className="estate-lamppost__signs">{children}</div>
      <div className="estate-lamppost__post" aria-hidden="true">
        <div className="estate-lamppost__finial" />
        <div className="estate-lamppost__lantern">
          <div className="estate-lamppost__lantern-cap" />
          <div className="estate-lamppost__lantern-glass" />
          <div className="estate-lamppost__lantern-glow" />
        </div>
        <div className="estate-lamppost__shaft" />
        <div className="estate-lamppost__base" />
      </div>
    </aside>
  );
}

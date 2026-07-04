"use client";

/**
 * Living gazebo — waterfall shimmer, leaf drift, curtain breeze.
 * CSS-only motion over the photo plate; calm, never arcade.
 */
export function JournalGazeboCinematicEnvironment({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="jg-cinematic-env" aria-hidden="true">
      <div className="jg-cinematic-env__waterfall-shimmer" />
      <div className="jg-cinematic-env__pond-shimmer" />
      <div className="jg-cinematic-env__leaves jg-cinematic-env__leaves--1" />
      <div className="jg-cinematic-env__leaves jg-cinematic-env__leaves--2" />
      <div className="jg-cinematic-env__curtain-breeze jg-cinematic-env__curtain-breeze--left" />
      <div className="jg-cinematic-env__curtain-breeze jg-cinematic-env__curtain-breeze--right" />
    </div>
  );
}

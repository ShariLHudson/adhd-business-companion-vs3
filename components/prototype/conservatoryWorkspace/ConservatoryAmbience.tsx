"use client";

type ConservatoryAmbienceProps = {
  active: boolean;
};

/** Subtle living-room motion — curtains, leaves, water, steam, light. */
export function ConservatoryAmbience({ active }: ConservatoryAmbienceProps) {
  if (!active) return null;

  return (
    <div className="cw-ambience" aria-hidden>
      <div className="cw-ambience__sunlight" />
      <div className="cw-ambience__curtain cw-ambience__curtain--left" />
      <div className="cw-ambience__curtain cw-ambience__curtain--right" />
      <div className="cw-ambience__leaves cw-ambience__leaves--left" />
      <div className="cw-ambience__leaves cw-ambience__leaves--right" />
      <div className="cw-ambience__waterfall" />
      <div className="cw-ambience__steam" />
      <div className="cw-ambience__bird cw-ambience__bird--one" />
      <div className="cw-ambience__bird cw-ambience__bird--two" />
    </div>
  );
}

"use client";

/** Conservatory life — birds, waterfall, curtains, steam. Kinsey nearby. */
export function ConservatoryScene() {
  return (
    <div className="cw4-scene" aria-hidden>
      <div className="cw4-scene__light" />
      <div className="cw4-scene__curtain cw4-scene__curtain--left" />
      <div className="cw4-scene__curtain cw4-scene__curtain--right" />
      <div className="cw4-scene__water" />
      <div className="cw4-scene__steam" />
      <div className="cw4-scene__bird cw4-scene__bird--one" />
      <div className="cw4-scene__bird cw4-scene__bird--two" />
      <div className="cw4-scene__kinsey" title="Kinsey is peacefully nearby" />
    </div>
  );
}

"use client";

/** Living conservatory — light, water, vines. Room stays present. */
export function RelationshipRoom() {
  return (
    <div className="rel-life" aria-hidden>
      <div className="rel-life__light" />
      <div className="rel-life__water" />
      <div className="rel-life__vine rel-life__vine--left" />
      <div className="rel-life__vine rel-life__vine--right" />
    </div>
  );
}

"use client";

/** Subtle living conservatory — light, water, leaves. Room stays present. */
export function RoomLife() {
  return (
    <div className="uw-life" aria-hidden>
      <div className="uw-life__light" />
      <div className="uw-life__water" />
      <div className="uw-life__vine uw-life__vine--left" />
      <div className="uw-life__vine uw-life__vine--right" />
      <div className="uw-life__dust" />
    </div>
  );
}

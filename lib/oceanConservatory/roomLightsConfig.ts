export type OceanConservatoryRoomLightKind = "candle" | "lantern";

export type OceanConservatoryRoomLightSpec = {
  id: string;
  kind: OceanConservatoryRoomLightKind;
  left: string;
  top: string;
  width: string;
  height: string;
  delayStep?: 1 | 2 | 3 | 4;
  /** Steady glow — no flicker animation (center candle on the coffee table). */
  steady?: boolean;
};

/** Candle + lantern glows aligned to the room plate (not the aquarium). */
export const OCEAN_CONSERVATORY_ROOM_LIGHTS: readonly OceanConservatoryRoomLightSpec[] =
  [
    {
      id: "coffee-candle-1",
      kind: "candle",
      left: "45.5%",
      top: "63.5%",
      width: "2.4rem",
      height: "2.4rem",
    },
    {
      id: "coffee-candle-2",
      kind: "candle",
      left: "49.5%",
      top: "62.8%",
      width: "2.2rem",
      height: "2.2rem",
      steady: true,
    },
    {
      id: "coffee-candle-3",
      kind: "candle",
      left: "53.5%",
      top: "63.5%",
      width: "2.4rem",
      height: "2.4rem",
      delayStep: 2,
    },
    {
      id: "side-lantern",
      kind: "lantern",
      left: "10.5%",
      top: "47%",
      width: "3.2rem",
      height: "3.6rem",
      delayStep: 3,
    },
    {
      id: "floor-lantern",
      kind: "lantern",
      left: "79%",
      top: "50%",
      width: "5.5rem",
      height: "6.5rem",
      delayStep: 4,
    },
  ];

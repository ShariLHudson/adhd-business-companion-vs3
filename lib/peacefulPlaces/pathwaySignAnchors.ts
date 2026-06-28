import type { EstateSignId } from "./signpostLayout";

export type PathwaySignAnchor = {
  /** Center of the baked-in sign, percent from the left edge of the photograph. */
  centerX: number;
  /** Center of the baked-in sign, percent from the top edge of the photograph. */
  centerY: number;
  width: number;
  height: number;
  dropdownAlign: "left" | "right";
};

/** Click targets aligned to the main baked-in signs on peaceful-places-pathway.png */
export const PATHWAY_SIGN_ANCHORS: Record<EstateSignId, PathwaySignAnchor> = {
  calming: {
    centerX: 17.2,
    centerY: 39.8,
    width: 13.1,
    height: 7.1,
    dropdownAlign: "left",
  },
  focus: {
    centerX: 17.2,
    centerY: 49.2,
    width: 13.1,
    height: 7.1,
    dropdownAlign: "left",
  },
  energize: {
    centerX: 82.8,
    centerY: 35.8,
    width: 13.1,
    height: 6.75,
    dropdownAlign: "right",
  },
  unwind: {
    centerX: 82.8,
    centerY: 44.8,
    width: 13.1,
    height: 6.75,
    dropdownAlign: "right",
  },
  "my-places": {
    centerX: 82.8,
    centerY: 53.8,
    width: 13.1,
    height: 7.1,
    dropdownAlign: "right",
  },
};

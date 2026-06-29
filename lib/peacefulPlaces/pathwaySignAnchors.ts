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

/** Legacy photo-overlay anchors — woodland pathway uses CSS lamppost signposts. */
export const PATHWAY_SIGN_ANCHORS: Record<EstateSignId, PathwaySignAnchor> = {
  calming: {
    centerX: 12.4,
    centerY: 28.8,
    width: 13.1,
    height: 7.1,
    dropdownAlign: "left",
  },
  focus: {
    centerX: 12.4,
    centerY: 38.2,
    width: 13.1,
    height: 7.1,
    dropdownAlign: "left",
  },
  energize: {
    centerX: 87.6,
    centerY: 27.2,
    width: 13.1,
    height: 6.75,
    dropdownAlign: "right",
  },
  unwind: {
    centerX: 87.6,
    centerY: 39.6,
    width: 13.1,
    height: 6.75,
    dropdownAlign: "right",
  },
  "my-places": {
    centerX: 87.6,
    centerY: 49.2,
    width: 13.1,
    height: 7.1,
    dropdownAlign: "right",
  },
};

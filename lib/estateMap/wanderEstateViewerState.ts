/**
 * Wander the Estate — exclusive gallery vs image viewer modes.
 */

export type WanderEstateViewMode = "gallery" | "image_viewer";

export type WanderEstateViewerState = {
  selectedImageId: string;
  selectedIndex: number;
  returnFocusId: string;
  openedFrom: "gallery_card";
};

export function createViewerState(
  imageId: string,
  index: number,
): WanderEstateViewerState {
  return {
    selectedImageId: imageId,
    selectedIndex: index,
    returnFocusId: `explore-estate-card-${imageId}`,
    openedFrom: "gallery_card",
  };
}

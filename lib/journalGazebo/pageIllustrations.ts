import { JOURNAL_GAZEBO_SCENE_URL } from "./journalGazeboMedia";

export type PageIllustrationId = "none" | "gazebo-welcome" | "gazebo-soft";

/** Estate renderings on ceremony pages — no SVG watermarks. */
export function pageIllustrationForIndex(pageIndex: number): {
  id: PageIllustrationId;
  imageUrl?: string;
} {
  if (pageIndex === 0) {
    return { id: "gazebo-soft", imageUrl: JOURNAL_GAZEBO_SCENE_URL };
  }
  if (pageIndex === 1) {
    return { id: "gazebo-welcome", imageUrl: JOURNAL_GAZEBO_SCENE_URL };
  }
  if (pageIndex === 2) {
    return { id: "gazebo-soft", imageUrl: JOURNAL_GAZEBO_SCENE_URL };
  }
  if (pageIndex === 3) {
    return { id: "gazebo-welcome", imageUrl: JOURNAL_GAZEBO_SCENE_URL };
  }
  return { id: "none" };
}

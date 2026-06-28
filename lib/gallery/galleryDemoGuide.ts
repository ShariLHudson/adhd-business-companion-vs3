/**
 * Demo Mode guide — calm instructions, not feature documentation.
 */

export const GALLERY_DEMO_GUIDE_STORAGE_KEY =
  "companion-gallery-demo-guide-seen-v1" as const;

export type GalleryDemoGuideStep = {
  title: string;
  body: string;
};

export const GALLERY_DEMO_GUIDE_STEPS: readonly GalleryDemoGuideStep[] = [
  {
    title: "Pick a chapter",
    body: "Each chip is a moment in time — day one, three months later, five years on.",
  },
  {
    title: "Stroll forward",
    body: "The hallway moves gently ahead. Framed exhibits live on the walls and appear as you walk.",
  },
  {
    title: "Sample story only",
    body: "Nothing here is your personal data. One day, your Gallery quietly curates real milestones.",
  },
] as const;

export const GALLERY_DEMO_SCENE_HINT =
  "Tap a chapter, then keep walking — watch the walls change." as const;

export function isGalleryDemoGuideDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(GALLERY_DEMO_GUIDE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissGalleryDemoGuide(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GALLERY_DEMO_GUIDE_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

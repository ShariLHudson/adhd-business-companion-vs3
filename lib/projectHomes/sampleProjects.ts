import type { ProjectHomeRecord, ProjectHomeStatus } from "./types";

/** Curated example homes — labeled Sample; not read from companion-projects until used. */
export const SAMPLE_PROJECT_HOMES: ProjectHomeRecord[] = [
  {
    id: "ph-sample-newsletter",
    name: "Gentle Restart Newsletter",
    purpose: "A monthly letter that helps members return without shame.",
    projectHomeId: "writing-room",
    status: "in-motion",
    currentFocus: "Draft the April welcome letter",
    lastWorkedAt: "2026-07-10T15:00:00.000Z",
    nextSuggestedStep: "Write the opening paragraph in the Writing Room",
    atmosphereNote: "Quiet desk light · soft paper · one letter at a time",
    personalization: {},
    isSample: true,
  },
  {
    id: "ph-sample-brand",
    name: "Estate Brand Mood Board",
    purpose: "Gather visual language for Spark Estate seasons.",
    projectHomeId: "art-studio",
    status: "dreaming",
    currentFocus: "Collect warm evening light references",
    lastWorkedAt: "2026-07-08T18:30:00.000Z",
    nextSuggestedStep: "Pin three images that pass the Photograph Test",
    atmosphereNote: "Paint-scented calm · unfinished canvases welcome",
    personalization: {},
    isSample: true,
  },
  {
    id: "ph-sample-offer",
    name: "Workshop Offer Ladder",
    purpose: "Clarify the path from free workshop to paid course.",
    projectHomeId: "strategy-conference",
    status: "in-motion",
    currentFocus: "Name the three rungs of the offer",
    lastWorkedAt: "2026-07-11T11:20:00.000Z",
    nextSuggestedStep: "Sketch the middle offer in one sentence",
    atmosphereNote: "Maps on the table · decisions without rush",
    personalization: {},
    isSample: true,
  },
  {
    id: "ph-sample-course",
    name: "Decision Fatigue Course Outline",
    purpose: "Teach entrepreneurs how to decide with less overwhelm.",
    projectHomeId: "study-hall",
    status: "resting",
    currentFocus: "Module two learning outcomes",
    lastWorkedAt: "2026-07-05T09:00:00.000Z",
    nextSuggestedStep: "Return when rested — pick one outcome to refine",
    atmosphereNote: "Lamplit desks · books waiting patiently",
    personalization: {},
    isSample: true,
  },
];

export const SAMPLE_PROJECTS_GALLERY_NOTE =
  "Sample projects are examples to help you explore.";

export const EXPLORE_EXAMPLES_SECTION_NOTE =
  "These are labeled samples — not your saved projects. Open one to look around.";

/** Calm invite when samples are hidden (default). */
export const VIEW_SAMPLE_PROJECTS_PROMPT =
  "Curious how a Project Home can look? You can open a sample anytime.";

export function isSampleProjectHome(
  project: Pick<ProjectHomeRecord, "id" | "isSample">,
): boolean {
  return project.isSample === true || project.id.startsWith("ph-sample-");
}

export const PROJECT_HOME_STATUS_LABEL: Record<ProjectHomeStatus, string> = {
  dreaming: "Dreaming",
  "in-motion": "In motion",
  resting: "Resting",
  "nearly-ready": "Nearly ready",
};

export function formatProjectHomeDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

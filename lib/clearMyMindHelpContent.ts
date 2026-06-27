/**
 * Accurate help copy for Clear My Mind — used by the in-panel dropdown
 * and kept in sync with the live capture → landscape → action flow.
 */

import type { WorkspaceHelpContent } from "./workspaceHelpContent";

export const CLEAR_MY_MIND_HELP: Omit<
  WorkspaceHelpContent,
  "areaId" | "helpsToday" | "strengthens"
> = {
  areaName: "Clear My Mind",
  whatItIs:
    "A safe place to empty your head — capture what's swirling without organizing first. Relief before action.",
  whenToUse:
    "When your head feels full, noisy, or you need somewhere safe to put thoughts without fixing them yet.",
  workflow: [
    "Capture — Add as many thoughts as you want. Separate them with commas. Messy is fine.",
    "Smart Split — If multiple thoughts are detected, you may be offered to separate them. You choose Separate Them or Keep As Entered.",
    "Mental Landscape — When you're ready, tap See what's held. You'll see Everything is held — thoughts grouped into clusters so you can see what's taking up space.",
    "View Thoughts — Tap a cluster to expand it, then choose View thoughts to see what's inside.",
    "Thought Actions — Select a thought to Mark Done, Schedule, Add to Calendar, Move to Project, Move to Plan My Day, Keep Here, or Delete.",
    "Add More Thoughts — From the landscape, tap Add More Thoughts to return to capture in the same session anytime.",
  ],
  tips: [
    "Open from the top navigation (🧠) for the full standalone experience.",
    "Thoughts stay safely held on this device — nothing is lost when you pause.",
    "Clusters show reassurance first; you choose when to view thoughts or take action.",
    "Voice capture works the same as typing — review and tap Capture when ready.",
  ],
  relatedAreas:
    "When you're ready to act on a thought, use Thought Actions to move it to Plan My Day or a Project. Today's Reality in Plan My Day helps Shari understand what's true today.",
};

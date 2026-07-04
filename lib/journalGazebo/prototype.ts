/** Dev helpers — Journal Gazebo living prototype. */

import {
  resetJournalGazeboConfigs,
  resetJournalGazeboSessionState,
  requestWelcomeNoteAgain,
} from "./store";

export const JOURNAL_GAZEBO_PROTOTYPE_PLACEHOLDERS = [
  { id: "arrival", label: "Arrival — room breathes (~4s)", status: "live" as const },
  { id: "envelope", label: "Click envelope → letter slides up", status: "live" as const },
  { id: "plaques", label: "Estate plaques (not buttons)", status: "live" as const },
  { id: "todays-page", label: "Open Today's Page", status: "live" as const },
  { id: "create", label: "Writing Desk commissioning + gift ceremony", status: "live" as const },
  { id: "hero-desk", label: "Your journal on the desk (hero)", status: "live" as const },
  { id: "cover-open", label: "Leather cover open → writing", status: "live" as const },
  { id: "immersive-write", label: "Writing inside your open journal", status: "live" as const },
  { id: "autosave", label: "Quiet autosave to local storage", status: "live" as const },
  { id: "ceremony", label: "First-journal dedication ceremony", status: "live" as const },
  { id: "step-back", label: "Step back into the Gazebo", status: "live" as const },
  { id: "return-greet", label: "Return visit greetings (time of day)", status: "live" as const },
  { id: "ambience", label: "Water / birds / breeze (when audio added)", status: "partial" as const },
  { id: "desk", label: "Writing Desk customization", status: "partial" as const },
  { id: "print", label: "Print / PDF export", status: "partial" as const },
  { id: "voice", label: "Voice on the page", status: "partial" as const },
  { id: "cover-upload", label: "Cover image upload", status: "placeholder" as const },
  { id: "seasonal", label: "Seasonal gazebo backgrounds", status: "placeholder" as const },
  { id: "browse", label: "Past pages library", status: "placeholder" as const },
];

/** Clear session so the first-visit journey plays again. */
export function resetJournalGazeboFirstVisit(): void {
  resetJournalGazeboSessionState();
  requestWelcomeNoteAgain();
}

/** Full prototype reset — first visit + optional journals. */
export function resetJournalGazeboPrototype(clearJournals = false): void {
  resetJournalGazeboSessionState();
  if (clearJournals) {
    resetJournalGazeboConfigs();
  }
}

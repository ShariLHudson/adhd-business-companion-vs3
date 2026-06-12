// Dopamine Hits — small, genuinely enjoyable actions that create momentum
// without being "work." The wheel can land on one of these so a stuck founder
// gets a quick, pleasant win instead of only ever facing the to-do list.
// Momentum sometimes comes from a tiny good feeling, not a task.

export const DOPAMINE_HITS: string[] = [
  "Step outside for two minutes of fresh air",
  "Drink a full glass of water",
  "Put on one song you love and listen to all of it",
  "Stretch your arms and back for sixty seconds",
  "Text someone you appreciate, just to say so",
  "Tidy one small surface near you",
  "Make a warm drink and actually sit with it",
  "Look out a window and take five slow breaths",
  "Write down one thing you're proud of this week",
  "Do ten jumping jacks to shake the stuck feeling loose",
  "Pet an animal or water a plant",
  "Step away from the screen and roll your shoulders",
];

// A stable id per hit so the wheel can treat them like any other pool item.
export function dopamineHitItems(): { id: string; text: string }[] {
  return DOPAMINE_HITS.map((text, i) => ({ id: `dopamine-${i}`, text }));
}

// Momentum Boosts — small, genuinely enjoyable actions that create momentum
// without being "work." The wheel can land on one so a stuck founder gets a
// quick win instead of only ever facing the to-do list.

export const MOMENTUM_BOOSTS: string[] = [
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

export function momentumBoostItems(): { id: string; text: string }[] {
  return MOMENTUM_BOOSTS.map((text, i) => ({ id: `momentum-boost-${i}`, text }));
}

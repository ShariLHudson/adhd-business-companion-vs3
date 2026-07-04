/**
 * Every Room Teaches Something — life skills cultivated quietly in each place.
 * Internal hints only — not room tours or instructional overlays.
 */
export const ESTATE_ROOM_LIFE_SKILLS: Readonly<Record<string, string>> = {
  greenhouse: "patience",
  library: "wisdom",
  kitchen: "nourishment",
  pond: "stillness",
  pool: "stillness",
  "journal-gazebo": "reflection",
  "hall-of-accomplishments": "evidence",
  "celebration-garden": "gratitude",
  "round-table": "thoughtful decision-making",
  "creative-studio": "courage to create",
  "momentum-room": "consistency through movement",
  conservatory: "belonging — conversation home",
  "clear-my-mind": "honest unloading without sorting first",
  "peaceful-places": "rest before complexity",
  "coffee-house": "connection without performance",
};

export function roomLifeSkillHintForPlace(placeId: string): string | null {
  const skill = ESTATE_ROOM_LIFE_SKILLS[placeId];
  if (!skill) return null;
  return `This place quietly cultivates ${skill} — let the atmosphere support self-trust; never explain it as a module.`;
}

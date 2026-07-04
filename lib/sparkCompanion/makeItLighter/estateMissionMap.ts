/**
 * Every Estate place serves one mission: reduce mental and emotional friction.
 * Reference for hints — not member-facing room tours.
 */
export const ESTATE_FRICTION_REDUCTION_MISSION: Readonly<
  Record<string, string>
> = {
  "journal-gazebo": "untangle thoughts",
  greenhouse: "growth takes time — reduce pressure",
  "celebration-garden": "small wins matter",
  library: "expand understanding without overload",
  "momentum-room": "protect progress",
  pool: "restore energy",
  "coffee-house": "connection without performance",
  "round-table": "solve problems together",
  "clear-my-mind": "unload mental load without sorting first",
  "peaceful-places": "restore calm before complexity",
  conservatory: "conversation home — one relationship",
};

export function estateMissionHintForPlace(placeId: string): string | null {
  const mission = ESTATE_FRICTION_REDUCTION_MISSION[placeId];
  if (!mission) return null;
  return `This place exists to ${mission} — invite only when it genuinely lightens load.`;
}

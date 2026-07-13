/**
 * Compatibility shim — Adaptive Rhythms lives in lib/rhythms.
 * @deprecated Import from @/lib/rhythms instead.
 */

export type { MemberRhythm, RhythmCadence } from "@/lib/rhythms";
export {
  createMemberRhythm,
  getMemberRhythm,
  listMemberRhythms,
  updateMemberRhythm,
  deleteMemberRhythm,
  RHYTHM_CADENCE_OPTIONS,
} from "@/lib/rhythms";

/**
 * Estate Intelligence™ — drawer resolution from member language (Phase 1).
 * Future: Shari opens the right drawer without the member hunting the wall.
 */

import { bootstrapPhase1InstituteCatalog } from "../catalog/bootstrapPhase1Catalog";
import {
  instituteDrawerInvitationLine,
  matchDrawerIdForMemberText,
} from "./drawerWallController";

export type InstituteDrawerOfferHint = {
  drawerId: string;
  invitationLine: string;
};

export function resolveInstituteDrawerForText(
  text: string,
): InstituteDrawerOfferHint | null {
  bootstrapPhase1InstituteCatalog();
  const drawerId = matchDrawerIdForMemberText(text);
  if (!drawerId) return null;
  const invitationLine = instituteDrawerInvitationLine(drawerId);
  if (!invitationLine) return null;
  return { drawerId, invitationLine };
}

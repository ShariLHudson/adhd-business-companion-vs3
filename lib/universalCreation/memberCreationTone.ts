/**
 * Creation drafts use Conversation Style from Settings — not a discovery question.
 */

import {
  memberCreationToneLabel,
  type MemberTonePreferenceInput,
} from "@/lib/companionTonePreferences";
import { getPrefs } from "@/lib/companionStore";

export function getMemberTonePreferences(): MemberTonePreferenceInput {
  const { aiTone, helpMode, supportStyle } = getPrefs();
  return { aiTone, helpMode, supportStyle };
}

/** Human-readable tone for email drafts — from Settings → Conversation Style. */
export function getEmailToneFromMemberSettings(): string {
  return memberCreationToneLabel(getMemberTonePreferences());
}

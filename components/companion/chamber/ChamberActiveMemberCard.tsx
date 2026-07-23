"use client";

import Image from "next/image";
import { getChamberMemberCardDisplay } from "@/lib/chamber/chamberMemberCardDisplay";
import type { ChamberMember } from "@/lib/chamber/chamberMemberRegistry";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  member: ChamberMember;
  onEndConversation: () => void;
  /** Keep the current thread and choose another member to join it. */
  onInviteAnother?: () => void;
  invitingAnother?: boolean;
};

/** Compact identity strip — portrait, name, and purpose while talking with a member. */
export function ChamberActiveMemberCard({
  member,
  onEndConversation,
  onInviteAnother,
  invitingAnother = false,
}: Props) {
  const display = getChamberMemberCardDisplay(member);

  return (
    <aside
      className="chamber-active-member"
      data-testid="chamber-active-member-card"
      aria-label={`Talking with ${member.displayName}`}
    >
      <div className="chamber-active-member__portrait">
        <Image
          src={member.cardImagePath}
          alt=""
          width={72}
          height={108}
          className="chamber-active-member__image"
        />
      </div>
      <div className="chamber-active-member__copy">
        <h2 className="chamber-active-member__name">{member.displayName}</h2>
        <p className="chamber-active-member__specialty">{display.specialtyLine}</p>
        <p className="chamber-active-member__purpose">{display.purposeStatement}</p>
      </div>
      <div className="chamber-active-member__actions">
        {onInviteAnother ? (
          <button
            type="button"
            className="chamber-active-member__invite"
            data-testid="chamber-active-member-invite-another"
            aria-pressed={invitingAnother}
            onClick={onInviteAnother}
          >
            {invitingAnother ? "Choose below…" : "Invite another member"}
          </button>
        ) : null}
        <button
          type="button"
          className="chamber-active-member__end"
          data-testid="chamber-active-member-end"
          onClick={onEndConversation}
        >
          Return to gallery
        </button>
      </div>
    </aside>
  );
}

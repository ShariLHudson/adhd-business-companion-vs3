"use client";

import Image from "next/image";
import { getChamberMemberCardDisplay } from "@/lib/chamber/chamberMemberCardDisplay";
import type { ChamberMember } from "@/lib/chamber/chamberMemberRegistry";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  member: ChamberMember;
  onEndConversation: () => void;
};

/** Compact identity strip — portrait, name, and purpose while talking with a member. */
export function ChamberActiveMemberCard({ member, onEndConversation }: Props) {
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
      <button
        type="button"
        className="chamber-active-member__end"
        data-testid="chamber-active-member-end"
        onClick={onEndConversation}
      >
        Return to gallery
      </button>
    </aside>
  );
}

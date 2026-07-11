"use client";

import Image from "next/image";
import {
  CHAMBER_MEMBERS,
  type ChamberMember,
  type ChamberMemberId,
} from "@/lib/chamber/chamberMemberRegistry";
import {
  chamberMemberTalkLabel,
  getChamberMemberCardDisplay,
} from "@/lib/chamber/chamberMemberCardDisplay";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  activeMemberId?: ChamberMemberId | null;
  onTalkWithMember: (memberId: ChamberMemberId) => void;
};

function ChamberMemberCard({
  member,
  isActive,
  onTalk,
}: {
  member: ChamberMember;
  isActive: boolean;
  onTalk: (id: ChamberMemberId) => void;
}) {
  const display = getChamberMemberCardDisplay(member);

  return (
    <article
      className={`chamber-member-card${isActive ? " chamber-member-card--active" : ""}`}
      data-testid={`chamber-member-card-${member.id}`}
      data-active={isActive ? "true" : "false"}
    >
      <button
        type="button"
        className="chamber-member-card__portrait-btn"
        aria-label={chamberMemberTalkLabel(member)}
        onClick={() => onTalk(member.id)}
      >
        <span className="chamber-member-card__frame">
          <Image
            src={member.cardImagePath}
            alt=""
            className="chamber-member-card__image"
            width={320}
            height={480}
            sizes="(max-width: 40rem) 90vw, (max-width: 64rem) 45vw, 22rem"
          />
        </span>
      </button>

      <div className="chamber-member-card__body">
        <h2 className="chamber-member-card__name">{member.displayName}</h2>
        <p className="chamber-member-card__specialty">{display.specialtyLine}</p>
        <p className="chamber-member-card__purpose">{display.purposeStatement}</p>
        {display.specialties.length > 0 ? (
          <ul className="chamber-member-card__specialties" aria-label="Specialties">
            {display.specialties.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          className="chamber-member-card__talk"
          data-testid={`chamber-member-talk-${member.id}`}
          onClick={() => onTalk(member.id)}
        >
          {chamberMemberTalkLabel(member)}
        </button>
      </div>
    </article>
  );
}

/** Desktop: 3 cards across; rows scroll vertically. */
export function ChamberMemberGallery({
  activeMemberId = null,
  onTalkWithMember,
}: Props) {
  return (
    <section
      className="chamber-member-gallery"
      aria-label="Chamber Members"
      data-testid="chamber-member-gallery"
    >
      <header className="chamber-member-gallery__header">
        <p className="chamber-member-gallery__kicker">Chamber of Momentum</p>
        <h1 className="chamber-member-gallery__title">The Chamber</h1>
        <p className="chamber-member-gallery__subtitle">
          Twenty-four specialized intelligences — choose who to talk with. Your
          conversation and context stay exactly where they are.
        </p>
      </header>
      <div className="chamber-member-gallery__scroll">
        <div
          className="chamber-member-gallery__grid"
          role="list"
          data-member-count={CHAMBER_MEMBERS.length}
        >
          {CHAMBER_MEMBERS.map((member) => (
            <div key={member.id} role="listitem" className="chamber-member-gallery__item">
              <ChamberMemberCard
                member={member}
                isActive={activeMemberId === member.id}
                onTalk={onTalkWithMember}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
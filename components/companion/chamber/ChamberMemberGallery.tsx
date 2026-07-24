"use client";

import Image from "next/image";
import {
  listActiveChamberMembers,
  type ChamberMember,
  type ChamberMemberId,
} from "@/lib/chamber/chamberMemberRegistry";
import {
  chamberMemberTalkLabel,
  getChamberMemberCardDisplay,
} from "@/lib/chamber/chamberMemberCardDisplay";
import { EstateHowToOpenControls } from "@/components/companion/EstateHowToOpenControls";
import { HowThisFitsTogetherLink } from "@/components/companion/HowThisFitsTogetherLink";
import { CHAMBER_HOW_TO_GUIDE } from "@/lib/estateRoomGuides";
import "@/app/companion/chamber-member-gallery.css";
import "@/app/companion/estate-how-to-guide.css";

type Props = {
  activeMemberId?: ChamberMemberId | null;
  selectedMemberId?: ChamberMemberId | null;
  onTalkWithMember: (memberId: ChamberMemberId) => void;
  onAboutMember?: (memberId: ChamberMemberId) => void;
  howToOpen?: boolean;
  onOpenHowTo?: () => void;
  onCloseHowTo?: () => void;
};

function ChamberMemberCard({
  member,
  isActive,
  isSelected,
  onTalk,
  onAbout,
}: {
  member: ChamberMember;
  isActive: boolean;
  isSelected: boolean;
  onTalk: (id: ChamberMemberId) => void;
  onAbout?: (id: ChamberMemberId) => void;
}) {
  const display = getChamberMemberCardDisplay(member);

  return (
    <article
      className={`chamber-member-card${isActive ? " chamber-member-card--active" : ""}${isSelected ? " chamber-member-card--selected" : ""}`}
      data-testid={`chamber-member-card-${member.id}`}
      data-active={isActive ? "true" : "false"}
      data-selected={isSelected ? "true" : "false"}
    >
      <button
        type="button"
        className="chamber-member-card__portrait-btn"
        aria-label={`About ${member.displayName}`}
        onClick={() => (onAbout ? onAbout(member.id) : onTalk(member.id))}
      >
        <span className="chamber-member-card__frame">
          <Image
            src={member.cardImagePath}
            alt=""
            className="chamber-member-card__image"
            width={320}
            height={480}
            sizes="(max-width: 34rem) 90vw, (max-width: 52rem) 45vw, 28vw"
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
        <div className="chamber-member-card__actions">
          {onAbout ? (
            <button
              type="button"
              className="chamber-member-card__about"
              data-testid={`chamber-member-about-${member.id}`}
              onClick={() => onAbout(member.id)}
            >
              About This Member
            </button>
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
      </div>
    </article>
  );
}

/** Desktop: 3 cards across; full roster scrolls vertically. */
export function ChamberMemberGallery({
  activeMemberId = null,
  selectedMemberId = null,
  onTalkWithMember,
  onAboutMember,
  howToOpen = false,
  onOpenHowTo,
}: Props) {
  const members = listActiveChamberMembers();

  return (
    <section
      className="chamber-member-gallery"
      aria-label="Chamber Members"
      data-testid="chamber-member-gallery"
      data-chamber-view="gallery"
      data-member-total={members.length}
    >
      <header className="chamber-member-gallery__header">
        <p className="chamber-member-gallery__kicker">Chamber of Momentum</p>
        <h1 className="chamber-member-gallery__title">The Chamber</h1>
        <p className="chamber-member-gallery__subtitle">
          Twenty-four specialized intelligences — choose who to talk with. Your
          conversation and context stay exactly where they are.
        </p>
        <p className="chamber-member-gallery__scroll-hint">
          Scroll to see all {members.length} members. Filters are optional —
          everyone starts visible.
        </p>
        {onOpenHowTo ? (
          <EstateHowToOpenControls
            content={CHAMBER_HOW_TO_GUIDE}
            onOpen={onOpenHowTo}
            onDark
            className="chamber-member-gallery__how-to"
          />
        ) : null}
        <HowThisFitsTogetherLink
          areaOrPlaceId="chamber-of-momentum"
          className="how-this-fits-link--inline how-this-fits-link--on-dark mt-3"
        />
      </header>
      <div
        className="chamber-member-gallery__scroll"
        data-testid="chamber-member-gallery-scroll"
        hidden={howToOpen ? true : undefined}
        aria-hidden={howToOpen || undefined}
      >
        <div
          className="chamber-member-gallery__grid"
          role="list"
          data-member-count={members.length}
          tabIndex={-1}
          data-testid="chamber-member-gallery-grid"
        >
          {members.map((member) => (
            <div key={member.id} role="listitem" className="chamber-member-gallery__item">
              <ChamberMemberCard
                member={member}
                isActive={activeMemberId === member.id}
                isSelected={selectedMemberId === member.id}
                onTalk={onTalkWithMember}
                onAbout={onAboutMember}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

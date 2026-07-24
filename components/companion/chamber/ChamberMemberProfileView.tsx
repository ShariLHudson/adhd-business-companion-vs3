"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import type { ChamberMember } from "@/lib/chamber/chamberMemberRegistry";
import {
  chamberMemberTalkLabel,
  getChamberMemberCardDisplay,
} from "@/lib/chamber/chamberMemberCardDisplay";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  member: ChamberMember;
  onReturnToGallery: () => void;
  onTalkWithMember: (member: ChamberMember) => void;
};

/**
 * Focused member profile — owns the main Chamber content area.
 * Not an overlay: gallery and chat are unmounted by the parent view mode.
 */
export function ChamberMemberProfileView({
  member,
  onReturnToGallery,
  onTalkWithMember,
}: Props) {
  const titleId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const display = getChamberMemberCardDisplay(member);

  useEffect(() => {
    headingRef.current?.focus();
  }, [member.id]);

  return (
    <section
      className="chamber-member-profile-view"
      data-testid="chamber-member-profile-view"
      data-chamber-view="member_profile"
      aria-labelledby={titleId}
    >
      <header className="chamber-member-profile-view__header">
        <p className="chamber-member-profile-view__kicker">
          About this Chamber member
        </p>
        <h1
          ref={headingRef}
          id={titleId}
          className="chamber-member-profile-view__title"
          tabIndex={-1}
        >
          {member.displayName}
        </h1>
        <p className="chamber-member-profile-view__specialty">
          {member.specialty}
        </p>
      </header>

      <div className="chamber-member-profile-view__scroll">
        <div className="chamber-member-profile-view__body">
          <div className="chamber-member-profile-view__portrait">
            <Image
              src={member.cardImagePath}
              alt={member.displayName}
              className="chamber-member-profile-view__image"
              width={400}
              height={600}
              priority
            />
          </div>
          <div className="chamber-member-profile-view__details">
            <p className="chamber-member-profile-view__lead">
              {display.specialtyLine}
            </p>
            <p className="chamber-member-profile-view__lead">
              {display.purposeStatement}
            </p>
            {display.specialties.length > 0 ? (
              <ul
                className="chamber-member-profile-view__specialties"
                aria-label="Specialties"
              >
                {display.specialties.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <section aria-label="Who they are">
              <h2 className="chamber-member-profile-view__section-title">
                Who they are
              </h2>
              <p className="chamber-member-profile-view__text">{member.bio}</p>
            </section>
            <section aria-label="How they can help">
              <h2 className="chamber-member-profile-view__section-title">
                How they can help
              </h2>
              <p className="chamber-member-profile-view__text">
                {member.howTheyHelp}
              </p>
            </section>
            <section aria-label="When to choose them">
              <h2 className="chamber-member-profile-view__section-title">
                When to choose them
              </h2>
              <p className="chamber-member-profile-view__text">
                Choose {member.displayName} when you want focused help with{" "}
                {member.specialty.toLowerCase()} — without juggling every other
                Chamber specialty at once.
              </p>
            </section>
            <section aria-label="Example questions">
              <h2 className="chamber-member-profile-view__section-title">
                Example questions
              </h2>
              <ul className="chamber-member-profile-view__examples">
                <li>What should I clarify before I decide?</li>
                <li>What is the simplest next step that still moves me forward?</li>
                <li>What am I overcomplicating here?</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <footer className="chamber-member-profile-view__footer">
        <button
          type="button"
          className="chamber-member-profile-view__talk"
          data-testid="chamber-member-profile-talk"
          onClick={() => onTalkWithMember(member)}
        >
          {chamberMemberTalkLabel(member)}
        </button>
        <button
          type="button"
          className="chamber-member-profile-view__return"
          data-testid="chamber-member-profile-return-gallery"
          onClick={onReturnToGallery}
        >
          Return to gallery
        </button>
      </footer>
    </section>
  );
}

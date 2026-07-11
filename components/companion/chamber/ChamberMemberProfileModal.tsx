"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef } from "react";
import type { ChamberMember } from "@/lib/chamber/chamberMemberRegistry";
import {
  chamberMemberTalkLabel,
  getChamberMemberCardDisplay,
} from "@/lib/chamber/chamberMemberCardDisplay";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  member: ChamberMember | null;
  open: boolean;
  onClose: () => void;
  onInvite: (member: ChamberMember) => void;
};

export function ChamberMemberProfileModal({
  member,
  open,
  onClose,
  onInvite,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const requestClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      requestClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, requestClose]);

  if (!open || !member) return null;

  const display = getChamberMemberCardDisplay(member);

  return (
    <div
      className="chamber-member-profile"
      data-testid="chamber-member-profile-modal"
      role="presentation"
    >
      <button
        type="button"
        className="chamber-member-profile__backdrop"
        aria-label="Close member profile"
        onClick={requestClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="chamber-member-profile__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="chamber-member-profile__header">
          <h2 id={titleId} className="chamber-member-profile__title">
            {member.displayName}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="chamber-member-profile__close"
            aria-label="Close"
            data-testid="chamber-member-profile-close"
            onClick={requestClose}
          >
            ×
          </button>
        </header>

        <div className="chamber-member-profile__body">
          <div className="chamber-member-profile__portrait">
            <Image
              src={member.cardImagePath}
              alt={member.displayName}
              className="chamber-member-profile__image"
              width={400}
              height={600}
              priority
            />
          </div>
          <div className="chamber-member-profile__details">
            <p className="chamber-member-profile__specialty">{member.specialty}</p>
            <p className="chamber-member-profile__bio">{display.specialtyLine}</p>
            <p className="chamber-member-profile__bio">{display.purposeStatement}</p>
            {display.specialties.length > 0 ? (
              <ul className="chamber-member-card__specialties" aria-label="Specialties">
                {display.specialties.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <p className="chamber-member-profile__bio">{member.bio}</p>
            <section
              className="chamber-member-profile__help"
              aria-label="How they can help"
            >
              <h3 className="chamber-member-profile__help-title">How they can help</h3>
              <p className="chamber-member-profile__help-text">{member.howTheyHelp}</p>
            </section>
          </div>
        </div>

        <footer className="chamber-member-profile__footer">
          <button
            type="button"
            className="chamber-member-profile__invite"
            data-testid="chamber-member-invite"
            onClick={() => onInvite(member)}
          >
            {chamberMemberTalkLabel(member)}
          </button>
          <button
            type="button"
            className="chamber-member-profile__return"
            data-testid="chamber-member-return"
            onClick={requestClose}
          >
            Return to Chamber
          </button>
        </footer>
      </div>
    </div>
  );
}

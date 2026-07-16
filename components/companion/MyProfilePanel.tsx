"use client";

import { useEffect, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { getPrefs, savePrefs } from "@/lib/companionStore";
import {
  profileDestinationBreadcrumb,
} from "@/lib/profile/profileDestination";
import {
  userProfileImageUrl,
  userProfileInitials,
} from "@/lib/userProfileDisplay";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import "@/app/companion/my-profile-panel.css";

type Props = {
  onClose: () => void;
  onOpenSettings?: (
    section?: "tone" | "plan" | "notifications" | "pattern",
  ) => void;
  onOpenExperienceControls?: () => void;
};

/**
 * My Profile — personal member information.
 * Distinct from My Business Estate (business info, including People I Help).
 */
export function MyProfilePanel({
  onClose,
  onOpenSettings,
  onOpenExperienceControls,
}: Props) {
  const { requestClose } = useDismissibleWindow({
    open: true,
    onClose,
  });
  const [name, setName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [email, setEmail] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const prefs = getPrefs();
      setName(prefs.name ?? "");
      setEmail(prefs.email ?? "");
      setPreferredName(
        prefs.preferredName?.trim() || prefs.name?.split(/\s+/)[0] || "",
      );
      setIntroduction(prefs.personalIntroduction ?? "");
      setImageUrl(userProfileImageUrl());
    };
    sync();
    window.addEventListener("companion-prefs-updated", sync);
    return () => window.removeEventListener("companion-prefs-updated", sync);
  }, []);

  const initials = userProfileInitials({
    preferredName,
    name,
    email,
  });

  function persistPersonal() {
    savePrefs({
      name: name.trim(),
      email: email.trim(),
      preferredName: preferredName.trim(),
      personalIntroduction: introduction.trim(),
    });
    setSavedHint("Saved for you.");
    window.setTimeout(() => setSavedHint(null), 2200);
  }

  return (
    <div
      className="my-profile-destination"
      data-testid="my-profile-destination"
      data-profile-destination="profile-personal"
    >
      <EstateWorkspace
        className="my-profile-panel"
        onDismissOutside={requestClose}
      >
        <button
          type="button"
          className="my-profile-panel__back"
          data-testid="my-profile-close"
          onClick={requestClose}
        >
          Close
        </button>

        <header className="my-profile-panel__header">
          <p className="estate-workspace__kicker">
            {profileDestinationBreadcrumb("profile-personal")}
          </p>
          <h1 className="estate-workspace__title">My Profile</h1>
          <p className="my-profile-panel__lead">
            Information about you — not your business, and not the people you
            help.
          </p>
        </header>

        <section
          className="my-profile-panel__identity"
          data-testid="my-profile-panel"
          aria-label="Personal identity"
        >
          <div className="my-profile-panel__avatar" aria-hidden>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="my-profile-panel__avatar-image"
              />
            ) : (
              <span className="my-profile-panel__avatar-initials">{initials}</span>
            )}
          </div>

          <label className="my-profile-panel__field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              data-testid="my-profile-name"
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </label>

          <label className="my-profile-panel__field">
            <span>Preferred name</span>
            <input
              type="text"
              value={preferredName}
              data-testid="my-profile-preferred-name"
              onChange={(event) => setPreferredName(event.target.value)}
              placeholder="What Shari should call you"
            />
          </label>

          <label className="my-profile-panel__field">
            <span>Short personal introduction</span>
            <textarea
              value={introduction}
              data-testid="my-profile-introduction"
              rows={3}
              onChange={(event) => setIntroduction(event.target.value)}
              placeholder="A few words about you — optional"
            />
          </label>

          <label className="my-profile-panel__field">
            <span>Account email</span>
            <input
              type="email"
              value={email}
              data-testid="my-profile-email"
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <div className="my-profile-panel__actions">
            <button
              type="button"
              className="my-profile-panel__primary"
              data-testid="my-profile-save"
              onClick={persistPersonal}
            >
              Save
            </button>
            {savedHint ? (
              <p className="my-profile-panel__saved" role="status">
                {savedHint}
              </p>
            ) : null}
          </div>
        </section>

        <section className="my-profile-panel__prefs" aria-label="Preferences">
          <h2 className="my-profile-panel__section-title">Preferences</h2>
          <p className="my-profile-panel__section-lead">
            Personal preferences stay here. Business details live in My Business
            Estate.
          </p>
          <button
            type="button"
            className="my-profile-panel__link"
            data-testid="my-profile-open-communication"
            onClick={() => onOpenSettings?.("tone")}
          >
            Communication preferences
          </button>
          <button
            type="button"
            className="my-profile-panel__link"
            data-testid="my-profile-open-accessibility"
            onClick={() => onOpenExperienceControls?.()}
          >
            Accessibility &amp; display
          </button>
          <button
            type="button"
            className="my-profile-panel__link"
            data-testid="my-profile-open-notifications"
            onClick={() => onOpenSettings?.("notifications")}
          >
            Notifications
          </button>
          <button
            type="button"
            className="my-profile-panel__link"
            data-testid="my-profile-open-pattern-awareness"
            onClick={() => onOpenSettings?.("pattern")}
          >
            Pattern Awareness
          </button>
        </section>
      </EstateWorkspace>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { processAvatarImage } from "@/lib/clientAvatarImage";
import { MyProfileRoomShell } from "@/components/companion/MyProfileRoomShell";
import { getPrefs, savePrefs } from "@/lib/companionStore";
import {
  clearProfilePersonalDraft,
  loadProfilePersonalDraft,
  saveProfilePersonalDraft,
} from "@/lib/profile/profilePersonalDraft";
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
  const [draftReady, setDraftReady] = useState(false);
  // Profile image upload — preview before saving; persisted via prefs.profileImage.
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      const draft = loadProfilePersonalDraft();
      const prefs = getPrefs();
      setName(draft?.name ?? prefs.name ?? "");
      setEmail(draft?.email ?? prefs.email ?? "");
      setPreferredName(
        draft?.preferredName ??
          (prefs.preferredName?.trim() ||
            prefs.name?.split(/\s+/)[0] ||
            ""),
      );
      setIntroduction(
        draft?.introduction ?? prefs.personalIntroduction ?? "",
      );
      setImageUrl(userProfileImageUrl());
      setDraftReady(true);
    };
    sync();
    window.addEventListener("companion-prefs-updated", sync);
    return () => window.removeEventListener("companion-prefs-updated", sync);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const prefs = getPrefs();
    const preferredFallback =
      prefs.preferredName?.trim() || prefs.name?.split(/\s+/)[0] || "";
    const matchesPrefs =
      name === (prefs.name ?? "") &&
      email === (prefs.email ?? "") &&
      preferredName === preferredFallback &&
      introduction === (prefs.personalIntroduction ?? "");
    if (matchesPrefs) {
      clearProfilePersonalDraft();
      return;
    }
    saveProfilePersonalDraft({
      name,
      preferredName,
      email,
      introduction,
    });
  }, [draftReady, name, preferredName, email, introduction]);

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
    clearProfilePersonalDraft();
    setSavedHint("Saved for you.");
    window.setTimeout(() => setSavedHint(null), 2200);
  }

  // Validate + downscale the chosen photo (reusing the shared image ingest),
  // then hold it as a preview until the member saves it.
  async function onChooseProfileImage(file: File) {
    setImageError(null);
    setImageBusy(true);
    try {
      const processed = await processAvatarImage(file);
      setPendingImage(processed);
    } catch (err) {
      setImageError(
        err instanceof Error
          ? err.message
          : "We couldn't process that image. Please try another one.",
      );
    } finally {
      setImageBusy(false);
    }
  }

  function saveProfileImage() {
    if (!pendingImage) return;
    savePrefs({ profileImage: pendingImage });
    setPendingImage(null);
    setSavedHint("Profile photo saved.");
    window.setTimeout(() => setSavedHint(null), 2200);
  }

  function cancelProfileImage() {
    setPendingImage(null);
    setImageError(null);
  }

  function removeProfileImage() {
    savePrefs({ profileImage: "" });
    setPendingImage(null);
    setImageError(null);
    setSavedHint("Profile photo removed.");
    window.setTimeout(() => setSavedHint(null), 2200);
  }

  return (
    <MyProfileRoomShell>
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
            <h1
              id="my-profile-heading"
              className="estate-workspace__title"
              tabIndex={-1}
            >
              My Profile
            </h1>
            <p className="my-profile-panel__lead">
              Information about you — not your business, and not the people
              you help.
            </p>
          </header>

          <section
            className="my-profile-panel__identity"
            data-testid="my-profile-panel"
            aria-label="Personal identity"
          >
            <div
              className="my-profile-panel__image-field"
              data-testid="profile-image-field"
            >
              <div className="my-profile-panel__avatar" aria-hidden>
                {pendingImage ?? imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(pendingImage ?? imageUrl) as string}
                    alt=""
                    className="my-profile-panel__avatar-image"
                    data-testid="profile-image-preview"
                  />
                ) : (
                  <span className="my-profile-panel__avatar-initials">
                    {initials}
                  </span>
                )}
              </div>
              <div className="my-profile-panel__image-controls">
                <p className="my-profile-panel__image-title">Your Profile Image</p>
                <p className="my-profile-panel__image-help">
                  Add a photo that represents you throughout Spark Estate.
                </p>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="my-profile-panel__image-input-hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onChooseProfileImage(file);
                    e.target.value = "";
                  }}
                />
                <div className="my-profile-panel__image-actions">
                  {pendingImage ? (
                    <>
                      <button
                        type="button"
                        className="my-profile-panel__image-btn my-profile-panel__image-btn--primary"
                        onClick={saveProfileImage}
                        data-testid="profile-image-save"
                      >
                        Save photo
                      </button>
                      <button
                        type="button"
                        className="my-profile-panel__image-btn"
                        onClick={cancelProfileImage}
                        data-testid="profile-image-cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="my-profile-panel__image-btn"
                        onClick={() => imageFileRef.current?.click()}
                        disabled={imageBusy}
                        data-testid="profile-image-choose"
                      >
                        {imageBusy
                          ? "Processing…"
                          : imageUrl
                            ? "Change Image"
                            : "Add Image"}
                      </button>
                      {imageUrl ? (
                        <button
                          type="button"
                          className="my-profile-panel__image-btn my-profile-panel__image-btn--danger"
                          onClick={removeProfileImage}
                          data-testid="profile-image-remove"
                        >
                          Remove Image
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
                {imageError ? (
                  <p
                    className="my-profile-panel__image-error"
                    role="alert"
                    data-testid="profile-image-error"
                  >
                    {imageError}
                  </p>
                ) : null}
              </div>
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

          <section
            className="my-profile-panel__prefs"
            aria-label="Preferences"
            data-profile-section="preferences"
          >
            <h2 className="my-profile-panel__section-title">Preferences</h2>
            <p className="my-profile-panel__section-lead">
              Personal preferences stay here. Business details live in My
              Business Estate.
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
    </MyProfileRoomShell>
  );
}

"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import type { AudioLink } from "@/lib/audioPlaylists";
import { MyPeacefulPlaceCard } from "./MyPeacefulPlaceCard";

type Props = {
  open: boolean;
  savedPlaces: AudioLink[];
  placeName: string;
  placeUrl: string;
  placeNote: string;
  saving: boolean;
  editingId: string | null;
  error: string | null;
  onPlaceNameChange: (value: string) => void;
  onPlaceUrlChange: (value: string) => void;
  onPlaceNoteChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onOpenPlace: (place: AudioLink) => void;
  onEditPlace: (place: AudioLink) => void;
  onDeletePlace: (place: AudioLink) => void;
};

export function MyPeacefulPlacesWorkspace({
  open,
  savedPlaces,
  placeName,
  placeUrl,
  placeNote,
  saving,
  editingId,
  error,
  onPlaceNameChange,
  onPlaceUrlChange,
  onPlaceNoteChange,
  onSave,
  onCancel,
  onOpenPlace,
  onEditPlace,
  onDeletePlace,
}: Props) {
  const titleId = useId();
  const canSave = Boolean(placeName.trim() && placeUrl.trim());

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="my-peaceful-places-workspace" role="presentation">
      <button
        type="button"
        className="my-peaceful-places-workspace__backdrop"
        aria-label="Close My Peaceful Places"
        onClick={onCancel}
      />
      <div
        className="my-peaceful-places-workspace__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="my-peaceful-places-workspace__header">
          <h2 id={titleId} className="my-peaceful-places-workspace__title">
            My Peaceful Places
          </h2>
          <p className="my-peaceful-places-workspace__lead">
            Save your favorite places so they&apos;re always just one click away.
          </p>
        </header>

        {savedPlaces.length > 0 ? (
          <div className="my-peaceful-places-workspace__collection">
            {savedPlaces.map((place) => (
              <MyPeacefulPlaceCard
                key={place.id}
                place={place}
                onOpen={() => onOpenPlace(place)}
                onEdit={() => onEditPlace(place)}
                onDelete={() => onDeletePlace(place)}
              />
            ))}
          </div>
        ) : null}

        <form
          className="my-peaceful-places-workspace__form"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave && !saving) onSave();
          }}
        >
          <label className="my-peaceful-places-workspace__field">
            <span className="my-peaceful-places-workspace__label">Place Name</span>
            <input
              type="text"
              value={placeName}
              onChange={(e) => onPlaceNameChange(e.target.value)}
              placeholder="Calm beach cam, fireplace, meditation page…"
              className="my-peaceful-places-workspace__input"
            />
          </label>

          <label className="my-peaceful-places-workspace__field">
            <span className="my-peaceful-places-workspace__label">Website / URL</span>
            <input
              type="url"
              value={placeUrl}
              onChange={(e) => onPlaceUrlChange(e.target.value)}
              placeholder="https://"
              className="my-peaceful-places-workspace__input"
              inputMode="url"
            />
          </label>

          <label className="my-peaceful-places-workspace__field">
            <span className="my-peaceful-places-workspace__label">
              Short Note <span className="my-peaceful-places-workspace__optional">optional</span>
            </span>
            <textarea
              value={placeNote}
              onChange={(e) => onPlaceNoteChange(e.target.value)}
              placeholder="Why this place helps me"
              rows={3}
              className="my-peaceful-places-workspace__textarea"
            />
          </label>

          {error ? (
            <p className="my-peaceful-places-workspace__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="my-peaceful-places-workspace__actions">
            <button
              type="submit"
              disabled={!canSave || saving}
              className="my-peaceful-places-workspace__save"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "+ Save Place"}
            </button>
            <button
              type="button"
              className="my-peaceful-places-workspace__cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

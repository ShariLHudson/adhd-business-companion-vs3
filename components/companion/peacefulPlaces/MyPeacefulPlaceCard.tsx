"use client";

import type { AudioLink } from "@/lib/audioPlaylists";

type Props = {
  place: AudioLink;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function MyPeacefulPlaceCard({ place, onOpen, onEdit, onDelete }: Props) {
  return (
    <article className="my-peaceful-place-card">
      <div className="my-peaceful-place-card__body">
        <h3 className="my-peaceful-place-card__name">{place.name}</h3>
        <p className="my-peaceful-place-card__url">{place.url}</p>
        {place.note?.trim() ? (
          <p className="my-peaceful-place-card__note">{place.note}</p>
        ) : null}
      </div>
      <div className="my-peaceful-place-card__actions">
        <button type="button" className="my-peaceful-place-card__btn" onClick={onOpen}>
          Open
        </button>
        <button type="button" className="my-peaceful-place-card__btn" onClick={onEdit}>
          Edit
        </button>
        <button
          type="button"
          className="my-peaceful-place-card__btn my-peaceful-place-card__btn--quiet"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

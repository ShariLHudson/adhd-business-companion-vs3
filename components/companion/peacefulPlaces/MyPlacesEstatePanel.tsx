"use client";

import type { ChangeEvent } from "react";
import type { AudioLink } from "@/lib/audioPlaylists";
import { HangingDestinationMenu } from "./HangingDestinationMenu";

type Props = {
  savedLinks: AudioLink[];
  myName: string;
  myUrl: string;
  myFileName: string | null;
  uploadError: string | null;
  saving: boolean;
  editingId: string | null;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSave: () => void;
  onSelectSaved: (link: AudioLink) => void;
};

export function MyPlacesEstatePanel({
  savedLinks,
  myName,
  myUrl,
  myFileName,
  uploadError,
  saving,
  editingId,
  onNameChange,
  onUrlChange,
  onFileChange,
  onSave,
  onSelectSaved,
}: Props) {
  const canSave = Boolean(myName.trim() && (myUrl.trim() || myFileName));

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    e.target.value = "";
  }

  return (
    <div className="my-places-estate-panel">
      <p className="my-places-estate-panel__lead">
        Save your own peaceful audio — upload a file or paste a link you love.
      </p>

      <div className="my-places-estate-panel__upload">
        <input
          value={myName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Name this place"
          className="my-places-estate-panel__input"
          aria-label="Place name"
        />
        <input
          value={myUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Paste a link (YouTube, MP3, Spotify…)"
          className="my-places-estate-panel__input"
          aria-label="Audio link"
        />
        <label className="my-places-estate-panel__file-label">
          <span className="my-places-estate-panel__file-btn">Upload audio file</span>
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm"
            className="my-places-estate-panel__file-input"
            onChange={handleFileInput}
          />
        </label>
        {myFileName ? (
          <p className="my-places-estate-panel__file-name" role="status">
            Ready to save: {myFileName}
          </p>
        ) : null}
        {uploadError ? (
          <p className="my-places-estate-panel__error" role="alert">
            {uploadError}
          </p>
        ) : null}
        <div className="my-places-estate-panel__actions">
          <button
            type="button"
            disabled={!canSave || saving}
            onClick={onSave}
            className="my-places-estate-panel__brass"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Save to My Places"}
          </button>
        </div>
      </div>

      {savedLinks.length > 0 ? (
        <>
          <p className="my-places-estate-panel__saved-label">Your saved places</p>
          <HangingDestinationMenu
            items={savedLinks.map((link) => ({
              id: link.id,
              name: link.name,
            }))}
            onSelect={(id) => {
              const link = savedLinks.find((item) => item.id === id);
              if (link) onSelectSaved(link);
            }}
          />
        </>
      ) : null}
    </div>
  );
}

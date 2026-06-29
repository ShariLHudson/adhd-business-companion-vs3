"use client";

import { useRef, useState } from "react";
import type { GrowthSectionId } from "@/lib/growthNavigation";
import { readFileAsAttachment, type GrowthAttachment } from "@/lib/growthAttachments";
import { createEvidenceEntry, EMPTY_EVIDENCE_DRAFT } from "@/lib/evidenceBankStore";
import { createJournalEntry } from "@/lib/growthJournalStore";
import { createPortfolioEntry } from "@/lib/growthPortfolioStore";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import {
  suggestGrowthStoryDestinations,
  type GrowthStoryDestinationId,
} from "@/lib/growthCapture/suggestStoryDestinations";

type Props = {
  onOpenSection: (section: GrowthSectionId) => void;
  onOpenAssetLibrary?: () => void;
  onWritingFocusChange?: (focused: boolean) => void;
};

const CAPTURE_CHIPS = [
  { id: "photo", label: "Photo" },
  { id: "voice", label: "Voice" },
  { id: "file", label: "Document" },
  { id: "thought", label: "Thought" },
  { id: "memory", label: "Memory" },
] as const;

export function GrowthHubCapture({
  onOpenSection,
  onOpenAssetLibrary,
  onWritingFocusChange,
}: Props) {
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<GrowthAttachment[]>([]);
  const [draftReady, setDraftReady] = useState(false);
  const [savedDestinations, setSavedDestinations] = useState<GrowthStoryDestinationId[]>(
    [],
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const trimmed = body.trim();
  const canKeep = trimmed.length > 0 || attachments.length > 0;
  const suggestion = draftReady ? suggestGrowthStoryDestinations(trimmed) : null;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setFileError(null);
    const next = [...attachments];
    for (const file of Array.from(files)) {
      const att = await readFileAsAttachment(file);
      if (!att) {
        setFileError("That file is a little large — try something under 2 MB.");
        continue;
      }
      next.push(att);
    }
    setAttachments(next);
  }

  function beginKeep() {
    if (!canKeep) return;
    setDraftReady(true);
    setSavedDestinations([]);
  }

  function saveTo(destination: GrowthStoryDestinationId) {
    const text = trimmed || attachments[0]?.name || "Something worth keeping.";
    const ts = new Date().toISOString();

    if (destination === "wins-this-week") {
      createSavedGrowthWin({
        whatHappened: text,
        ts,
        icon: "win",
        attachments,
      });
    } else if (destination === "evidence-bank") {
      createEvidenceEntry({
        ...EMPTY_EVIDENCE_DRAFT,
        whatHappened: text,
        whatThisProves: text,
        category: "Personal Growth",
        attachments,
      });
    } else if (destination === "growth-journal") {
      createJournalEntry({
        body: text,
        attachments,
      });
    } else if (destination === "growth-portfolio") {
      createPortfolioEntry({
        title: text.slice(0, 80) || "Creation",
        description: text,
        attachments,
      });
    }

    setSavedDestinations((prev) =>
      prev.includes(destination) ? prev : [...prev, destination],
    );
  }

  function reset() {
    setBody("");
    setAttachments([]);
    setDraftReady(false);
    setSavedDestinations([]);
    setFileError(null);
  }

  function handleChip(chipId: (typeof CAPTURE_CHIPS)[number]["id"]) {
    if (chipId === "thought" || chipId === "memory") return;
    if (chipId === "voice") {
      onOpenAssetLibrary?.();
      return;
    }
    if (chipId === "photo") {
      imageRef.current?.click();
      return;
    }
    fileRef.current?.click();
  }

  return (
    <section className="growth-story-capture" data-testid="growth-hub-capture">
      <p className="growth-story-capture__heading">
        What would you like to gather from today?
      </p>

      {!draftReady ? (
        <>
          <div className="growth-story-capture__notebook">
            <textarea
              className="growth-story-capture__textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => onWritingFocusChange?.(true)}
              onBlur={() => onWritingFocusChange?.(false)}
              placeholder="A thought, a feeling, something you noticed…"
              rows={8}
              aria-label="What would you like to gather from today?"
            />
            {attachments.length > 0 ? (
              <ul className="growth-story-capture__attachments">
                {attachments.map((att) => (
                  <li key={att.id}>{att.name}</li>
                ))}
              </ul>
            ) : null}
            {fileError ? (
              <p className="growth-story-capture__file-note">{fileError}</p>
            ) : null}
          </div>

          <div className="growth-story-capture__chips">
            {CAPTURE_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className="growth-story-capture__chip"
                onClick={() => handleChip(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="growth-story-capture__keep-wrap">
            <button
              type="button"
              className="growth-story-capture__keep"
              disabled={!canKeep}
              onClick={beginKeep}
            >
              Keep This Moment
            </button>
          </div>
        </>
      ) : (
        <div className="growth-story-capture__companion" data-testid="growth-hub-suggestion">
          <p className="growth-story-capture__companion-headline">
            {suggestion?.headline}
          </p>
          {trimmed ? (
            <p className="growth-story-capture__companion-quote">&ldquo;{trimmed}&rdquo;</p>
          ) : null}
          {suggestion && suggestion.recommendations.length > 0 ? (
            <>
              <p className="growth-story-capture__companion-lead">
                I&apos;d recommend saving it in:
              </p>
              <ul className="growth-story-capture__recommendations">
                {suggestion.recommendations.map((rec) => (
                  <li key={rec.id}>
                    <span className="growth-story-capture__rec-label">{rec.label}</span>
                    <span className="growth-story-capture__rec-reason">
                      because {rec.reason}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="growth-story-capture__companion-note">
                You can save it to one or both.
              </p>
              <div className="growth-story-capture__save-actions">
                {suggestion.recommendations.map((rec) => {
                  const saved = savedDestinations.includes(rec.id);
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      className="growth-story-capture__save-btn"
                      disabled={saved}
                      onClick={() => saveTo(rec.id)}
                    >
                      {saved ? `Saved to ${rec.label}` : `Save to ${rec.label}`}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="growth-story-capture__later"
                  onClick={() => {
                    if (savedDestinations.length > 0) {
                      onOpenSection(savedDestinations[0]);
                      reset();
                    } else {
                      reset();
                    }
                  }}
                >
                  {savedDestinations.length > 0 ? "Open where I saved it" : "Not right now"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        className="sr-only"
        multiple
        accept=".pdf,.doc,.docx,.txt,image/*"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <input
        ref={imageRef}
        type="file"
        className="sr-only"
        multiple
        accept="image/*"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </section>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import type { GrowthAttachment } from "@/lib/growthAttachments";
import { readFileAsAttachment } from "@/lib/growthAttachments";
import {
  createGrowthCapture,
  fileCaptureToDestination,
  suggestGrowthDestination,
  type GrowthCaptureItem,
  type GrowthPrimaryDestination,
} from "@/lib/growthCapture";
import { summarizeGrowthDerived } from "@/lib/growthDerived";
import { GrowthDestinationPlaques } from "@/components/companion/GrowthDestinationPlaques";
import { GrowthMicButton } from "@/components/companion/GrowthMicButton";
import "@/app/companion/growth-capture.css";

type Props = {
  embedded?: boolean;
  onBackToChat?: () => void;
  onExploreGallery?: () => void;
  onBrowseAssetLibrary?: () => void;
  onOpenSection?: (section: AppSection, nav: SidebarNavId) => void;
  onCaptureComplete?: () => void;
};

const DESTINATION_SECTION: Record<
  Exclude<GrowthPrimaryDestination, "uncategorized">,
  { section: AppSection; nav: SidebarNavId }
> = {
  "evidence-bank": { section: "evidence-bank", nav: "evidence-bank" },
  journal: { section: "growth-journal", nav: "journal" },
  portfolio: { section: "growth-portfolio", nav: "portfolio" },
};

export function GrowthUniversalCapture({
  embedded,
  onBackToChat,
  onExploreGallery,
  onBrowseAssetLibrary,
  onOpenSection,
  onCaptureComplete,
}: Props) {
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<GrowthAttachment[]>([]);
  const [saved, setSaved] = useState<GrowthCaptureItem | null>(null);
  const [filing, setFiling] = useState(false);
  const [filedMessage, setFiledMessage] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const derived = summarizeGrowthDerived();

  const canSave = body.trim().length > 0 || attachments.length > 0;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setFileError(null);
    const next = [...attachments];
    for (const file of Array.from(files)) {
      const att = await readFileAsAttachment(file);
      if (!att) {
        setFileError("File too large — max 2 MB per attachment.");
        continue;
      }
      next.push(att);
    }
    setAttachments(next);
  }

  const handleSave = useCallback(() => {
    if (!canSave) return;
    const item = createGrowthCapture({ body, attachments });
    setSaved(item);
    setFiledMessage(null);
    onCaptureComplete?.();
  }, [attachments, body, canSave, onCaptureComplete]);

  async function fileTo(destination: GrowthPrimaryDestination) {
    if (!saved || filing) return;
    setFiling(true);
    const result = fileCaptureToDestination(saved.id, destination);
    setFiling(false);
    if (!result.ok) {
      setFiledMessage(result.error ?? "Could not file this capture.");
      return;
    }
    if (destination === "uncategorized") {
      setFiledMessage("Saved — you can organize whenever you're ready.");
      resetDraft();
      return;
    }
    const label =
      destination === "evidence-bank"
        ? "Evidence Vault"
        : destination === "journal"
          ? "Journal"
          : "Portfolio";
    setFiledMessage(`Kept in your ${label}.`);
    resetDraft();
    const target = DESTINATION_SECTION[destination];
    onOpenSection?.(target.section, target.nav);
  }

  function resetDraft() {
    setBody("");
    setAttachments([]);
    setSaved(null);
  }

  const suggestion = saved
    ? suggestGrowthDestination(saved.body)
    : null;

  return (
    <div
      className={`growth-capture ${embedded ? "growth-capture--in-gallery" : ""}`}
      data-testid="growth-universal-capture"
    >
      {onBackToChat ? (
        <button
          type="button"
          className="growth-capture__back-chat"
          onClick={onBackToChat}
        >
          Back to chat
        </button>
      ) : null}

      <div className="growth-capture__inner">
        <p className="growth-capture__kicker">Asset Library</p>
        <h1 className="growth-capture__title">What&apos;s worth keeping?</h1>
        <p className="growth-capture__hint">
          Capture first — organize after. Nothing else is required.
        </p>

        {!saved ? (
          <div className="growth-capture__card growth-capture__card--with-mic">
            <GrowthMicButton
              value={body}
              onChange={setBody}
              className="journal-room__mic"
            />
            <textarea
              className="growth-capture__textarea"
              placeholder="A win, a reflection, something you made, proof it worked…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              aria-label="What's worth keeping"
            />
            {attachments.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-[#c9b9a4]">
                {attachments.map((att) => (
                  <li key={att.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{att.name}</span>
                    <button
                      type="button"
                      className="shrink-0 text-[#d4b87a] hover:underline"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {fileError ? (
              <p className="mt-2 text-xs text-[#e8a87c]">{fileError}</p>
            ) : null}
            <div className="growth-capture__actions">
              <input
                ref={fileRef}
                type="file"
                className="sr-only"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => void handleFiles(e.target.files)}
              />
              <button
                type="button"
                className="growth-capture__attach-btn"
                onClick={() => fileRef.current?.click()}
              >
                Attach file or image
              </button>
              <button
                type="button"
                className="growth-capture__save-btn"
                onClick={handleSave}
                disabled={!canSave}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="growth-capture__filing">
            <p className="growth-capture__suggestion">
              {suggestion?.reason ?? "Where should this live?"}
            </p>
            <GrowthDestinationPlaques
              suggested={saved.suggestedDestination}
              onSelect={(dest) => void fileTo(dest)}
              onLeaveUncategorized={() => void fileTo("uncategorized")}
              disabled={filing}
            />
          </div>
        )}

        {filedMessage ? (
          <div className="growth-capture__success" role="status">
            {filedMessage}
          </div>
        ) : null}

        {onBrowseAssetLibrary ? (
          <button
            type="button"
            className="growth-capture__explore"
            onClick={onBrowseAssetLibrary}
          >
            Browse Asset Library
          </button>
        ) : null}

        {onExploreGallery && !saved ? (
          <button
            type="button"
            className="growth-capture__explore"
            onClick={onExploreGallery}
          >
            Explore Growth rooms
          </button>
        ) : null}

        <div className="growth-capture__derived">
          <p className="growth-capture__derived-title">Your collections</p>
          <div className="growth-capture__derived-grid">
            <button
              type="button"
              className="growth-capture__derived-chip"
              onClick={() =>
                onOpenSection?.("wins-this-week", "growth")
              }
            >
              My Wins · {derived.winsCount}
            </button>
            <button
              type="button"
              className="growth-capture__derived-chip"
              onClick={() => onOpenSection?.("my-journey", "growth")}
            >
              Journey · {derived.journeyCount}
            </button>
            <button
              type="button"
              className="growth-capture__derived-chip"
              onClick={() =>
                onOpenSection?.("confidence-vault", "confidence-vault")
              }
            >
              Patterns &amp; Insights
              {derived.patternsReady ? "" : " · building"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

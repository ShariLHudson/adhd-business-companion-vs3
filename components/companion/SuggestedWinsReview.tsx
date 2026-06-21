"use client";

import { useMemo, useState } from "react";
import {
  CLASSIFICATION_LABELS,
  defaultDestinationsForClassification,
  ignoreSuggestedMoment,
  markSuggestedMomentProcessed,
  type GrowthMomentClassification,
  type SuggestedGrowthMoment,
} from "@/lib/suggestedGrowthMoments";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import type { GrowthAttachment } from "@/lib/growthAttachments";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";

export type SuggestedWinSavePayload = {
  whatHappened: string;
  sourceId: string;
  icon: string;
  classification: GrowthMomentClassification;
  attachments: GrowthAttachment[];
  destinations: {
    wins: boolean;
    evidence: boolean;
    confidence: boolean;
    journey: boolean;
  };
};

export function SuggestedWinsReview({
  moments,
  onSaved,
  onRouteEvidence,
  onRouteConfidence,
  onRouteJourney,
}: {
  moments: SuggestedGrowthMoment[];
  onSaved: () => void;
  onRouteEvidence: (whatHappened: string, sourceId: string) => void;
  onRouteConfidence: (whatHappened: string) => void;
  onRouteJourney: (whatHappened: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editAttachments, setEditAttachments] = useState<GrowthAttachment[]>([]);
  const [destinations, setDestinations] = useState({
    wins: true,
    evidence: false,
    confidence: false,
    journey: false,
  });

  const editing = useMemo(
    () => moments.find((m) => m.id === editingId) ?? null,
    [moments, editingId],
  );

  function startEdit(moment: SuggestedGrowthMoment) {
    setEditingId(moment.id);
    setEditText(moment.whatHappened);
    setEditAttachments([]);
    setDestinations(defaultDestinationsForClassification(moment.classification));
  }

  function toggleDestination(key: keyof typeof destinations) {
    setDestinations((d) => ({ ...d, [key]: !d[key] }));
  }

  function handleSave(moment: SuggestedGrowthMoment) {
    const text = editingId === moment.id ? editText.trim() : moment.whatHappened;
    if (!text) return;
    const dest =
      editingId === moment.id
        ? destinations
        : defaultDestinationsForClassification(moment.classification);
    const attachments = editingId === moment.id ? editAttachments : [];

    if (dest.wins) {
      createSavedGrowthWin({
        whatHappened: text,
        ts: moment.ts,
        icon: moment.icon,
        sourceId: moment.sourceId,
        classification: moment.classification,
        attachments,
      });
    }
    if (dest.evidence) onRouteEvidence(text, moment.sourceId);
    if (dest.confidence) onRouteConfidence(text);
    if (dest.journey) onRouteJourney(text);

    markSuggestedMomentProcessed(moment.sourceId);
    setEditingId(null);
    setEditText("");
    setEditAttachments([]);
    onSaved();
  }

  function handleIgnore(moment: SuggestedGrowthMoment) {
    ignoreSuggestedMoment(moment.sourceId);
    if (editingId === moment.id) setEditingId(null);
    onSaved();
  }

  if (moments.length === 0) return null;

  return (
    <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-[#faf7f2] p-5">
      <h3 className="text-sm font-bold text-[#2f261f]">Suggested Wins</h3>
      <p className="mt-1 text-xs text-[#6f6259]">
        Not everything is a win — review meaningful moments and choose where they belong.
      </p>
      <ul className="mt-3 space-y-3">
        {moments.map((moment) => {
          const isEditing = editingId === moment.id;
          return (
            <li
              key={moment.id}
              className="rounded-2xl border border-[#e7d9c8] bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-[#faf7f2] px-2 py-0.5 font-semibold text-[#6f6259]">
                  {CLASSIFICATION_LABELS[moment.classification]}
                </span>
              </div>
              <div className="mt-2 flex items-start gap-2 text-sm text-[#2f261f]">
                <span aria-hidden="true">{moment.icon}</span>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={INPUT_CLASS}
                  />
                ) : (
                  <span>{moment.whatHappened}</span>
                )}
              </div>

              {isEditing ? (
                <div className="mt-3 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                    Save to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["wins", "Wins This Week"],
                        ["evidence", "Evidence Bank"],
                        ["confidence", "My Highlights"],
                        ["journey", "My Journey"],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1 text-xs font-semibold text-[#2f261f]"
                      >
                        <input
                          type="checkbox"
                          checked={destinations[key]}
                          onChange={() => toggleDestination(key)}
                          className="accent-[#2f261f]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <GrowthAttachmentsField
                    attachments={editAttachments}
                    onAttachmentsChange={setEditAttachments}
                  />
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSave(moment)}
                  className="rounded-full bg-[#2f261f] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() =>
                    isEditing ? setEditingId(null) : startEdit(moment)
                  }
                  className="rounded-full border border-[#e7d9c8] px-3 py-1.5 text-xs font-semibold text-[#2f261f]"
                >
                  {isEditing ? "Cancel edit" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => handleIgnore(moment)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#9a8f82]"
                >
                  Ignore
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

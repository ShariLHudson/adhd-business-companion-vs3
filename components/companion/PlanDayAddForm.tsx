"use client";

import { useState } from "react";
import {
  type QuickPlanItemInput,
  type PlanItemColumn,
  KANBAN_COLUMNS,
} from "@/lib/planMyDay";
import { PlanDayLifeAreaSelector } from "@/components/companion/PlanDayLifeAreaSelector";
import {
  FormVoiceEntryControl,
  applyFormVoiceTranscript,
} from "@/components/companion/FormVoiceEntryControl";

const FIELD =
  "rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

const ADDABLE_COLUMNS = KANBAN_COLUMNS.filter(
  (col) => col.id === "ready" || col.id === "today" || col.id === "doing",
);

type Props = {
  onAdd: (input: QuickPlanItemInput) => void;
  compact?: boolean;
  /** Spark-suggested day area — member can still change it. */
  suggestedColumn?: Extract<PlanItemColumn, "ready" | "today" | "doing">;
};

export function PlanDayAddForm({
  onAdd,
  compact = false,
  suggestedColumn = "ready",
}: Props) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [lifeAreaId, setLifeAreaId] = useState<string | null>(null);
  const [column, setColumn] = useState<
    Extract<PlanItemColumn, "ready" | "today" | "doing">
  >(suggestedColumn);
  const [hasTime, setHasTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>("title");
  const [showDetails, setShowDetails] = useState(false);

  function reset() {
    setTitle("");
    setNotes("");
    setLifeAreaId(null);
    setColumn(suggestedColumn);
    setHasTime(false);
    setStartTime("09:00");
    setShowDetails(false);
    setActiveFieldKey("title");
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      notes: notes.trim() || undefined,
      lifeAreaId: lifeAreaId ?? "auto",
      column,
      source: "manual",
      startTime: hasTime ? startTime : undefined,
    });
    reset();
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/60 p-4"
      data-testid="plan-day-add-form"
    >
      <div>
        <p className="text-base font-semibold text-[#1f1c19]">
          Add something for today
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">
          One thing at a time — you choose where it belongs.
        </p>
      </div>

      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (!e.target.value.trim()) setLifeAreaId(null);
        }}
        onFocus={() => setActiveFieldKey("title")}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Type or use voice to add one thing."
        aria-label="Add something for today"
        className={`${FIELD} w-full text-base py-2.5`}
        data-testid="plan-day-add-title"
      />

      <FormVoiceEntryControl
        activeFieldKey={activeFieldKey}
        activeFieldLabel={
          activeFieldKey === "notes" ? "Details" : "Add something for today"
        }
        onTranscript={(fieldKey, spoken) => {
          if (fieldKey === "notes") {
            setNotes((prev) => applyFormVoiceTranscript(prev, spoken));
            return;
          }
          setTitle((prev) => applyFormVoiceTranscript(prev, spoken));
        }}
        micTitle="Add with voice"
      />

      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Add to
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Day area">
          {ADDABLE_COLUMNS.map((col) => (
            <button
              key={col.id}
              type="button"
              role="radio"
              aria-checked={column === col.id}
              onClick={() =>
                setColumn(col.id as Extract<PlanItemColumn, "ready" | "today" | "doing">)
              }
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                column === col.id
                  ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                  : "border-[#c9bfb0] bg-white text-[#4b463f] hover:border-[#1e4f4f]/40"
              }`}
              data-testid={`plan-day-add-column-${col.id}`}
            >
              {col.label}
            </button>
          ))}
        </div>
        {column !== suggestedColumn ? null : (
          <p className="mt-2 text-xs text-[#6b635a]">
            Suggested: {ADDABLE_COLUMNS.find((c) => c.id === suggestedColumn)?.label}
          </p>
        )}
      </fieldset>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
        aria-expanded={showDetails}
      >
        {showDetails ? "Hide details" : "Optional details"}
      </button>

      {showDetails ? (
        <>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onFocus={() => setActiveFieldKey("notes")}
            rows={2}
            placeholder="Optional details"
            aria-label="Optional details"
            className={`${FIELD} w-full`}
          />

          <PlanDayLifeAreaSelector
            taskText={title}
            value={lifeAreaId}
            onChange={setLifeAreaId}
            compact={compact}
          />

          <div
            className={`flex flex-wrap gap-2 ${compact ? "flex-col sm:flex-row sm:items-center" : "items-center"}`}
          >
            <label className="flex items-center gap-2 text-base font-semibold text-[#6b635a]">
              <input
                type="checkbox"
                checked={hasTime}
                onChange={(e) => setHasTime(e.target.checked)}
                className="h-4 w-4 accent-[#1e4f4f]"
              />
              Specific time
            </label>

            {hasTime ? (
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={FIELD}
                aria-label="Time"
              />
            ) : null}
          </div>
        </>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={!title.trim()}
        className="companion-btn-primary w-full rounded-xl px-5 py-3 text-base font-semibold disabled:opacity-40 sm:w-auto sm:self-end"
        data-testid="plan-day-add-submit"
      >
        Add to today
      </button>
    </div>
  );
}

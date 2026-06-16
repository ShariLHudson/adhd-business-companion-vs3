"use client";

import { useEffect, useState } from "react";
import {
  getDayState,
  saveDayState,
  type DayLevel,
  type DayState,
} from "@/lib/companionStore";
import {
  DAY_HELP_OTHER,
  formatDayFeeling,
  formatDayHelpDisplay,
  formatDayNoteDisplay,
  formatDaySnapshotTime,
  normalizeDayHelpNeed,
} from "@/lib/adjustMyDay";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { HelpNeedDropdown } from "@/components/companion/HelpNeedDropdown";

const LEVELS: DayLevel[] = ["low", "medium", "high"];

type PanelMode = "snapshot" | "edit";

export function AdjustMyDayPanel({ onDone }: { onDone?: () => void }) {
  const [mode, setMode] = useState<PanelMode>("edit");
  const [snapshot, setSnapshot] = useState<DayState | null>(null);

  const [energy, setEnergy] = useState<DayLevel>("medium");
  const [overwhelm, setOverwhelm] = useState<DayLevel>("low");
  const [helpNeed, setHelpNeed] = useState("");
  const [otherNeed, setOtherNeed] = useState("");
  const [note, setNote] = useState("");

  const [energyTouched, setEnergyTouched] = useState(false);
  const [overwhelmTouched, setOverwhelmTouched] = useState(false);

  function loadFromState(existing: DayState) {
    setEnergy(existing.energy);
    setOverwhelm(existing.overwhelm);
    const first = existing.needs[0];
    const { selection, otherText } = normalizeDayHelpNeed(first);
    setHelpNeed(selection);
    setOtherNeed(otherText);
    setNote(existing.note ?? "");
    setEnergyTouched(true);
    setOverwhelmTouched(true);
    setSnapshot(existing);
  }

  useEffect(() => {
    const existing = getDayState();
    if (existing) {
      loadFromState(existing);
      setMode("snapshot");
    }
  }, []);

  function startEdit() {
    const existing = getDayState();
    if (existing) loadFromState(existing);
    setMode("edit");
  }

  function buildNeeds(): string[] {
    if (helpNeed === DAY_HELP_OTHER) {
      const custom = otherNeed.trim();
      return custom ? [custom] : [];
    }
    return helpNeed ? [helpNeed] : [];
  }

  const canSave =
    energyTouched &&
    overwhelmTouched &&
    (helpNeed === DAY_HELP_OTHER ? otherNeed.trim().length > 0 : Boolean(helpNeed));

  function saveDay() {
    const state = saveDayState({
      energy,
      overwhelm,
      needs: buildNeeds(),
      note: note.trim() || undefined,
    });
    setSnapshot(state);
    setMode("snapshot");
  }

  const levelBtn = (active: boolean) =>
    `flex-1 rounded-xl border px-3 py-2.5 text-base font-semibold capitalize transition-colors ${
      active
        ? "border-[#1e4f4f] bg-[#1e4f4f] text-white shadow-sm"
        : "border-[#c9bfb0] bg-white/80 text-[#3d3630] hover:bg-white"
    }`;

  if (mode === "snapshot" && snapshot) {
    const updated = formatDaySnapshotTime(snapshot);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <WorkspaceGuide section="energy" />
        <p className="text-2xl font-semibold text-[#1f1c19]">Adjust My Day</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Shari uses your latest update — change it anytime life shifts.
          {updated ? ` Last updated ${updated}.` : ""}
        </p>

        <div className="mt-6 rounded-2xl border border-[#e7dfd4] bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Current Day Snapshot
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-[#1f1c19]">
                How are you feeling today?
              </p>
              <p className="mt-1 text-base text-[#3d3630]">
                {formatDayFeeling(snapshot)}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f1c19]">
                What would help right now?
              </p>
              <p className="mt-1 text-base text-[#3d3630]">
                {formatDayHelpDisplay(snapshot)}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f1c19]">
                Anything else going on?
              </p>
              <p className="mt-1 text-base text-[#3d3630] whitespace-pre-wrap">
                {formatDayNoteDisplay(snapshot)}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={startEdit}
          className="mt-6 w-full rounded-xl bg-[#1e4f4f] px-8 py-3.5 text-lg font-semibold text-white shadow-md hover:bg-[#163a3a]"
        >
          Update My Day
        </button>

        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="mt-3 w-full rounded-xl border border-[#c9bfb0] bg-white px-8 py-3 text-base font-semibold text-[#3d3630] hover:bg-[#faf8f5]"
          >
            Back to chat
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <WorkspaceGuide section="energy" />
      <p className="text-2xl font-semibold text-[#1f1c19]">
        How are you feeling today?
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Quick check-in — update anytime your day changes.
      </p>

      <p className="mt-6 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Energy
      </p>
      <div className="mt-2 flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setEnergy(l);
              setEnergyTouched(true);
            }}
            className={levelBtn(energy === l && energyTouched)}
          >
            {l}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Overwhelm
      </p>
      <div className="mt-2 flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setOverwhelm(l);
              setOverwhelmTouched(true);
            }}
            className={levelBtn(overwhelm === l && overwhelmTouched)}
          >
            {l}
          </button>
        ))}
      </div>

      <p className="mt-7 text-lg font-semibold text-[#1f1c19]">
        What would help right now?
      </p>
      <HelpNeedDropdown
        className="mt-2"
        value={helpNeed}
        onChange={(v) => {
          setHelpNeed(v);
          if (v !== DAY_HELP_OTHER) setOtherNeed("");
        }}
      />
      {helpNeed === DAY_HELP_OTHER ? (
        <input
          value={otherNeed}
          onChange={(e) => setOtherNeed(e.target.value)}
          placeholder="Tell me what you need…"
          className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
      ) : null}

      <p className="mt-7 text-lg font-semibold text-[#1f1c19]">
        Anything else going on?
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Share anything you&apos;d like me to know. Optional.
      </p>
      <VoiceAnswerField
        value={note}
        onChange={setNote}
        placeholder={`"I'm overwhelmed." "My knee hurts." "I have a sales call later."`}
        className="mt-2"
        inputClassName="min-h-[100px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
      />

      <button
        type="button"
        onClick={saveDay}
        disabled={!canSave}
        className="mt-6 w-full rounded-xl bg-[#1e4f4f] px-8 py-3.5 text-lg font-semibold text-white shadow-md hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {snapshot ? "Save My Day" : "Set My Day"}
      </button>

      {snapshot ? (
        <button
          type="button"
          onClick={() => setMode("snapshot")}
          className="mt-3 w-full rounded-xl border border-[#c9bfb0] bg-white px-8 py-3 text-base font-semibold text-[#3d3630] hover:bg-[#faf8f5]"
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
}

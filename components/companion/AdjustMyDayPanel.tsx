"use client";

import { useEffect, useState } from "react";
import {
  getDayState,
  saveDayState,
  type DayEnergyLevelId,
  type DayMotivationLevelId,
  type DayState,
  type DayVibeId,
} from "@/lib/companionStore";
import {
  DAY_ENERGY_LEVELS,
  DAY_HELP_OTHER,
  DAY_MOTIVATION_LEVELS,
  DAY_VIBES,
  formatDayEnergyDisplay,
  formatDayHelpDisplay,
  formatDayMotivationDisplay,
  formatDayNoteDisplay,
  formatDaySnapshotTime,
  formatDayVibeDisplay,
  normalizeDayHelpNeed,
} from "@/lib/adjustMyDay";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { HelpNeedDropdown } from "@/components/companion/HelpNeedDropdown";

type PanelMode = "snapshot" | "edit";

const selectClass =
  "mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-lg text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

export function AdjustMyDayPanel({
  onDone,
  embedded = false,
  initialMode = "edit",
}: {
  onDone?: () => void;
  /** Render inside Plan My Day without full-page chrome. */
  embedded?: boolean;
  initialMode?: PanelMode;
}) {
  const [mode, setMode] = useState<PanelMode>(initialMode);
  const [snapshot, setSnapshot] = useState<DayState | null>(null);

  const [vibe, setVibe] = useState<DayVibeId | null>(null);
  const [energyLevel, setEnergyLevel] = useState<DayEnergyLevelId | "">("");
  const [motivationLevel, setMotivationLevel] = useState<DayMotivationLevelId | "">("");
  const [helpNeed, setHelpNeed] = useState("");
  const [otherNeed, setOtherNeed] = useState("");
  const [note, setNote] = useState("");

  function loadFromState(existing: DayState) {
    setVibe(existing.vibe ?? null);
    setEnergyLevel(existing.energyLevel ?? "doing-okay");
    setMotivationLevel(existing.motivationLevel ?? "get-it-done");
    const first = existing.needs[0];
    const { selection, otherText } = normalizeDayHelpNeed(first);
    setHelpNeed(selection);
    setOtherNeed(otherText);
    setNote(existing.note ?? "");
    setSnapshot(existing);
  }

  useEffect(() => {
    const existing = getDayState();
    if (existing) {
      loadFromState(existing);
      setMode(initialMode === "edit" ? "edit" : "snapshot");
    }
  }, [initialMode]);

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
    Boolean(energyLevel) &&
    Boolean(motivationLevel) &&
    (helpNeed === DAY_HELP_OTHER ? otherNeed.trim().length > 0 : Boolean(helpNeed));

  function saveDay() {
    if (!energyLevel || !motivationLevel) return;
    const state = saveDayState({
      energyLevel,
      motivationLevel,
      vibe: vibe ?? undefined,
      needs: buildNeeds(),
      note: note.trim() || undefined,
    });
    setSnapshot(state);
    if (embedded) {
      onDone?.();
    } else {
      setMode("snapshot");
    }
  }

  const vibeChip = (id: DayVibeId, label: string) => {
    const active = vibe === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => setVibe(active ? null : id)}
        className={`rounded-full border px-3 py-2 text-base font-semibold transition-colors ${
          active
            ? "border-[#1e4f4f] bg-[#1e4f4f] text-white shadow-sm"
            : "border-[#c9bfb0] bg-white/80 text-[#3d3630] hover:bg-white"
        }`}
      >
        {label}
      </button>
    );
  };

  const shellClass = embedded
    ? "companion-fade-in flex flex-col"
    : "companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8";

  if (mode === "snapshot" && snapshot && !embedded) {
    const updated = formatDaySnapshotTime(snapshot);
    const vibeDisplay = formatDayVibeDisplay(snapshot);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <WorkspaceGuide section="energy" />
        <p className="text-2xl font-semibold text-[#1f1c19]">Adapt My Day</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Current Reality Intelligence™ — who showed up today? Shari uses your
          latest update when shaping support.
          {updated ? ` Last updated ${updated}.` : ""}
        </p>

        <div className="mt-6 rounded-2xl border border-[#e7dfd4] bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Current Day Snapshot
          </p>

          <div className="mt-4 space-y-4">
            {snapshot.vibe ? (
              <div>
                <p className="text-sm font-semibold text-[#1f1c19]">Today&apos;s vibe</p>
                <p className="mt-1 text-base text-[#3d3630]">{vibeDisplay}</p>
              </div>
            ) : null}
            <div>
              <p className="text-sm font-semibold text-[#1f1c19]">Energy level</p>
              <p className="mt-1 text-base text-[#3d3630]">
                {formatDayEnergyDisplay(snapshot)}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f1c19]">Motivation level</p>
              <p className="mt-1 text-base text-[#3d3630]">
                {formatDayMotivationDisplay(snapshot)}
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
              <p className="mt-1 whitespace-pre-wrap text-base text-[#3d3630]">
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
    <div className={shellClass}>
      {!embedded ? <WorkspaceGuide section="energy" /> : null}
      <p className="text-2xl font-semibold text-[#1f1c19]">Adapt My Day</p>
      <p className="mt-1 text-base leading-relaxed text-[#6b635a]">
        Current Reality Intelligence™ — who showed up today?
      </p>
      <p className="mt-2 text-base leading-relaxed text-[#9a8f82]">
        Your day can change. Update this anytime.
      </p>

      <p className="mt-6 text-sm font-semibold text-[#1f1c19]">
        Today&apos;s vibe? <span className="font-normal text-[#6b635a]">(optional)</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DAY_VIBES.map((v) => vibeChip(v.id, v.label))}
      </div>

      <label className="mt-6 block">
        <span className="text-lg font-semibold text-[#1f1c19]">Energy Level</span>
        <span className="mt-0.5 block text-base text-[#6b635a]">
          How much fuel is in the tank today?
        </span>
        <select
          value={energyLevel}
          onChange={(e) => setEnergyLevel(e.target.value as DayEnergyLevelId)}
          className={selectClass}
        >
          <option value="">Select energy level…</option>
          {DAY_ENERGY_LEVELS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-5 block">
        <span className="text-lg font-semibold text-[#1f1c19]">Motivation Level</span>
        <span className="mt-0.5 block text-base text-[#6b635a]">
          How much do you feel like doing things today?
        </span>
        <select
          value={motivationLevel}
          onChange={(e) => setMotivationLevel(e.target.value as DayMotivationLevelId)}
          className={selectClass}
        >
          <option value="">Select motivation level…</option>
          {DAY_MOTIVATION_LEVELS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-6 text-lg font-semibold text-[#1f1c19]">
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
        <VoiceAnswerField
          value={otherNeed}
          onChange={setOtherNeed}
          placeholder="Tell me what you need…"
          className="mt-2"
          inputClassName="min-h-[80px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
      ) : null}

      <p className="mt-6 text-lg font-semibold text-[#1f1c19]">
        Anything else going on?
      </p>
      <VoiceAnswerField
        value={note}
        onChange={setNote}
        placeholder="Health, family, business, emotions, wins, frustrations, lack of sleep, exciting news... anything you'd like me to know."
        className="mt-2"
        inputClassName="min-h-[120px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
      />

      <button
        type="button"
        onClick={saveDay}
        disabled={!canSave}
        className="mt-6 w-full rounded-xl bg-[#1e4f4f] px-8 py-3.5 text-lg font-semibold text-white shadow-md hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Update My Day
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

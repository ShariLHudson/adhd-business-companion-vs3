"use client";

import { useEffect, useState } from "react";
import {
  getDayState,
  saveDayState,
  type DayLevel,
  type DayState,
} from "@/lib/companionStore";

const LEVELS: DayLevel[] = ["low", "medium", "high"];
const NEEDS = [
  "Focus",
  "Calm",
  "Structure",
  "Clarity",
  "Support",
  "Motivation",
  "Just Start",
];

export function AdjustMyDayPanel({ onDone }: { onDone?: () => void }) {
  const [energy, setEnergy] = useState<DayLevel>("medium");
  const [overwhelm, setOverwhelm] = useState<DayLevel>("low");
  const [needs, setNeeds] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [note, setNote] = useState("");

  // Progressive reveal — one decision per layer.
  const [energyTouched, setEnergyTouched] = useState(false);
  const [overwhelmTouched, setOverwhelmTouched] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getDayState();
    if (existing) {
      setEnergy(existing.energy);
      setOverwhelm(existing.overwhelm);
      setNeeds(existing.needs.filter((n) => NEEDS.includes(n)));
      const custom = existing.needs.find((n) => !NEEDS.includes(n));
      if (custom) {
        setOther(custom);
        setShowOther(true);
      }
      if (existing.note) {
        setNote(existing.note);
        setShowNote(true);
      }
      // Already set before — reveal everything for quick editing.
      setEnergyTouched(true);
      setOverwhelmTouched(true);
      setSaved(true);
    }
  }, []);

  const layer2 = energyTouched && overwhelmTouched;

  function toggleNeed(n: string) {
    setNeeds((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );
  }

  function setDay() {
    const allNeeds = [...needs];
    if (other.trim()) allNeeds.push(other.trim());
    saveDayState({
      energy,
      overwhelm,
      needs: allNeeds,
      note: note.trim() || undefined,
    });
    onDone?.();
  }

  const levelBtn = (active: boolean) =>
    `flex-1 rounded-xl border px-3 py-2.5 text-base font-semibold capitalize transition-colors ${
      active
        ? "border-[#1e4f4f] bg-[#1e4f4f] text-white shadow-sm"
        : "border-[#c9bfb0] bg-white/80 text-[#3d3630] hover:bg-white"
    }`;

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <p className="text-2xl font-semibold text-[#1f1c19]">
        How is your brain today?
      </p>
      {saved && (
        <p className="mt-1 text-sm text-[#6b635a]">
          Shari is tuned to this until you change it.
        </p>
      )}

      {/* Layer 1 — Energy + Overwhelm */}
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

      {/* Layer 2 — appears once both are set */}
      {layer2 && (
        <div className="companion-fade-in">
          <p className="mt-7 text-lg font-semibold text-[#1f1c19]">
            What would help right now?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NEEDS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => toggleNeed(n)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  needs.includes(n)
                    ? "bg-[#1e4f4f] text-white shadow-sm"
                    : "bg-white/80 text-[#3d3630] hover:bg-white"
                }`}
              >
                {n}
              </button>
            ))}
            {!showOther && (
              <button
                type="button"
                onClick={() => setShowOther(true)}
                className="rounded-full border border-dashed border-[#c9bfb0] px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-white"
              >
                + Other
              </button>
            )}
          </div>
          {showOther && (
            <input
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="Something else…"
              autoFocus
              className="companion-fade-in mt-3 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
          )}

          {/* Layer 3 — optional note + final action, only after a need is
              chosen. Each answer unlocks the next layer. */}
          {(needs.length > 0 || other.trim()) && (
            <div className="companion-fade-in">
              <p className="mt-7 text-lg font-semibold text-[#1f1c19]">
                Anything else going on?
              </p>
              {!showNote ? (
                <button
                  type="button"
                  onClick={() => setShowNote(true)}
                  className="mt-2 text-sm font-semibold text-[#1e4f4f]"
                >
                  + Add a note (optional)
                </button>
              ) : (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything you want Shari to keep in mind today…"
                  autoFocus
                  className="companion-fade-in mt-2 min-h-[90px] w-full resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                />
              )}

              <button
                type="button"
                onClick={setDay}
                className="mt-6 w-full rounded-xl bg-[#1e4f4f] px-8 py-3.5 text-lg font-semibold text-white shadow-md hover:bg-[#163a3a]"
              >
                Set My Day
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

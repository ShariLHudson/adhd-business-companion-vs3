"use client";

import { useEffect, useMemo, useState } from "react";
import {
  classifyTaskLifeArea,
  confirmLifeAreaForTask,
  getAllLifeAreas,
} from "@/lib/planMyDay/lifeAreaBridge";
import {
  createUserLifeArea,
  readRecentLifeAreaIds,
} from "@/lib/companionBrain/lifeAreas";
import type { LifeAreaClassificationResult } from "@/lib/companionBrain/lifeAreas/types";
import { CreateLifeAreaForm } from "@/components/companion/CreateLifeAreaForm";

type Props = {
  taskText: string;
  value: string | null;
  onChange: (lifeAreaId: string | null) => void;
  compact?: boolean;
};

const FIELD =
  "rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

export function PlanDayLifeAreaSelector({
  taskText,
  value,
  onChange,
  compact = false,
}: Props) {
  const [classification, setClassification] =
    useState<LifeAreaClassificationResult | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [kept, setKept] = useState(false);

  const allAreas = useMemo(() => getAllLifeAreas(), []);
  const recentIds = useMemo(() => readRecentLifeAreaIds(), [value, kept]);

  useEffect(() => {
    const trimmed = taskText.trim();
    if (!trimmed) {
      setClassification(null);
      setKept(false);
      return;
    }
    if (value) {
      const area = allAreas.find((a) => a.id === value);
      if (area) {
        setClassification({
          primaryLifeAreaId: area.id,
          primaryLifeAreaName: area.name,
          secondaryLifeAreaIds: [],
          confidence: 1,
          matchedSignals: ["chosen by you"],
          alternateSuggestions: [],
          needsConfirmation: false,
        });
      }
      return;
    }
    const timer = window.setTimeout(() => {
      setClassification(classifyTaskLifeArea(trimmed));
      setKept(false);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [taskText, value, allAreas]);

  const detected = classification && !value && !kept;
  const showDetected = detected && !classification.needsConfirmation;
  const showUncertain = detected && classification.needsConfirmation;

  const filteredAreas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allAreas;
    return allAreas.filter((a) => a.name.toLowerCase().includes(q));
  }, [allAreas, search]);

  const recentAreas = recentIds
    .map((id) => allAreas.find((a) => a.id === id))
    .filter(Boolean);

  const suggestedAreas = classification?.alternateSuggestions
    .map((s) => allAreas.find((a) => a.id === s.lifeAreaId))
    .filter(Boolean) ?? [];

  function pickLifeArea(lifeAreaId: string, learn = false) {
    if (learn && taskText.trim()) {
      confirmLifeAreaForTask(taskText, lifeAreaId);
    }
    onChange(lifeAreaId);
    setChoosing(false);
    setCreating(false);
    setKept(true);
  }

  function handleKeep() {
    if (!classification) return;
    pickLifeArea(classification.primaryLifeAreaId, true);
  }

  if (!taskText.trim()) {
    return (
      <p className="text-sm text-[#9a8f82]">
        Life Area appears when you enter a task — Shari will suggest where it
        belongs.
      </p>
    );
  }

  return (
    <div
      className="flex flex-col gap-3"
      data-testid="plan-day-life-area-selector"
    >
      <span className="text-base font-semibold text-[#6b635a]">Life Area</span>

      {(showDetected || (value && classification)) && !choosing ? (
        <div
          className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
          data-testid="plan-day-life-area-detected"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            🤖 Auto-detected
          </p>
          <p className="mt-1 text-lg font-semibold text-[#1f1c19]">
            {classification?.primaryLifeAreaName}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleKeep}
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              data-testid="plan-day-life-area-keep"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={() => setChoosing(true)}
              className="rounded-lg border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f5f0ea]"
              data-testid="plan-day-life-area-choose"
            >
              Choose Different
            </button>
          </div>
        </div>
      ) : null}

      {showUncertain && !choosing ? (
        <div
          className="rounded-xl border border-dashed border-[#c9bfb0] bg-[#faf7f2]/80 px-4 py-3"
          data-testid="plan-day-life-area-uncertain"
        >
          <p className="text-sm leading-relaxed text-[#6b635a]">
            I&apos;m not quite sure where this belongs. My best guess is{" "}
            <strong>{classification.primaryLifeAreaName}</strong> — does that
            feel right?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleKeep}
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
            >
              Yes, {classification.primaryLifeAreaName}
            </button>
            <button
              type="button"
              onClick={() => setChoosing(true)}
              className="rounded-lg border border-[#c9bfb0] px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
            >
              Choose Different
            </button>
          </div>
        </div>
      ) : null}

      {choosing ? (
        <div
          className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/60 p-4"
          data-testid="plan-day-life-area-picker"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Life Areas…"
            className={`${FIELD} w-full`}
            aria-label="Search Life Areas"
          />

          {recentAreas.length > 0 && !search.trim() ? (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                Recent Life Areas
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {recentAreas.map((area) =>
                  area ? (
                    <li key={area.id}>
                      <button
                        type="button"
                        onClick={() => pickLifeArea(area.id, true)}
                        className="w-full rounded-lg px-2 py-2 text-left text-base text-[#1f1c19] hover:bg-white"
                      >
                        {area.name}
                      </button>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          ) : null}

          {suggestedAreas.length > 0 && !search.trim() ? (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                Suggested Life Areas
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {suggestedAreas.map((area) =>
                  area ? (
                    <li key={area.id}>
                      <button
                        type="button"
                        onClick={() => pickLifeArea(area.id, true)}
                        className="w-full rounded-lg px-2 py-2 text-left text-base text-[#1f1c19] hover:bg-white"
                      >
                        {area.name}
                      </button>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          ) : null}

          <div className={`mt-4 ${compact ? "" : ""}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              {search.trim() ? "Results" : "All Life Areas"}
            </p>
            <ul className="mt-2 max-h-48 overflow-y-auto flex flex-col gap-1">
              {filteredAreas.map((area) => (
                <li key={area.id}>
                  <button
                    type="button"
                    onClick={() => pickLifeArea(area.id, true)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-base hover:bg-white"
                  >
                    {area.color ? (
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: area.color }}
                        aria-hidden
                      />
                    ) : null}
                    <span className="text-[#1f1c19]">{area.name}</span>
                    {area.kind === "user" ? (
                      <span className="text-xs text-[#9a8f82]">Yours</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {creating ? (
            <div className="mt-4 border-t border-[#e7dfd4] pt-4">
              <CreateLifeAreaForm
                onCreated={(area) => pickLifeArea(area.id, true)}
                onCancel={() => setCreating(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-4 text-sm font-semibold text-[#1e4f4f] hover:underline"
              data-testid="plan-day-life-area-create"
            >
              + Create New Life Area
            </button>
          )}

          <button
            type="button"
            onClick={() => setChoosing(false)}
            className="mt-3 text-sm text-[#9a8f82] hover:underline"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}

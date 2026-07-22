"use client";

import { useEffect, useMemo, useState } from "react";
import { PortfolioRoomShell } from "@/components/companion/PortfolioRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import { HowThisFitsTogetherLink } from "@/components/companion/HowThisFitsTogetherLink";
import {
  createPortfolioEntry,
  deletePortfolioEntry,
  filterHallEntries,
  getPortfolioEntries,
  GROWTH_PORTFOLIO_UPDATED_EVENT,
  HALL_ACHIEVEMENT_OTHER_VALUE,
  HALL_ACHIEVEMENT_TYPE_OPTIONS,
  HALL_ACHIEVEMENT_TYPES,
  type PortfolioEntry,
} from "@/lib/growthPortfolioStore";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import "@/app/companion/grow-room.css";
import "@/app/companion/creative-studio-room.css";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GrowthPortfolioPanel({
  nav,
}: {
  refreshKey?: string;
  nav: GrowthPanelNav;
}) {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [achievementType, setAchievementType] = useState<string>(
    HALL_ACHIEVEMENT_TYPES[0]!,
  );
  const [customAchievementType, setCustomAchievementType] = useState("");
  const [projectName, setProjectName] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [filterType, setFilterType] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [justSavedTitle, setJustSavedTitle] = useState<string | null>(null);

  const isOtherType = achievementType === HALL_ACHIEVEMENT_OTHER_VALUE;

  useEffect(() => {
    const load = () => setEntries(getPortfolioEntries());
    load();
    window.addEventListener(GROWTH_PORTFOLIO_UPDATED_EVENT, load);
    return () => window.removeEventListener(GROWTH_PORTFOLIO_UPDATED_EVENT, load);
  }, []);

  const filtered = useMemo(
    () =>
      filterHallEntries(entries, {
        achievementType: filterType || undefined,
        year: filterYear || undefined,
        query: filterQuery || undefined,
      }),
    [entries, filterType, filterYear, filterQuery],
  );

  const years = useMemo(() => {
    const set = new Set(
      entries.map((e) => e.year ?? e.createdAt.slice(0, 4)).filter(Boolean),
    );
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [entries]);

  // Filter dropdown should include any custom "Other" types members have
  // already saved, not just the preset list — so past custom accomplishments
  // stay easy to find later.
  const filterTypeOptions = useMemo(() => {
    const custom = new Set<string>();
    for (const e of entries) {
      const t = e.achievementType;
      if (t && !(HALL_ACHIEVEMENT_TYPES as readonly string[]).includes(t)) {
        custom.add(t);
      }
    }
    return [...HALL_ACHIEVEMENT_TYPES, ...[...custom].sort((a, b) => a.localeCompare(b))];
  }, [entries]);

  const trimmedCustomType = customAchievementType.trim();
  const canSave = title.trim().length > 0 && (!isOtherType || trimmedCustomType.length > 0);

  function handleAdd() {
    if (!canSave) return;
    const resolvedType = isOtherType ? trimmedCustomType : achievementType;
    const entry = createPortfolioEntry({
      title: title.trim(),
      description: description.trim(),
      attachments: [],
      achievementType: resolvedType,
      projectName: projectName.trim() || undefined,
      year: year.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setProjectName("");
    setCustomAchievementType("");
    setAchievementType(HALL_ACHIEVEMENT_TYPES[0]!);
    setShowAdd(false);
    // Primary Action Feedback™ — the click always ends in a visible outcome:
    // the new entry appears in the Hall and a brief confirmation names it.
    setJustSavedTitle(entry.title);
    window.setTimeout(() => setJustSavedTitle(null), 4000);
  }

  return (
    <PortfolioRoomShell>
      <EstateWorkspace className="grow-room-panel">
        <GrowthPanelBackButton onBack={nav.onBack} label={nav.backLabel ?? "My Story"} />

        <header className="grow-room__header">
          <p className="estate-workspace__kicker">Your Estate</p>
          <h1 className="estate-workspace__title">Hall of Accomplishments</h1>
          <p className="grow-room__lead grow-room__intro-support">
            Look what you&apos;ve accomplished — milestones, launches, certifications,
            awards, and finished work worth celebrating.
          </p>
          <HowThisFitsTogetherLink
            areaOrPlaceId="hall-of-accomplishments"
            className="how-this-fits-link--inline mt-2"
          />
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163c3c]"
            onClick={() =>
              setShowAdd((v) => {
                const next = !v;
                if (!next) {
                  setCustomAchievementType("");
                  setAchievementType(HALL_ACHIEVEMENT_TYPES[0]!);
                }
                return next;
              })
            }
            data-testid="hall-add-achievement"
          >
            {showAdd ? "Cancel" : "Add achievement"}
          </button>
          <input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search…"
            className="min-w-[10rem] flex-1 rounded-xl border border-[#e7dfd4] bg-white px-3 py-2 text-sm"
            aria-label="Search accomplishments"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-[#e7dfd4] bg-white px-3 py-2 text-sm"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {filterTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-xl border border-[#e7dfd4] bg-white px-3 py-2 text-sm"
            aria-label="Filter by year"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {showAdd ? (
          <div
            className="mb-4 rounded-2xl border border-[#e7dfd4] bg-white/90 p-4"
            data-testid="hall-add-form"
          >
            <label className="block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Type
              <select
                value={achievementType}
                onChange={(e) => setAchievementType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#c9bfb0] px-3 py-2 text-sm font-normal text-[#1f1c19]"
              >
                {HALL_ACHIEVEMENT_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t === HALL_ACHIEVEMENT_OTHER_VALUE ? "Something else" : t}
                  </option>
                ))}
              </select>
            </label>
            {isOtherType ? (
              <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                What kind of accomplishment is this?
                <input
                  value={customAchievementType}
                  onChange={(e) => setCustomAchievementType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c9bfb0] px-3 py-2 text-sm font-normal text-[#1f1c19]"
                  placeholder="e.g. Marathon finished, Patent filed…"
                  autoFocus
                  data-testid="hall-custom-type-input"
                />
              </label>
            ) : null}
            <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#c9bfb0] px-3 py-2 text-sm font-normal text-[#1f1c19]"
                placeholder="What did you accomplish?"
              />
            </label>
            <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Story
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-[#c9bfb0] px-3 py-2 text-sm font-normal text-[#1f1c19]"
                placeholder="Why it matters…"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="flex-1 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                Project
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c9bfb0] px-3 py-2 text-sm font-normal text-[#1f1c19]"
                  placeholder="Optional"
                />
              </label>
              <label className="w-28 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                Year
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#c9bfb0] px-3 py-2 text-sm font-normal text-[#1f1c19]"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canSave}
              className="mt-4 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              data-testid="hall-save-to-hall"
            >
              Save to Hall
            </button>
          </div>
        ) : null}

        {justSavedTitle ? (
          <p
            className="mb-4 rounded-xl border border-[#cfe3d6] bg-[#f1f8f3] px-4 py-2 text-sm font-medium text-[#2f5a3f]"
            role="status"
            data-testid="hall-save-confirmation"
          >
            Added “{justSavedTitle}” to your Hall.
          </p>
        ) : null}

        {filtered.length === 0 ? (
          <p className="grow-room__placeholder-card">
            Your Hall is ready. Add a finished project, milestone, launch, or personal
            victory — look what you&apos;ve accomplished.
          </p>
        ) : (
          <ul className="creative-studio-room__grid">
            {filtered.map((entry) => {
              const cover = entry.attachments.find((a) => a.kind === "image");
              return (
                <li key={entry.id} className="creative-studio-room__card">
                  {cover?.url ? (
                    <img
                      src={cover.url}
                      alt=""
                      className="creative-studio-room__card-cover"
                    />
                  ) : (
                    <div className="creative-studio-room__card-placeholder" aria-hidden />
                  )}
                  <div className="creative-studio-room__card-body">
                    {entry.achievementType ? (
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b7355]">
                        {entry.achievementType}
                      </p>
                    ) : null}
                    <h2 className="font-bold text-[#2f261f]">{entry.title}</h2>
                    <time className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8f82]">
                      {formatDate(entry.createdAt)}
                      {entry.year ? ` · ${entry.year}` : null}
                    </time>
                    {entry.description ? (
                      <p className="mt-2 line-clamp-3 text-sm text-[#4b463f]">
                        {entry.description}
                      </p>
                    ) : null}
                    {entry.attachments.length > 0 ? (
                      <div className="mt-2">
                        <GrowthAttachmentsField
                          attachments={entry.attachments}
                          onChange={() => {}}
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-[#9a6b6b] hover:underline"
                      onClick={() => deletePortfolioEntry(entry.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </EstateWorkspace>
    </PortfolioRoomShell>
  );
}

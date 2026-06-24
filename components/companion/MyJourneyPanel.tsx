"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  consumeJourneyPrefill,
  createJourneyEntry,
  deleteJourneyEntry,
  EMPTY_JOURNEY_DRAFT,
  getAllJourneyChapters,
  getJourneyDashboardStats,
  getJourneyEntries,
  getJourneyChapterOutline,
  JOURNEY_CATEGORIES,
  JOURNEY_CHAPTER_PRESETS,
  MY_JOURNEY_UPDATED_EVENT,
  searchJourneyEntries,
  type JourneyEntry,
  type JourneyEntryInput,
  type JourneyFilter,
} from "@/lib/myJourneyStore";
import { GrowthAttachmentsField, GrowthAttachmentsList } from "@/components/companion/GrowthAttachmentsField";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { GrowthSectionHeader } from "@/components/companion/GrowthSectionHeader";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";
const LABEL_CLASS = "text-xs font-bold uppercase tracking-wide text-[#9a8f82]";

const FILTERS: { id: JourneyFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chapters", label: "Chapters" },
  { id: "lessons", label: "Lessons" },
  { id: "career", label: "Career" },
  { id: "business", label: "Business" },
  { id: "education", label: "Education" },
  { id: "milestones", label: "Milestones" },
  { id: "wisdom", label: "Wisdom" },
];

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#e7d9c8] bg-white px-2 py-2 text-center">
      <p className="text-lg font-bold text-[#2f261f]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8f82]">
        {label}
      </p>
    </div>
  );
}

export function MyJourneyPanel({
  refreshKey = 0,
  nav,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
}) {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [view, setView] = useState<"timeline" | "chapters">("timeline");
  const [filter, setFilter] = useState<JourneyFilter>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<JourneyEntryInput>(EMPTY_JOURNEY_DRAFT);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reload = useCallback(() => setEntries(getJourneyEntries()), []);
  const chapters = useMemo(() => getAllJourneyChapters(), [entries]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(MY_JOURNEY_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(MY_JOURNEY_UPDATED_EVENT, onUpdate);
  }, [reload]);

  useEffect(() => {
    const prefill = consumeJourneyPrefill();
    if (!prefill) return;
    setDraft((d) => ({
      ...d,
      title: prefill.title ?? d.title,
      whatHappened: prefill.whatHappened ?? d.whatHappened,
      category: prefill.category ?? d.category,
    }));
    setShowForm(true);
  }, [refreshKey]);

  const stats = useMemo(() => getJourneyDashboardStats(), [entries]);
  const visible = useMemo(() => {
    const base = search.trim()
      ? searchJourneyEntries(search, filter === "chapters" ? "all" : filter)
      : filter === "chapters"
        ? getJourneyEntries()
        : searchJourneyEntries("", filter);
    return base;
  }, [search, filter, entries]);

  const chapterOutline = useMemo(
    () => getJourneyChapterOutline(visible),
    [visible],
  );

  function updateDraft<K extends keyof JourneyEntryInput>(
    key: K,
    value: JourneyEntryInput[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleSave() {
    if (!draft.title.trim()) return;
    createJourneyEntry({
      ...draft,
      title: draft.title.trim(),
    });
    setDraft(EMPTY_JOURNEY_DRAFT);
    setShowForm(false);
    reload();
  }

  function closeAll() {
    setExpandedId(null);
    setShowForm(false);
    setDraft(EMPTY_JOURNEY_DRAFT);
  }

  function renderEntry(entry: JourneyEntry) {
    const expanded = expandedId === entry.id;
    return (
      <article
        key={entry.id}
        className="overflow-hidden rounded-2xl border border-[#e7d9c8] bg-white"
      >
        <button
          type="button"
          onClick={() =>
            setExpandedId((id) => (id === entry.id ? null : entry.id))
          }
          className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80"
        >
          <span className="shrink-0 text-sm text-[#9a8f82]">
            {expanded ? "▼" : "▶"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2 text-xs text-[#9a8f82]">
              <span className="rounded-full bg-[#faf7f2] px-2 py-0.5 font-semibold text-[#6f6259]">
                {entry.category}
              </span>
              {entry.date ? <span>{formatDate(entry.date)}</span> : null}
              {entry.chapter ? <span>· {entry.chapter}</span> : null}
            </div>
            <p className="mt-1 text-sm font-medium text-[#2f261f]">{entry.title}</p>
          </div>
        </button>
        {expanded ? (
          <div className="border-t border-[#efe8de] px-4 pb-4 pt-3 text-sm text-[#4b463f]">
            {entry.whatHappened ? (
              <p><span className="font-semibold text-[#2f261f]">What happened: </span>{entry.whatHappened}</p>
            ) : null}
            {entry.whatDidILearn ? (
              <p className="mt-2"><span className="font-semibold text-[#2f261f]">What I learned: </span>{entry.whatDidILearn}</p>
            ) : null}
            {entry.howDidThisShapeMe ? (
              <p className="mt-2"><span className="font-semibold text-[#2f261f]">How it shaped me: </span>{entry.howDidThisShapeMe}</p>
            ) : null}
            {entry.whatWisdom ? (
              <p className="mt-2"><span className="font-semibold text-[#2f261f]">Wisdom: </span>{entry.whatWisdom}</p>
            ) : null}
            <GrowthAttachmentsList attachments={entry.attachments} />
            <button
              type="button"
              onClick={() => {
                deleteJourneyEntry(entry.id);
                reload();
              }}
              className="mt-4 text-xs font-semibold text-[#9a6b6b]"
            >
              Remove entry
            </button>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <GrowthSectionHeader nav={nav} onCloseAll={closeAll} />

      <WorkspaceAreaWorksGuide areaId="my-journey" />

      {stats.total > 0 ? (
        <details className="mt-5 rounded-2xl border border-[#e7d9c8] bg-[#faf7f2]/50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-[#6f6259]">
            View entry totals (optional)
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatPill label="Life Chapters" value={stats.lifeChapters} />
            <StatPill label="Lessons Learned" value={stats.lessonsLearned} />
            <StatPill label="Career Experiences" value={stats.careerExperiences} />
            <StatPill label="Businesses Built" value={stats.businessesBuilt} />
            <StatPill label="Education" value={stats.education} />
            <StatPill label="Milestones" value={stats.milestones} />
            <StatPill label="Personal Growth Entries" value={stats.personalGrowth} />
            <StatPill label="Wisdom Entries" value={stats.wisdomEntries} />
          </div>
        </details>
      ) : null}

      {stats.total === 0 ? (
        <div className="mt-5 rounded-3xl border border-[#e7d9c8] bg-gradient-to-b from-[#faf7f2] to-white p-5 text-center">
          <p className="font-semibold text-[#2f261f]">Preserve your story as it unfolds.</p>
          <p className="mt-2 text-sm text-[#6f6259]">
            Add milestones, lessons, and chapters — not a resume, a meaningful life record.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-full bg-[#2f261f] px-4 py-2 text-sm font-semibold text-white"
          >
            Add First Entry
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-[#2f261f] px-4 py-2 text-sm font-semibold text-white"
        >
          {showForm ? "Hide form" : "Add entry"}
        </button>
        <button
          type="button"
          onClick={() => setView("timeline")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            view === "timeline" ? "bg-[#2f261f] text-white" : "border border-[#e7d9c8] bg-white"
          }`}
        >
          Timeline
        </button>
        <button
          type="button"
          onClick={() => setView("chapters")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            view === "chapters" ? "bg-[#2f261f] text-white" : "border border-[#e7d9c8] bg-white"
          }`}
        >
          Chapters
        </button>
        <button type="button" onClick={() => window.print()} className="rounded-full border border-[#e7d9c8] px-3 py-1.5 text-xs font-semibold text-[#6f6259]">
          🖨 Print
        </button>
        <button type="button" disabled className="cursor-not-allowed rounded-full border border-dashed border-[#e7d9c8] px-3 py-1.5 text-xs text-[#b8afa4]">
          📄 PDF Export
        </button>
        <button type="button" disabled className="cursor-not-allowed rounded-full border border-dashed border-[#e7d9c8] px-3 py-1.5 text-xs text-[#b8afa4]">
          📚 My Journey Book
        </button>
      </div>

      {showForm ? (
        <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-white p-5 space-y-4">
          <div>
            <label className={LABEL_CLASS}>Title</label>
            <input value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} className={INPUT_CLASS} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>Category</label>
              <select value={draft.category} onChange={(e) => updateDraft("category", e.target.value as JourneyEntryInput["category"])} className={INPUT_CLASS}>
                {JOURNEY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Chapter</label>
              <input list="journey-chapters" value={draft.chapter} onChange={(e) => updateDraft("chapter", e.target.value)} className={INPUT_CLASS} placeholder="e.g. Entrepreneurship" />
              <datalist id="journey-chapters">
                {JOURNEY_CHAPTER_PRESETS.map((c) => <option key={c} value={c} />)}
                {chapters.filter((c) => !(JOURNEY_CHAPTER_PRESETS as readonly string[]).includes(c)).map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Date (optional)</label>
            <input type="date" value={draft.date} onChange={(e) => updateDraft("date", e.target.value)} className={INPUT_CLASS} />
          </div>
          {(
            [
              ["whatHappened", "What happened?"],
              ["whatDidILearn", "What did I learn?"],
              ["howDidThisShapeMe", "How did this shape me?"],
              ["whatWisdom", "What wisdom came from this?"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS}>{label}</label>
              <textarea rows={2} value={draft[key]} onChange={(e) => updateDraft(key, e.target.value)} className={INPUT_CLASS} />
            </div>
          ))}
          <GrowthAttachmentsField
            attachments={draft.attachments}
            onAttachmentsChange={(next) => updateDraft("attachments", next)}
          />
          <button type="button" onClick={handleSave} disabled={!draft.title.trim()} className="rounded-full bg-[#2f261f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            Save to My Journey
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, story, lessons, wisdom, attachments…" className="w-full rounded-full border border-[#e4ddd2] bg-white px-4 py-2 text-sm" />
        <div className="mt-2 flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === f.id ? "bg-[#2f261f] text-white" : "border border-[#e7d9c8] bg-white text-[#6f6259]"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {view === "timeline" ? (
          <ul className="mt-3 space-y-3">
            {visible.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-[#e7d9c8] px-4 py-6 text-center text-sm text-[#6f6259]">No entries yet.</li>
            ) : (
              visible.map((entry) => <li key={entry.id}>{renderEntry(entry)}</li>)
            )}
          </ul>
        ) : (
          <div className="mt-3 space-y-5">
            {chapterOutline.map((group) => (
              <section key={group.chapter}>
                <h3 className="text-sm font-bold text-[#2f261f]">{group.chapter}</h3>
                {group.items.length === 0 ? (
                  <p className="mt-1 text-xs text-[#b8afa4]">No entries in this chapter yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {group.items.map((entry) => (
                      <li key={entry.id}>{renderEntry(entry)}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

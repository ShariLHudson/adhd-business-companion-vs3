"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addBrainDump,
  addXp,
  clearBrainDumpDraft,
  contextColor,
  deleteBrainDump,
  getBrainDumps,
  getProjects,
  logMomentum,
  loadBrainDumpDraft,
  saveBrainDumpDraft,
  saveProject,
  todayStr,
  topicColor,
  updateBrainDump,
  type BrainDumpEntry,
  type Project,
} from "@/lib/companionStore";
import { RefineActions } from "@/components/companion/RefineActions";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import {
  normalizeCategory,
  sortedBrainDumpCategoryGroups,
} from "@/lib/brainDumpCategories";
import { sortByDropdownLabel } from "@/lib/dropdownSort";
import type { AppSection } from "@/lib/companionUi";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
import { useVisualMode } from "@/lib/useVisualMode";

type TimeFilter = "today" | "week" | "month" | "30d" | "90d" | "all";

const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "all", label: "Everything" },
];

const TYPE_EMOJI: Record<string, string> = {
  task: "🧠",
  reminder: "⚠️",
  thought: "💭",
  urgent: "🔥",
  emotional: "🌿",
  idea: "📌",
};
const ACTION_TYPES = ["task", "idea", "reminder", "someday", "delegate"];
const ESTIMATES = [5, 15, 30, 60];
const SCHED = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "later", label: "Later" },
];

function isToday(iso: string) {
  return iso.slice(0, 10) === todayStr();
}
function withinDays(iso: string, days: number) {
  return Date.now() - new Date(iso).getTime() < days * 86400000;
}
function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BrainDumpPanel({
  onOpen,
  onAsk,
  registerBack,
  contextBanner,
  onSuggestOpen,
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Shown when opened beside another guide (e.g. Brain Parking Lot). */
  contextBanner?: string | null;
  /** Ask before navigating to another section. */
  onSuggestOpen?: (section: AppSection) => void;
}) {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<BrainDumpEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  // Filter-first: nothing shows until the user picks a filter (or a summary
  // chip / View items). Brain Dump should feel like a filing cabinet, not an
  // inbox dumping everything at you on open.
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewed, setViewed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [xpFlash, setXpFlash] = useState(false);
  const visualMode = useVisualMode();
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";

  useEffect(() => {
    const draft = loadBrainDumpDraft();
    if (draft) setText(draft);
    setEntries(getBrainDumps());
    setProjects(getProjects());
  }, []);

  // Back press closes an open item detail first, then exits the panel.
  useEffect(() => {
    registerBack?.(() => {
      if (expandedId !== null) {
        setExpandedId(null);
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [expandedId, registerBack]);

  function handleChange(value: string) {
    setText(value);
    saveBrainDumpDraft(value);
  }

  async function classify(id: string, note: string) {
    try {
      const res = await fetch("/api/braindump-classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note }),
      });
      const data = await res.json();
      if (res.ok) {
        setEntries(
          updateBrainDump(id, {
            topic: data.topic,
            category: data.category,
            contextType: data.contextType,
            suggestion: data.suggestion,
          }),
        );
      }
    } catch {
      /* leave unclassified */
    }
  }

  function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const list = addBrainDump(trimmed);
    setEntries(list);
    clearBrainDumpDraft();
    setText("");
    logMomentum("capture", "Brain dump captured");
    void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
      trackEcosystemEvent({
        eventType: "feature.brain_dump_used",
        feature: "brain-dump",
        metadata: { entryKind: "capture" },
      });
    });
    const id = list[0]?.id;
    if (id) void classify(id, trimmed);
  }

  const patch = (id: string, c: Partial<BrainDumpEntry>) =>
    setEntries(updateBrainDump(id, c));

  function newProjectFrom(entry: BrainDumpEntry) {
    const list = saveProject({
      name: entry.text.slice(0, 60),
      horizon: "now",
    });
    setProjects(list);
    if (list[0]) patch(entry.id, { projectId: list[0].id });
  }

  function markDone(id: string) {
    patch(id, { done: true });
    addXp(10); // internal momentum only — no visible score
    setXpFlash(true);
    setTimeout(() => setXpFlash(false), 1800);
    setExpandedId(null);
  }

  const projectName = (id?: string) =>
    id ? projects.find((p) => p.id === id)?.name : undefined;

  const activeEntries = entries.filter((e) => !e.done);
  const inTime = (iso: string) => {
    if (timeFilter === "all") return true;
    if (timeFilter === "today") return isToday(iso);
    if (timeFilter === "week") return withinDays(iso, 7);
    if (timeFilter === "30d") return withinDays(iso, 30);
    if (timeFilter === "90d") return withinDays(iso, 90);
    const d = new Date(iso);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  };
  const visible = activeEntries.filter(
    (e) =>
      inTime(e.createdAt) &&
      (categoryFilter === "all" ||
        normalizeCategory(e.category) === categoryFilter),
  );
  // Overview counts across ALL saved items (the filing-cabinet summary).
  const categoryCounts = activeEntries.reduce<Record<string, number>>(
    (acc, e) => {
      const c = normalizeCategory(e.category);
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const summary = Object.entries(categoryCounts).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const categoryGroups = useMemo(() => sortedBrainDumpCategoryGroups(), []);
  const sortedProjects = useMemo(
    () => sortByDropdownLabel(projects, (p) => p.name),
    [projects],
  );

  const suggestOpen = onSuggestOpen ?? onOpen;
    `rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
      active
        ? "bg-[#1e4f4f] text-white"
        : "bg-white/80 text-[#3d3630] hover:bg-white"
    }`;

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      {contextBanner ? (
        <div className="mb-4 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 px-4 py-3 text-sm leading-relaxed text-[#2d2926]">
          {contextBanner}
        </div>
      ) : null}
      <WorkspaceGuide section="brain-dump" />
      <p className="text-2xl font-semibold text-[#1f1c19]">Clear My Mind</p>
      <p className="mt-2 text-base text-[#6b635a]">
        Get it out of your head. I&apos;ll sort it and tell you what wants to
        become action.
      </p>

      <VoiceAnswerField
        value={text}
        onChange={handleChange}
        placeholder="Everything on your mind right now…"
        className="mt-5"
        inputClassName="min-h-[120px] resize-none rounded-2xl border-2 border-[#d4cdc3] bg-white/90 px-5 py-4 text-lg leading-relaxed text-[#1f1c19] placeholder:text-[#9a8f82] focus:border-[#1e4f4f] focus:outline-none focus:ring-2 focus:ring-[#1e4f4f]/15"
        micTitle="Speak your thoughts instead of typing"
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={!text.trim()}
          onClick={handleSave}
          className="rounded-xl bg-[#1e4f4f] px-8 py-2.5 text-base font-semibold text-white shadow-md hover:bg-[#163a3a] disabled:bg-[#9aaba8]"
        >
          Save
        </button>
      </div>

      {xpFlash && (
        <p className="companion-fade-in mt-3 text-center text-base font-semibold text-[#1e4f4f]">
          🎉 Nice — one less thing carrying mental weight.
        </p>
      )}

      {entries.some((e) => !e.done) && (
        <>
          {/* Filing-cabinet overview — clickable counts set the category. */}
          <p className="mt-7 text-sm font-bold uppercase tracking-wide text-[#7c7468]">
            Your Clear My Mind items
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            You have {activeEntries.length}{" "}
            {activeEntries.length === 1 ? "item" : "items"} across{" "}
            {summary.length}{" "}
            {summary.length === 1 ? "category" : "categories"}. Choose a
            timeframe and category to see what needs your attention.
          </p>
          {summary.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {summary.map(([cat, count]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat);
                    setViewed(true);
                  }}
                  className="rounded-full border border-[#d4cdc3] bg-white/80 px-3 py-1 text-sm font-medium text-[#3d3630] transition-colors hover:border-[#1e4f4f] hover:bg-white"
                >
                  {cat} <span className="text-[#6b635a]">({count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Filter bar */}
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Time
              <select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value as TimeFilter);
                  setViewed(true);
                }}
                className="mt-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              >
                {TIME_FILTERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Category
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setViewed(true);
                }}
                className="mt-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              >
                <option value="all">All Categories</option>
                {categoryGroups.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            {!viewed && (
              <button
                type="button"
                onClick={() => setViewed(true)}
                className="rounded-xl bg-[#1e4f4f] px-5 py-2 text-base font-semibold text-white hover:bg-[#163a3a]"
              >
                View items
              </button>
            )}
          </div>

          {viewed &&
            (visible.length === 0 ? (
            <p className="mt-4 text-base text-[#6b635a]">
              Nothing here for this filter.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {visible.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-[#d4cdc3] bg-white/85 p-4"
                  style={
                    colorOn && entry.contextType
                      ? {
                          borderLeftWidth: 5,
                          borderLeftColor: contextColor(entry.contextType, visualMode),
                          ...(decorative
                            ? {
                                backgroundColor: `${contextColor(entry.contextType, visualMode)}0d`,
                              }
                            : {}),
                        }
                      : undefined
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === entry.id ? null : entry.id)
                    }
                    className="w-full text-left"
                  >
                    <span className="text-xs font-medium text-[#9a8f82]">
                      {formatWhen(entry.createdAt)}
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap text-base leading-relaxed text-[#2d2926]">
                      {entry.text}
                    </p>
                    {/* Category badge — always visible for fast scanning. */}
                    <span className="mt-1 inline-flex rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
                      {normalizeCategory(entry.category)}
                    </span>
                    {(entry.topic || entry.contextType) && (
                      <span className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-xs">
                        {entry.contextType && (
                          <span
                            className="rounded-full px-2 py-0.5 font-semibold"
                            style={
                              colorOn
                                ? {
                                    backgroundColor: `${contextColor(entry.contextType, visualMode)}1a`,
                                    color: contextColor(entry.contextType, visualMode),
                                  }
                                : { backgroundColor: "rgba(255,255,255,0.8)", color: "#3d3630" }
                            }
                          >
                            {TYPE_EMOJI[entry.contextType] ?? ""}{" "}
                            {entry.contextType}
                          </span>
                        )}
                        {entry.topic && (
                          <span
                            className="rounded-full px-2 py-0.5 font-semibold"
                            style={
                              colorOn
                                ? {
                                    backgroundColor: `${topicColor(entry.topic, visualMode)}1a`,
                                    color: topicColor(entry.topic, visualMode),
                                  }
                                : { backgroundColor: "rgba(30,79,79,0.1)", color: "#1e4f4f" }
                            }
                          >
                            {entry.topic}
                          </span>
                        )}
                        {projectName(entry.projectId) && (
                          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[#6b635a]">
                            {projectName(entry.projectId)}
                          </span>
                        )}
                      </span>
                    )}
                  </button>

                  {/* Detail panel */}
                  {expandedId === entry.id && (
                    <div className="companion-fade-in mt-3 border-t border-[#e7dfd4] pt-3">
                      <textarea
                        value={entry.text}
                        onChange={(e) => patch(entry.id, { text: e.target.value })}
                        className="w-full resize-none rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                      />

                      {/* Editing layer — refine / rewrite / simplify / break down */}
                      <RefineActions
                        text={entry.text}
                        onApply={(next) => patch(entry.id, { text: next })}
                      />

                      {/* Manual category override — AI assigns, user can change. */}
                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                        Category
                      </p>
                      <select
                        value={normalizeCategory(entry.category)}
                        onChange={(e) =>
                          patch(entry.id, { category: e.target.value })
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                      >
                        {categoryGroups.map((g) => (
                          <optgroup key={g.group} label={g.group}>
                            {g.categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                        <option value="Other">Other</option>
                      </select>

                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                        Project
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <select
                          value={entry.projectId ?? ""}
                          onChange={(e) =>
                            patch(entry.id, {
                              projectId: e.target.value || undefined,
                            })
                          }
                          className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                        >
                          <option value="">No project</option>
                          {sortedProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => newProjectFrom(entry)}
                          className="shrink-0 rounded-lg border border-[#1e4f4f]/40 bg-white px-2.5 py-2 text-xs font-semibold text-[#1e4f4f]"
                        >
                          + New
                        </button>
                      </div>

                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                        Time estimate
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {ESTIMATES.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => patch(entry.id, { estimateMin: m })}
                            className={chip(entry.estimateMin === m)}
                          >
                            {m === 60 ? "1 hr" : `${m} min`}
                          </button>
                        ))}
                      </div>

                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                        Action type
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {ACTION_TYPES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => patch(entry.id, { actionType: t })}
                            className={chip(entry.actionType === t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                        When
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {SCHED.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              patch(entry.id, { schedulingIntent: s.id })
                            }
                            className={chip(entry.schedulingIntent === s.id)}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                        <button
                          type="button"
                          onClick={() => suggestOpen?.("time-block")}
                          className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-white hover:bg-[#163a3a]"
                        >
                          ⏱ Time Block
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            newProjectFrom(entry);
                            suggestOpen?.("projects");
                          }}
                          className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-1.5 text-[#1e4f4f]"
                        >
                          📁 To Project
                        </button>
                        <button
                          type="button"
                          onClick={() => suggestOpen?.("focus-timer")}
                          className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-1.5 text-[#1e4f4f]"
                        >
                          ▶ Focus
                        </button>
                        <button
                          type="button"
                          onClick={() => markDone(entry.id)}
                          className="rounded-lg px-3 py-1.5 text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                        >
                          ✓ Done
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEntries(deleteBrainDump(entry.id))
                          }
                          className="ml-auto rounded-lg px-3 py-1.5 text-[#a85c4a] hover:bg-[#a85c4a]/10"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            ))}
        </>
      )}
    </div>
  );
}

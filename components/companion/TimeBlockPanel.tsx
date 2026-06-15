"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addBlockTag,
  blockDateTime,
  deleteTimeBlock,
  formatBlockTime,
  formatDayLabel,
  formatDuration,
  getBlockTags,
  getProjects,
  getTimeBlocks,
  saveProject,
  saveTimeBlock,
  snoozeBlock,
  todayStr,
  type BlockEnergy,
  type Project,
  type TimeBlock,
} from "@/lib/companionStore";
import {
  DEFAULT_TIME_BANK_FILTERS,
  filterTimeBankBlocks,
  type TimeBankFilters,
} from "@/lib/timeBank";
import { sortByDropdownLabel } from "@/lib/dropdownSort";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
import { useVisualMode } from "@/lib/useVisualMode";

type DurUnit = "min" | "hr" | "day" | "week" | "month";
const UNIT_MIN: Record<DurUnit, number> = {
  min: 1,
  hr: 60,
  day: 1440,
  week: 10080,
  month: 43200,
};

const ENERGY_DOT: Record<BlockEnergy, string> = {
  high: "#2e8b57",
  medium: "#d4a574",
  low: "#9a8f82",
};

const PROJECT_COLORS = [
  "#1e4f4f",
  "#a85c4a",
  "#6b8e23",
  "#4a6fa5",
  "#9a6fb0",
  "#c08a3e",
];

function projectColor(id?: string): string | null {
  if (!id) return null;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PROJECT_COLORS[h % PROJECT_COLORS.length]!;
}

function calTimes(b: TimeBlock) {
  const start = blockDateTime(b);
  const end = new Date(start.getTime() + b.durationMin * 60000);
  return { start, end };
}

const utcStamp = (d: Date) =>
  d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// One-tap calendar links — open a prefilled event, no backend/auth needed.
function googleCalUrl(b: TimeBlock): string {
  const { start, end } = calTimes(b);
  const dates = `${utcStamp(start)}/${utcStamp(end)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    b.title,
  )}&dates=${dates}&details=${encodeURIComponent(b.note ?? "")}`;
}

function outlookCalUrl(b: TimeBlock): string {
  const { start, end } = calTimes(b);
  return `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
    b.title,
  )}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(
    b.note ?? "",
  )}`;
}

// .ics download — universal: import into Apple Calendar, any Google/Outlook
// account, or any app. This is how to handle multiple calendars/accounts.
function downloadIcs(b: TimeBlock) {
  if (typeof document === "undefined") return;
  const { start, end } = calTimes(b);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Spark Studio Companions//EN",
    "BEGIN:VEVENT",
    `UID:${b.id}@sparkstudio`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${b.title.replace(/\r?\n/g, " ")}`,
    b.note ? `DESCRIPTION:${b.note.replace(/\r?\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([ics], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(b.title || "time-block").replace(/[^a-z0-9]+/gi, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

const ENERGY: { id: BlockEnergy; label: string }[] = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

const DURATIONS = [15, 30, 60];
const SNOOZE = [5, 10, 30, 120];

type Form = {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  durationMin: number;
  custom: string;
  customUnit: DurUnit;
  energy: BlockEnergy;
  tag?: string;
  note: string;
  projectId?: string;
  timerEnabled: boolean;
};

function emptyForm(): Form {
  return {
    title: "",
    date: todayStr(),
    startTime: "09:00",
    durationMin: 30,
    custom: "",
    customUnit: "min",
    energy: "medium",
    note: "",
    timerEnabled: false,
  };
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Horizon =
  | "today"
  | "tomorrow"
  | "3days"
  | "week"
  | "nextweek"
  | "later"
  | "unscheduled";

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "3days", label: "Next 3 days" },
  { id: "week", label: "This week" },
  { id: "nextweek", label: "Next week" },
  { id: "later", label: "Later" },
  { id: "unscheduled", label: "Time Bank" },
];

// Single-bucket horizons don't need per-day headers.
const MULTI_DAY: Horizon[] = ["3days", "week", "nextweek", "later"];

function inHorizon(date: string, view: Horizon): boolean {
  const today = todayStr();
  if (!date) return view === "unscheduled";
  if (view === "unscheduled") return false;
  switch (view) {
    case "today":
      return date === today;
    case "tomorrow":
      return date === addDays(today, 1);
    case "3days":
      return date >= today && date <= addDays(today, 2);
    case "week":
      return date >= today && date <= addDays(today, 6);
    case "nextweek":
      return date >= addDays(today, 7) && date <= addDays(today, 13);
    case "later":
      return date > addDays(today, 13);
  }
}

export function TimeBlockPanel({
  onStart,
  onTestAlert,
  initialProjectId,
}: {
  onStart: (block: TimeBlock) => void;
  onTestAlert?: () => void;
  /** Inherit project context when opened from a project ("schedule time to work on X"). */
  initialProjectId?: string;
}) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<Form>(emptyForm());
  const [snoozeFor, setSnoozeFor] = useState<string | null>(null);
  const [view, setView] = useState<Horizon>("today");
  const [openDays, setOpenDays] = useState<Set<string>>(
    () => new Set([todayStr()]),
  );

  const [durTouched, setDurTouched] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [bankOpen, setBankOpen] = useState(true);
  const [bankFilters, setBankFilters] = useState<TimeBankFilters>(
    DEFAULT_TIME_BANK_FILTERS,
  );

  useEffect(() => {
    setBlocks(getTimeBlocks());
    const list = getProjects();
    setProjects(list);
    setTags(getBlockTags());
    // Project → Time Block: inherit the project, prefill a sensible title and a
    // focused-session duration so the user isn't asked what to work on again.
    if (initialProjectId) {
      const proj = list.find((p) => p.id === initialProjectId);
      setForm((f) => ({
        ...f,
        projectId: initialProjectId,
        date: "",
        title: f.title.trim()
          ? f.title
          : proj?.nextAction.trim() || proj?.name || f.title,
        durationMin: f.durationMin === 30 ? 60 : f.durationMin,
      }));
    }
  }, [initialProjectId]);

  function createProject() {
    const name = newProject.trim();
    if (!name) return;
    const list = saveProject({ name, horizon: "now" });
    setProjects(list);
    setForm((f) => ({ ...f, projectId: list[0]?.id }));
    setNewProject("");
    setAddingProject(false);
  }

  function createTag() {
    const t = newTag.trim();
    if (!t) return;
    const list = addBlockTag(t);
    setTags(list);
    setForm((f) => ({ ...f, tag: t }));
    setNewTag("");
    setAddingTag(false);
  }

  const projectName = (id?: string) =>
    id ? projects.find((p) => p.id === id)?.name : undefined;
  const projColor = (id?: string) =>
    (id ? projects.find((p) => p.id === id)?.color : undefined) ??
    projectColor(id);
  const visualMode = useVisualMode();
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";

  const durationMin =
    form.durationMin === -1
      ? (Number(form.custom) || 0) * UNIT_MIN[form.customUnit]
      : form.durationMin;
  const hasTitle = form.title.trim().length > 0;
  const revealRest = hasTitle && durTouched;

  // Day stack grouped by horizon (scheduled blocks only).
  const grouped = useMemo(() => {
    const inRange = blocks.filter(
      (b) => b.date && inHorizon(b.date, view),
    );
    const byDay = new Map<string, TimeBlock[]>();
    for (const b of inRange) {
      const key = b.date || "unscheduled";
      const arr = byDay.get(key) ?? [];
      arr.push(b);
      byDay.set(key, arr);
    }
    return [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [blocks, view]);

  const bankBlocks = useMemo(
    () => filterTimeBankBlocks(blocks, bankFilters),
    [blocks, bankFilters],
  );

  const bankTags = useMemo(() => {
    const set = new Set<string>();
    for (const b of blocks) {
      if (!b.date && b.tag) set.add(b.tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [blocks]);

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    [tags],
  );

  const sortedProjects = useMemo(
    () => sortByDropdownLabel(projects, (p) => p.name),
    [projects],
  );

  function renderBlockCard(b: TimeBlock, opts?: { bank?: boolean }) {
    return (
      <li
        key={b.id}
        style={
          colorOn && b.projectId
            ? {
                borderLeftWidth: 5,
                borderLeftColor: projColor(b.projectId) ?? undefined,
                ...(decorative && b.status !== "missed"
                  ? {
                      backgroundColor: `${projColor(b.projectId) ?? "#999"}0d`,
                    }
                  : {}),
              }
            : undefined
        }
        className={`rounded-2xl border border-[#d4cdc3] p-4 ${
          b.status === "completed" ? "opacity-60" : ""
        } ${b.status === "missed" ? "bg-[#a85c4a]/10" : "bg-white/85"}`}
      >
        <p className="text-base font-semibold text-[#1f1c19]">
          {opts?.bank || !b.date
            ? b.title
            : `${formatBlockTime(b.startTime)} — ${b.title}`}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6b635a]">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: ENERGY_DOT[b.energy] }}
            title={`${b.energy} energy`}
          />
          <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 font-semibold text-[#1e4f4f]">
            {formatDuration(b.durationMin)}
          </span>
          {projectName(b.projectId) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1e4f4f]/8 px-2 py-0.5 font-semibold text-[#1e4f4f]">
              {colorOn && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    background: projColor(b.projectId) ?? "#999",
                  }}
                />
              )}
              Assigned to: {projectName(b.projectId)}
            </span>
          )}
          {b.tag && (
            <span className="rounded-full bg-white/80 px-2 py-0.5">{b.tag}</span>
          )}
          {b.status !== "pending" && (
            <span className="capitalize">{b.status}</span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => onStart(b)}
            className="rounded-md bg-[#1e4f4f] px-3 py-1 text-white hover:bg-[#163a3a]"
          >
            ▶ Start now
          </button>
          <button
            type="button"
            onClick={() => edit(b)}
            className="rounded-md px-2.5 py-1 text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
          >
            ✏ Edit
          </button>
          {!opts?.bank && (
            <button
              type="button"
              onClick={() => setSnoozeFor(snoozeFor === b.id ? null : b.id)}
              className="rounded-md px-2.5 py-1 text-[#6b635a] hover:bg-black/5"
            >
              ⏰ Snooze
            </button>
          )}
          <button
            type="button"
            onClick={() => setBlocks(deleteTimeBlock(b.id))}
            className="rounded-md px-2.5 py-1 text-[#a85c4a] hover:bg-[#a85c4a]/10"
          >
            🗑 Delete
          </button>
        </div>
        {!opts?.bank && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6b635a]">
            <span>📅 Add to calendar:</span>
            <a
              href={googleCalUrl(b)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1e4f4f] hover:underline"
            >
              Google
            </a>
            <a
              href={outlookCalUrl(b)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1e4f4f] hover:underline"
            >
              Outlook
            </a>
            <button
              type="button"
              onClick={() => downloadIcs(b)}
              className="font-semibold text-[#1e4f4f] hover:underline"
            >
              Download .ics
            </button>
          </div>
        )}
        {snoozeFor === b.id && (
          <div className="mt-2 flex flex-wrap gap-2">
            {SNOOZE.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setBlocks(snoozeBlock(b.id, m));
                  setSnoozeFor(null);
                }}
                className="rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/20"
              >
                {m === 120 ? "Later today" : `${m} min`}
              </button>
            ))}
          </div>
        )}
      </li>
    );
  }

  function resetForm() {
    setForm(emptyForm());
    setDurTouched(false);
    setShowTag(false);
    setShowNote(false);
  }

  function submit() {
    if (!form.title.trim() || durationMin <= 0) return;
    const saved = saveTimeBlock({
      id: form.id,
      title: form.title.trim(),
      date: form.date,
      startTime: form.startTime,
      durationMin,
      energy: form.energy,
      tag: form.tag,
      note: form.note.trim() || undefined,
      projectId: form.projectId,
      timerEnabled: form.timerEnabled,
    });
    setBlocks(saved);
    if (!form.id) {
      const created = saved[0];
      if (created) {
        void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
          trackEcosystemEvent({
            eventType: "feature.time_block_started",
            feature: "time-block",
            metadata: {
              timeBlockId: created.id,
              durationMin: created.durationMin,
            },
          });
        });
      }
    }
    resetForm();
  }

  function edit(b: TimeBlock) {
    const preset = DURATIONS.includes(b.durationMin);
    setForm({
      id: b.id,
      title: b.title,
      date: b.date || todayStr(),
      startTime: b.startTime,
      durationMin: preset ? b.durationMin : -1,
      custom: preset ? "" : String(b.durationMin),
      customUnit: "min",
      energy: b.energy,
      tag: b.tag,
      note: b.note ?? "",
      projectId: b.projectId,
      timerEnabled: !!b.timerEnabled,
    });
    setDurTouched(true);
    setShowTag(!!b.tag);
    setShowNote(!!b.note);
  }

  const chip = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
      active
        ? "bg-[#1e4f4f] text-white shadow-sm"
        : "bg-white/80 text-[#3d3630] hover:bg-white"
    }`;

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <WorkspaceGuide section="time-block" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">Time Blocks</p>
        {onTestAlert && (
          <button
            type="button"
            onClick={onTestAlert}
            className="rounded-full border border-[#c9bfb0] bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#3d3630] hover:bg-white"
          >
            🔔 Test alert
          </button>
        )}
      </div>
      <p className="mt-1 text-base text-[#6b635a]">
        Scheduled intentions — I&apos;ll nudge you when it&apos;s time.
      </p>

      {/* Create / edit form — progressive */}
      <div className="mt-6 rounded-2xl border border-[#d4cdc3] bg-white/70 p-4">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="What are you doing? e.g. Write content"
          className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />

        {hasTitle && (
          <div className="companion-fade-in">
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-[#6b635a]">
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="ml-2 rounded-lg border border-[#c9bfb0] bg-white px-2 py-1.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                />
              </label>
              <label className="text-sm font-semibold text-[#6b635a]">
                Start
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  className="ml-2 rounded-lg border border-[#c9bfb0] bg-white px-2 py-1.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                />
              </label>
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-[#6b635a]">
              <input
                type="checkbox"
                checked={!form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.checked ? "" : todayStr(),
                  })
                }
                className="h-4 w-4 accent-[#1e4f4f]"
              />
              No date yet — save to Time Bank
            </label>

            <p className="mt-3 text-sm font-semibold text-[#6b635a]">Duration</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, durationMin: d });
                    setDurTouched(true);
                  }}
                  className={chip(form.durationMin === d && durTouched)}
                >
                  {d === 60 ? "1 hr" : `${d} min`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, durationMin: -1 });
                  setDurTouched(true);
                }}
                className={chip(form.durationMin === -1)}
              >
                Custom
              </button>
              {form.durationMin === -1 && (
                <span className="inline-flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={form.custom}
                    onChange={(e) =>
                      setForm({ ...form, custom: e.target.value })
                    }
                    placeholder="#"
                    className="w-16 rounded-lg border border-[#c9bfb0] bg-white px-2 py-1.5 text-base outline-none focus:border-[#1e4f4f]"
                  />
                  <select
                    value={form.customUnit}
                    onChange={(e) =>
                      setForm({ ...form, customUnit: e.target.value as DurUnit })
                    }
                    className="rounded-lg border border-[#c9bfb0] bg-white px-2 py-1.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  >
                    <option value="min">min</option>
                    <option value="hr">hours</option>
                    <option value="day">days</option>
                    <option value="week">weeks</option>
                    <option value="month">months</option>
                  </select>
                </span>
              )}
            </div>
          </div>
        )}

        {revealRest && (
          <div className="companion-fade-in">
            <p className="mt-4 text-sm font-semibold text-[#6b635a]">
              Energy level
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {ENERGY.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setForm({ ...form, energy: e.id })}
                  className={chip(form.energy === e.id)}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#3d3630]">
              <input
                type="checkbox"
                checked={form.timerEnabled}
                onChange={(e) =>
                  setForm({ ...form, timerEnabled: e.target.checked })
                }
                className="h-4 w-4 accent-[#1e4f4f]"
              />
              ⏱ Enable timer — counts down when you start (off by default)
            </label>

            <p className="mt-4 text-sm font-semibold text-[#6b635a]">
              Project <span className="font-normal text-[#9a8f82]">(optional)</span>
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <select
                value={form.projectId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, projectId: e.target.value || undefined })
                }
                className="min-w-0 flex-1 truncate rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
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
                onClick={() => setAddingProject(true)}
                className="shrink-0 whitespace-nowrap rounded-lg bg-[#1e4f4f] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                + New project
              </button>
            </div>
            {showTag ? (
              <>
                <p className="mt-4 text-sm font-semibold text-[#6b635a]">
                  Type of work
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {sortedTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, tag: form.tag === t ? undefined : t })
                      }
                      className={chip(form.tag === t)}
                    >
                      {t}
                    </button>
                  ))}
                  {!addingTag ? (
                    <button
                      type="button"
                      onClick={() => setAddingTag(true)}
                      className="rounded-full border border-dashed border-[#c9bfb0] px-3.5 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-white"
                    >
                      + Add type
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Tag name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            createTag();
                          }
                        }}
                        className="w-28 rounded-full border border-[#c9bfb0] bg-white px-3 py-1.5 text-sm outline-none focus:border-[#1e4f4f]"
                      />
                      <button
                        type="button"
                        onClick={createTag}
                        className="rounded-full bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        Add
                      </button>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowTag(true)}
                className="mt-4 mr-4 text-sm font-semibold text-[#1e4f4f]"
              >
                + Type of work
              </button>
            )}

            {showNote ? (
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Note — what does done look like?"
                className="companion-fade-in mt-3 min-h-[60px] w-full resize-none rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="mt-4 text-sm font-semibold text-[#1e4f4f]"
              >
                + Note
              </button>
            )}

            <div className="mt-4 flex justify-end gap-2">
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-base font-semibold text-[#1e4f4f]"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                disabled={!form.title.trim() || durationMin <= 0}
                onClick={submit}
                className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-base font-semibold text-white disabled:bg-[#9aaba8]"
              >
                {form.id ? "Update Time Block" : "Add time block"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Time Bank — unscheduled blocks stay here even when assigned to a project */}
      <div className="mt-7 rounded-2xl border border-[#d4cdc3] bg-white/60 p-4">
        <button
          type="button"
          onClick={() => setBankOpen((o) => !o)}
          className="flex w-full items-center gap-2 text-left"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            Time Bank
          </p>
          <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
            {bankBlocks.length}
          </span>
          <span className="ml-auto text-sm text-[#6b635a]">{bankOpen ? "▾" : "▸"}</span>
        </button>
        <p className="mt-1 text-sm text-[#6b635a]">
          Saved blocks without a date — assign to projects without losing them here.
        </p>
        {bankOpen && (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                value={bankFilters.assignment}
                onChange={(e) =>
                  setBankFilters((f) => ({
                    ...f,
                    assignment: e.target.value as TimeBankFilters["assignment"],
                  }))
                }
                className="rounded-full border border-[#c9bfb0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                aria-label="Filter by assignment"
              >
                <option value="all">All</option>
                <option value="unassigned">Unassigned</option>
                <option value="assigned">Assigned</option>
              </select>
              <select
                value={bankFilters.projectId}
                onChange={(e) =>
                  setBankFilters((f) => ({ ...f, projectId: e.target.value }))
                }
                className="rounded-full border border-[#c9bfb0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                aria-label="Filter by project"
              >
                <option value="all">All projects</option>
                {sortedProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {bankTags.length > 0 && (
                <select
                  value={bankFilters.tag}
                  onChange={(e) =>
                    setBankFilters((f) => ({ ...f, tag: e.target.value }))
                  }
                  className="rounded-full border border-[#c9bfb0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  aria-label="Filter by category"
                >
                  <option value="all">All categories</option>
                  {bankTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={bankFilters.duration}
                onChange={(e) =>
                  setBankFilters((f) => ({
                    ...f,
                    duration: e.target.value as TimeBankFilters["duration"],
                  }))
                }
                className="rounded-full border border-[#c9bfb0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                aria-label="Filter by duration"
              >
                <option value="all">Any duration</option>
                <option value="short">Under 30 min</option>
                <option value="medium">30–60 min</option>
                <option value="long">Over 1 hr</option>
              </select>
            </div>
            {bankBlocks.length === 0 ? (
              <p className="mt-3 text-sm text-[#6b635a]">
                No blocks in the bank yet — check &ldquo;No date yet&rdquo; when adding one.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {bankBlocks.map((b) => renderBlockCard(b, { bank: true }))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Scheduled day stack */}
      {view !== "unscheduled" && (
        <>
      <div className="mt-7 flex items-center justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Scheduled
        </p>
        <select
          value={view}
          onChange={(e) => setView(e.target.value as Horizon)}
          className="rounded-full border border-[#c9bfb0] bg-white px-3 py-1.5 text-sm font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          {HORIZONS.filter((h) => h.id !== "unscheduled").map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </select>
      </div>

      {grouped.length === 0 ? (
        <p className="mt-2 text-base text-[#6b635a]">
          Nothing scheduled for{" "}
          {HORIZONS.find((h) => h.id === view)?.label.toLowerCase()} yet.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {grouped.map(([date, dayBlocks]) => {
            const showHeader = MULTI_DAY.includes(view);
            const open = !showHeader || openDays.has(date);
            return (
            <div key={date}>
              {showHeader && (
                <button
                  type="button"
                  onClick={() =>
                    setOpenDays((s) => {
                      const n = new Set(s);
                      if (n.has(date)) n.delete(date);
                      else n.add(date);
                      return n;
                    })
                  }
                  className="mb-1.5 flex w-full items-center gap-2 text-left"
                >
                  <span className="text-sm font-semibold text-[#1f1c19]">
                    {formatDayLabel(date)}
                  </span>
                  <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
                    {dayBlocks.length}
                  </span>
                  <span className="ml-auto text-sm text-[#6b635a]">
                    {open ? "▾" : "▸"}
                  </span>
                </button>
              )}
              {open && (
              <ul className="flex flex-col gap-3">
                {dayBlocks.map((b) => renderBlockCard(b))}
              </ul>
              )}
            </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {view === "unscheduled" && (
        <div className="mt-4 flex justify-end">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as Horizon)}
            className="rounded-full border border-[#c9bfb0] bg-white px-3 py-1.5 text-sm font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          >
            {HORIZONS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {addingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="companion-fade-in w-full max-w-sm rounded-2xl bg-[#faf6f0] p-6 shadow-2xl">
            <p className="text-lg font-semibold text-[#1f1c19]">New project</p>
            <input
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Project name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createProject();
                }
              }}
              className="mt-3 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAddingProject(false);
                  setNewProject("");
                }}
                className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newProject.trim()}
                onClick={createProject}
                className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white disabled:bg-[#9aaba8]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

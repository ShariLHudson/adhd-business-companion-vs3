"use client";

import { useEffect, useState } from "react";
import {
  addBrainDump,
  addXp,
  clearBrainDumpDraft,
  contextColor,
  deleteBrainDump,
  getBrainDumps,
  getPrefs,
  getProjects,
  getXp,
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
import type { AppSection } from "@/lib/companionUi";

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
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<BrainDumpEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<"today" | "week" | "everything">("today");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [xpFlash, setXpFlash] = useState(false);
  const [xp, setXp] = useState(0);
  const visualMode = getPrefs().visualMode;
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";

  useEffect(() => {
    const draft = loadBrainDumpDraft();
    if (draft) setText(draft);
    setEntries(getBrainDumps());
    setProjects(getProjects());
    setXp(getXp());
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
    setXp(addXp(10));
    setXpFlash(true);
    setTimeout(() => setXpFlash(false), 1800);
    setExpandedId(null);
  }

  const projectName = (id?: string) =>
    id ? projects.find((p) => p.id === id)?.name : undefined;

  const visible = entries.filter(
    (e) =>
      !e.done &&
      (view === "today"
        ? isToday(e.createdAt)
        : view === "week"
          ? withinDays(e.createdAt, 7)
          : true),
  );

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
      active
        ? "bg-[#1e4f4f] text-white"
        : "bg-white/80 text-[#3d3630] hover:bg-white"
    }`;

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">Brain Dump</p>
        <span className="rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-sm font-semibold text-[#1e4f4f]">
          {xp} XP
        </span>
      </div>
      <p className="mt-2 text-base text-[#6b635a]">
        Get it out of your head. I&apos;ll sort it and tell you what wants to
        become action.
      </p>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Everything on your mind right now…"
        className="mt-5 min-h-[120px] resize-none rounded-2xl border-2 border-[#d4cdc3] bg-white/90 px-5 py-4 text-lg leading-relaxed text-[#1f1c19] placeholder:text-[#9a8f82] focus:border-[#1e4f4f] focus:outline-none focus:ring-2 focus:ring-[#1e4f4f]/15"
      />
      <button
        type="button"
        disabled={!text.trim()}
        onClick={handleSave}
        className="mt-3 self-end rounded-xl bg-[#1e4f4f] px-8 py-2.5 text-base font-semibold text-white shadow-md hover:bg-[#163a3a] disabled:bg-[#9aaba8]"
      >
        Save
      </button>

      {xpFlash && (
        <p className="companion-fade-in mt-3 text-center text-base font-semibold text-[#1e4f4f]">
          🎉 Nice — that counts! +10 XP
        </p>
      )}

      {entries.some((e) => !e.done) && (
        <>
          <div className="mt-7 flex gap-1 self-start rounded-full bg-white/70 p-0.5">
            {(["today", "week", "everything"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  view === v ? "bg-[#1e4f4f] text-white" : "text-[#6b635a]"
                }`}
              >
                {v === "today"
                  ? "Today"
                  : v === "week"
                    ? "This week"
                    : "Everything"}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="mt-3 text-base text-[#6b635a]">Nothing here.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
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
                          {projects.map((p) => (
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
                          onClick={() => onOpen?.("time-block")}
                          className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-white hover:bg-[#163a3a]"
                        >
                          ⏱ Time Block
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            newProjectFrom(entry);
                            onOpen?.("projects");
                          }}
                          className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-1.5 text-[#1e4f4f]"
                        >
                          📁 To Project
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpen?.("focus-timer")}
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
          )}
        </>
      )}
    </div>
  );
}

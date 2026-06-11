"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deleteProject,
  getDayState,
  getPrefs,
  getProjects,
  logMomentum,
  PROJECT_HORIZON_LABEL,
  PROJECT_PALETTE,
  PROJECT_STATUS_LABEL,
  saveProject,
  type Project,
  type ProjectHorizon,
  type ProjectStatus,
} from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";

const STATUSES: ProjectStatus[] = [
  "not-started",
  "in-progress",
  "active-focus",
  "paused",
  "completed",
];

export function ProjectsPanel({
  onOpen,
  onAsk,
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [detailId, setDetailId] = useState<string | null>(null);

  // Guided create
  const [step, setStep] = useState(0);
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");

  // Project Brain
  const [generating, setGenerating] = useState(false);
  const [suggestedMode, setSuggestedMode] = useState<string | null>(null);
  const [backups, setBackups] = useState<string[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    soon: true,
    later: true,
    done: true,
  });

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const nowList = projects.filter(
    (p) => p.status !== "completed" && p.horizon === "now",
  );
  const soonList = projects.filter(
    (p) => p.status !== "completed" && p.horizon === "soon",
  );
  const laterList = projects.filter(
    (p) => p.status !== "completed" && p.horizon === "later",
  );
  const doneList = projects.filter((p) => p.status === "completed");
  const visualMode = getPrefs().visualMode;
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";
  const current = useMemo(
    () => projects.find((p) => p.id === detailId) ?? null,
    [projects, detailId],
  );

  function startCreate() {
    setWhat("");
    setWhy("");
    setStep(0);
    setView("create");
  }

  function finishCreate() {
    const next = saveProject({
      name: what.trim() || "Untitled project",
      goal: why.trim(),
      status: "in-progress",
      nextAction: "",
    });
    setProjects(next);
    setDetailId(next[0]?.id ?? null);
    setView("detail");
  }

  function patch(id: string, changes: Partial<Project>) {
    setProjects(saveProject({ id, ...changes }));
  }

  const MODE_LABEL: Record<string, string> = {
    focus: "Focus Session",
    "time-block": "Time Block",
    reset: "Reset / Breathe",
    chat: "Talk it through in chat",
  };

  async function generateNextAction(p: Project, modifier?: string) {
    setGenerating(true);
    setSuggestedMode(null);
    setBackups([]);
    try {
      const day = getDayState();
      const res = await fetch("/api/project-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          goal: p.goal,
          status: p.status,
          lastAction: p.nextAction,
          energy: day?.energy ?? "medium",
          overwhelm: day?.overwhelm ?? "low",
          modifier,
        }),
      });
      const data = await res.json();
      if (res.ok && data.nextAction) {
        patch(p.id, {
          nextAction: data.nextAction,
          status: (data.status as ProjectStatus) ?? p.status,
        });
        setSuggestedMode(data.mode ?? null);
        setBackups(Array.isArray(data.backups) ? data.backups : []);
        logMomentum("move", `Moved forward: ${p.name}`);
      }
    } catch {
      /* keep the existing next action */
    } finally {
      setGenerating(false);
    }
  }

  // Promote a backup option into the primary next action.
  function useBackup(p: Project, text: string) {
    patch(p.id, { nextAction: text });
    setBackups((b) => b.filter((x) => x !== text));
  }

  function renderCard(p: Project) {
    return (
      <li key={p.id}>
        <button
          type="button"
          onClick={() => {
            setDetailId(p.id);
            setView("detail");
          }}
          style={
            colorOn
              ? {
                  borderLeftWidth: 5,
                  borderLeftColor: p.color,
                  ...(decorative ? { backgroundColor: `${p.color}0d` } : {}),
                }
              : undefined
          }
          className="w-full rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-base font-semibold text-[#1f1c19]">
              {colorOn && (
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: p.color }}
                />
              )}
              {p.name}
            </span>
            <span className="rounded-full bg-[#1e4f4f]/10 px-2.5 py-0.5 text-xs font-semibold text-[#1e4f4f]">
              {PROJECT_STATUS_LABEL[p.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6b635a]">
            {p.horizon === "now"
              ? `Next: ${p.nextAction.trim() || "—"}`
              : p.goal.trim() || "—"}
          </p>
        </button>
      </li>
    );
  }

  function renderSection(
    key: string,
    label: string,
    items: Project[],
    hint: string,
  ) {
    if (items.length === 0) return null;
    const isCollapsed = collapsed[key];
    return (
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setCollapsed((c) => ({ ...c, [key]: !c[key] }))}
          className="flex w-full items-center gap-2 text-left"
        >
          <span className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            {label}
          </span>
          <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
            {items.length}
          </span>
          <span className="ml-auto text-sm text-[#6b635a]">
            {isCollapsed ? "▸" : "▾"}
          </span>
        </button>
        {!isCollapsed && (
          <>
            {hint && <p className="mt-1 text-xs text-[#9a8f82]">{hint}</p>}
            <ul className="mt-3 flex flex-col gap-3">{items.map(renderCard)}</ul>
          </>
        )}
      </div>
    );
  }

  // ---- Guided create ------------------------------------------------------
  if (view === "create") {
    const isLast = step === 1;
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <p className="text-sm font-medium text-[#9a8f82]">
          New project · step {step + 1} of 2
        </p>
        <p className="mt-2 text-2xl font-semibold leading-snug text-[#1f1c19]">
          {step === 0
            ? "What are you trying to build?"
            : "Why does this matter right now?"}
        </p>
        <textarea
          value={step === 0 ? what : why}
          onChange={(e) =>
            step === 0 ? setWhat(e.target.value) : setWhy(e.target.value)
          }
          placeholder={
            step === 0
              ? "e.g. Grow my Instagram audience"
              : "A sentence on why it matters"
          }
          className="mt-6 min-h-[140px] flex-1 resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
        <div className="mt-6 flex justify-between gap-2">
          <button
            type="button"
            onClick={() => (step === 0 ? setView("list") : setStep(0))}
            className="rounded-xl border-2 border-[#1e4f4f] bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            type="button"
            disabled={step === 0 && !what.trim()}
            onClick={() => (isLast ? finishCreate() : setStep(1))}
            className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white disabled:bg-[#9aaba8]"
          >
            {isLast ? "Create project" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  // ---- Project detail (dashboard: main action + support panel) ------------
  if (view === "detail" && current) {
    const day = getDayState();
    const runMode = () => {
      if (suggestedMode === "focus") {
        patch(current.id, { status: "active-focus" });
        onOpen?.("focus-timer");
      } else if (suggestedMode === "time-block") {
        onOpen?.("time-block");
      } else if (suggestedMode === "reset") {
        onOpen?.("breathe");
      } else if (suggestedMode === "chat") {
        onAsk?.(`Help me think through my project "${current.name}".`);
      }
    };
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-4xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView("list")}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ All projects
        </button>

        <div className="mt-2 flex flex-col gap-6 lg:flex-row">
          {/* LEFT — main action area */}
          <div className="lg:flex-1">
            <p className="text-2xl font-semibold text-[#1f1c19]">
              {current.name}
            </p>
            {current.goal && (
              <p className="mt-1 text-base text-[#6b635a]">{current.goal}</p>
            )}

            {current.horizon === "now" ? (
              <>
            {/* Next action centerpiece */}
            <div className="mt-5 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.06] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
                Your next step
              </p>
              <p className="mt-2 text-xl font-semibold leading-snug text-[#1f1c19]">
                {current.nextAction.trim() ||
                  "Tap “Refresh next step” and I’ll give you one."}
              </p>

              {backups.length > 0 && (
                <div className="mt-3 border-t border-[#1e4f4f]/15 pt-3">
                  <p className="text-xs font-semibold text-[#6b635a]">
                    Or, if that&apos;s not it:
                  </p>
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {backups.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => useBackup(current, b)}
                        className="flex items-start gap-2 rounded-lg px-2 py-1 text-left text-sm text-[#1f1c19] hover:bg-[#1e4f4f]/10"
                      >
                        <span className="text-[#1e4f4f]">↳</span>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => generateNextAction(current)}
                  disabled={generating}
                  className="rounded-lg bg-[#1e4f4f] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
                >
                  {generating ? "Thinking…" : "🔄 Refresh next step"}
                </button>
                <button
                  type="button"
                  onClick={() => generateNextAction(current, "smaller")}
                  disabled={generating}
                  className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3.5 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-50"
                >
                  Make it smaller
                </button>
                <button
                  type="button"
                  onClick={() => generateNextAction(current, "blocked")}
                  disabled={generating}
                  className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3.5 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-50"
                >
                  I can&apos;t do this
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  patch(current.id, { status: "active-focus" });
                  onOpen?.("focus-timer");
                }}
                className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                ▶ Start Focus Session
              </button>
              <button
                type="button"
                onClick={() => onOpen?.("time-block")}
                className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f]"
              >
                ⏱ Schedule Time Block
              </button>
              <button
                type="button"
                onClick={() => generateNextAction(current, "breakdown")}
                disabled={generating}
                className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f] disabled:opacity-50"
              >
                🔄 Break this down
              </button>
            </div>
              </>
            ) : (
              <div className="mt-5 rounded-2xl border border-[#d4cdc3] bg-white/70 p-5">
                <p className="text-base text-[#6b635a]">
                  This is a {PROJECT_HORIZON_LABEL[current.horizon]} project —
                  lightly tracked, not generating daily actions yet.
                </p>
                <button
                  type="button"
                  onClick={() => patch(current.id, { horizon: "now" })}
                  className="mt-3 rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
                >
                  Activate → move to Now
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — light support panel */}
          <aside className="shrink-0 rounded-2xl border border-[#d4cdc3] bg-white/70 p-4 lg:w-72">
            <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Time horizon
            </p>
            <select
              value={current.horizon}
              onChange={(e) =>
                patch(current.id, {
                  horizon: e.target.value as ProjectHorizon,
                })
              }
              className="mt-1.5 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              {(["now", "soon", "later"] as ProjectHorizon[]).map((h) => (
                <option key={h} value={h}>
                  {PROJECT_HORIZON_LABEL[h]}
                </option>
              ))}
            </select>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Status
            </p>
            <select
              value={current.status}
              onChange={(e) =>
                patch(current.id, { status: e.target.value as ProjectStatus })
              }
              className="mt-1.5 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABEL[s]}
                </option>
              ))}
            </select>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Color
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {PROJECT_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label="Set project color"
                  onClick={() => patch(current.id, { color: c })}
                  className="h-6 w-6 rounded-full"
                  style={{
                    background: c,
                    outline: current.color === c ? "2px solid #1f1c19" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>

            {day && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                  Energy today
                </p>
                <p className="mt-1 text-sm capitalize text-[#3d3630]">
                  {day.energy} energy · {day.overwhelm} overwhelm
                </p>
              </div>
            )}

            {suggestedMode && MODE_LABEL[suggestedMode] && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                  Suggested
                </p>
                <button
                  type="button"
                  onClick={runMode}
                  className="mt-1 text-sm font-semibold text-[#1e4f4f] underline"
                >
                  → {MODE_LABEL[suggestedMode]}
                </button>
              </div>
            )}

            <div className="mt-4">
              {!showNotes ? (
                <button
                  type="button"
                  onClick={() => setShowNotes(true)}
                  className="text-sm font-semibold text-[#1e4f4f]"
                >
                  + Quick brain dump
                </button>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                    Quick brain dump
                  </p>
                  <textarea
                    value={current.notes ?? ""}
                    onChange={(e) => patch(current.id, { notes: e.target.value })}
                    placeholder="Anything to remember"
                    className="mt-1.5 min-h-[70px] w-full resize-none rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setProjects(deleteProject(current.id));
                setView("list");
              }}
              className="mt-4 text-sm font-semibold text-[#a85c4a] hover:underline"
            >
              Delete project
            </button>
          </aside>
        </div>
      </div>
    );
  }

  // ---- List ---------------------------------------------------------------
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-[#1f1c19]">Projects</p>
        <button
          type="button"
          onClick={startCreate}
          className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          + New Project
        </button>
      </div>
      <p className="mt-1 text-base text-[#6b635a]">
        The things you&apos;re actively building.
      </p>

      {projects.length === 0 ? (
        <p className="mt-6 text-base text-[#6b635a]">
          Nothing yet. Tap “New Project” and I&apos;ll set it up with you.
        </p>
      ) : (
        <>
          {renderSection(
            "now",
            "⚡ Now",
            nowList,
            "Actively managed — one next action each.",
          )}
          {renderSection(
            "soon",
            "🟡 Soon",
            soonList,
            "Planned — lightly tracked, no daily actions yet.",
          )}
          {renderSection(
            "later",
            "🅿️ Parked",
            laterList,
            "Not active yet — no daily pressure. Activate anytime.",
          )}
          {renderSection("done", "✓ Done", doneList, "")}
        </>
      )}

      {/* Add from… — Projects pull from the separate systems (templates,
          strategies, brain dump) like a tool picker, not a folder. */}
      <div className="mt-7">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Add from…
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpen?.("templates-library")}
            className="rounded-xl border border-[#1e4f4f]/25 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
          >
            📚 Templates
          </button>
          <button
            type="button"
            onClick={() => onOpen?.("playbook")}
            className="rounded-xl border border-[#1e4f4f]/25 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
          >
            🎯 Strategies
          </button>
          <button
            type="button"
            onClick={() => onOpen?.("brain-dump")}
            className="rounded-xl border border-[#1e4f4f]/25 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
          >
            🧠 Brain Dump
          </button>
        </div>
      </div>
    </div>
  );
}

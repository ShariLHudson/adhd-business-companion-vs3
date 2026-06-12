"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  timeBlocksForProject,
  type Project,
  type ProjectHorizon,
  type ProjectStatus,
} from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";
import type {
  WorkspaceFieldId,
  WorkspacePanelDetail,
} from "@/lib/workspaceAwareness";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import { getCurrentSopStep, type WorkspaceSession } from "@/lib/workspaceSop";
import { useWorkspaceFieldFocus } from "@/lib/useWorkspaceFieldFocus";
import { WorkspaceSopField, isSopPanelField } from "@/components/companion/WorkspaceSopField";
import { WorkspaceSopProgress } from "@/components/companion/WorkspaceSopProgress";

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
  initialProjectId,
  onContextChange,
  focusField,
  focusStamp = 0,
  bootstrapCreate,
  onBootstrapDone,
  chatFieldFill,
  workspaceWorkflowAction,
  sopSession,
  onSopFieldChange,
  onProjectSaved,
  onBuildWithShari,
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
  initialProjectId?: string | null;
  onContextChange?: (detail: WorkspacePanelDetail) => void;
  focusField?: WorkspaceFieldId | null;
  focusStamp?: number;
  /** Open create flow immediately (workspace accept). */
  bootstrapCreate?: boolean;
  onBootstrapDone?: () => void;
  /** Apply a value from chat into the visible workspace field. */
  chatFieldFill?: {
    field: WorkspaceFieldId;
    value: string;
    stepId?: string;
    key: number;
  } | null;
  workspaceWorkflowAction?: {
    type: "advance" | "confirm" | "skip";
    key: number;
  } | null;
  sopSession?: WorkspaceSession | null;
  onSopFieldChange?: (stepId: string, value: string) => void;
  onProjectSaved?: (projectId: string, projectTitle: string) => void;
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

  useEffect(() => {
    if (!initialProjectId) return;
    const list = getProjects();
    if (list.some((p) => p.id === initialProjectId)) {
      setDetailId(initialProjectId);
      setView("detail");
    }
  }, [initialProjectId]);

  // Declared before the effects that depend on it (avoids a TDZ crash).
  const current = useMemo(
    () => projects.find((p) => p.id === detailId) ?? null,
    [projects, detailId],
  );

  const lastReportedDetail = useRef<string>("");

  useEffect(() => {
    if (!onContextChange) return;

    let detail;
    if (view === "list") {
      detail = {
        view: "list" as const,
        stage: "Project list",
        selectedItemId: null,
        selectedItemName: null,
        selectedItemStatus: null,
        selectedItemHorizon: null,
        nextAction: null,
      };
    } else if (view === "create") {
      detail = {
        view: "create" as const,
        stage:
          step === 0
            ? "Creating project — title (what you're building)"
            : "Creating project — outcome (why it matters)",
        selectedItemId: null,
        selectedItemName: what.trim() || null,
        selectedItemGoal: why.trim() || null,
        selectedItemStatus: "Draft (not saved yet)",
        selectedItemHorizon: null,
        nextAction: null,
      };
    } else if (view === "detail" && current) {
      detail = {
        view: "detail" as const,
        stage: "Project detail",
        selectedItemId: current.id,
        selectedItemName: current.name,
        selectedItemGoal: current.goal.trim() || null,
        selectedItemStatus: PROJECT_STATUS_LABEL[current.status],
        selectedItemHorizon: PROJECT_HORIZON_LABEL[current.horizon],
        nextAction: current.nextAction.trim() || null,
      };
    } else {
      return;
    }

    const sig = JSON.stringify(detail);
    if (sig === lastReportedDetail.current) return;
    lastReportedDetail.current = sig;
    onContextChange(detail);
  }, [view, step, what, why, current, onContextChange]);

  const focusElementId =
    focusField === "project-title"
      ? "workspace-field-project-title"
      : focusField === "project-goal"
        ? "workspace-field-project-goal"
        : focusField === "project-next-action"
          ? "workspace-field-project-next-action"
          : null;

  useWorkspaceFieldFocus(focusField, focusStamp, focusElementId, [view, step]);

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

  function startCreate() {
    setWhat("");
    setWhy("");
    setStep(0);
    setView("create");
  }

  const bootstrapDoneRef = useRef(false);
  useEffect(() => {
    if (!bootstrapCreate) {
      bootstrapDoneRef.current = false;
      return;
    }
    if (bootstrapDoneRef.current) return;
    bootstrapDoneRef.current = true;
    startCreate();
    onBootstrapDone?.();
  }, [bootstrapCreate, onBootstrapDone]);

  const sessionBootstrappedRef = useRef(false);
  useEffect(() => {
    if (!sopSession || sessionBootstrappedRef.current) return;

    if (sopSession.projectId && sopSession.savedStatus === "saved") {
      const list = getProjects();
      if (list.some((p) => p.id === sopSession.projectId)) {
        sessionBootstrappedRef.current = true;
        setDetailId(sopSession.projectId);
        setView("detail");
        return;
      }
    }

    const hasCreateState =
      sopSession.workflowId === "workshop" ||
      sopSession.workflowId === "project" ||
      Boolean(sopSession.projectTitle) ||
      Boolean(sopSession.acceptedValues["workshop-title"]) ||
      Boolean(sopSession.acceptedValues["project-name"]);

    if (hasCreateState && sopSession.savedStatus !== "saved") {
      sessionBootstrappedRef.current = true;
      const title =
        sopSession.acceptedValues["workshop-title"] ??
        sopSession.acceptedValues["project-name"] ??
        sopSession.projectTitle ??
        "";
      const outcome =
        sopSession.acceptedValues["workshop-outcome"] ??
        sopSession.acceptedValues["project-outcome"] ??
        "";
      setWhat(title);
      setWhy(outcome);
      const stepField = getCurrentSopStep(sopSession).fieldId;
      setStep(stepField === "project-goal" ? 1 : 0);
      setView("create");
    }
  }, [sopSession]);

  function finishCreate() {
    const name = what.trim() || "Untitled project";
    const next = saveProject({
      name,
      goal: why.trim(),
      status: "in-progress",
      nextAction: "",
    });
    setProjects(next);
    const created = next[0]!;
    setDetailId(created.id);
    setView("detail");
    onProjectSaved?.(created.id, created.name);
    void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
      trackEcosystemEvent({
        eventType: "feature.project_created",
        feature: "projects",
        metadata: { projectId: created.id },
      });
    });
  }

  function patch(id: string, changes: Partial<Project>) {
    setProjects(saveProject({ id, ...changes }));
    void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
      trackEcosystemEvent({
        eventType: "feature.project_updated",
        feature: "projects",
        metadata: { projectId: id, field: Object.keys(changes).join(",") || "updated" },
      });
    });
  }

  const appliedChatFillKey = useRef<number | null>(null);
  const appliedWorkflowKey = useRef<number | null>(null);
  const currentRef = useRef(current);
  currentRef.current = current;

  useEffect(() => {
    if (!chatFieldFill) return;
    if (appliedChatFillKey.current === chatFieldFill.key) return;
    appliedChatFillKey.current = chatFieldFill.key;

    const { field, value, stepId } = chatFieldFill;
    if (field === "project-title") {
      if (view !== "create") {
        setWhat("");
        setWhy("");
        setStep(0);
        setView("create");
      }
      setWhat(value);
      if (stepId) onSopFieldChange?.(stepId, value);
      return;
    }
    if (field === "project-goal") {
      setWhy(value);
      setStep((s) => (s === 0 && value ? 1 : s));
      if (stepId) onSopFieldChange?.(stepId, value);
      const proj = currentRef.current;
      if (view === "detail" && proj) {
        patch(proj.id, { goal: value });
      }
      return;
    }
    if (isSopPanelField(field) && stepId) {
      onSopFieldChange?.(stepId, value);
    }
  }, [chatFieldFill, onSopFieldChange, view]);

  const sopTitle =
    sopSession?.acceptedValues["workshop-title"] ??
    sopSession?.acceptedValues["project-name"] ??
    "";
  const sopOutcome =
    sopSession?.acceptedValues["workshop-outcome"] ??
    sopSession?.acceptedValues["project-outcome"] ??
    "";
  const sopStepField = sopSession
    ? getCurrentSopStep(sopSession).fieldId
    : null;

  useEffect(() => {
    if (!sopSession || view !== "create") return;
    if (sopTitle) setWhat((w) => (w === sopTitle ? w : sopTitle));
    if (sopOutcome) setWhy((w) => (w === sopOutcome ? w : sopOutcome));
    if (sopStepField === "project-goal") setStep((s) => (s === 1 ? s : 1));
    if (sopStepField === "project-title") setStep((s) => (s === 0 ? s : 0));
  }, [sopTitle, sopOutcome, sopStepField, view, sopSession]);

  useEffect(() => {
    if (!workspaceWorkflowAction) return;
    if (appliedWorkflowKey.current === workspaceWorkflowAction.key) return;
    appliedWorkflowKey.current = workspaceWorkflowAction.key;

    if (view !== "create" || step !== 0) return;
    const { type } = workspaceWorkflowAction;
    const canAdvance =
      type === "skip" ||
      (what.trim() && (type === "advance" || type === "confirm"));
    if (canAdvance) {
      setStep(1);
    }
  }, [workspaceWorkflowAction, view, step, what]);

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
      <div className="companion-fade-in flex h-full flex-col">
        <WorkspaceSopProgress session={sopSession ?? null} />
        <div className="mx-auto flex max-w-xl flex-1 flex-col overflow-y-auto px-6 py-8">
        <p className="text-sm font-medium text-[#9a8f82]">
          New project · step {step + 1} of 2
        </p>
        <p className="mt-2 text-2xl font-semibold leading-snug text-[#1f1c19]">
          {step === 0
            ? "What are you trying to build?"
            : "Why does this matter right now?"}
        </p>
        <textarea
          id={
            step === 0
              ? "workspace-field-project-title"
              : "workspace-field-project-goal"
          }
          value={step === 0 ? what : why}
          onChange={(e) => {
            const v = e.target.value;
            if (step === 0) {
              setWhat(v);
              if (sopSession && onSopFieldChange) {
                const sid =
                  sopSession.workflowId === "workshop"
                    ? "workshop-title"
                    : "project-name";
                onSopFieldChange(sid, v);
              }
            } else {
              setWhy(v);
              if (sopSession && onSopFieldChange) {
                const sid =
                  sopSession.workflowId === "workshop"
                    ? "workshop-outcome"
                    : "project-outcome";
                onSopFieldChange(sid, v);
              }
            }
          }}
          placeholder={
            step === 0
              ? "e.g. Grow my Instagram audience"
              : "A sentence on why it matters"
          }
          className="mt-6 min-h-[140px] flex-1 resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
        {sopSession && onSopFieldChange && (
          <WorkspaceSopField
            session={sopSession}
            focusField={focusField}
            focusStamp={focusStamp}
            values={sopSession.acceptedValues as Record<string, string>}
            onChange={onSopFieldChange}
          />
        )}
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
            <p
              id="workspace-field-project-goal"
              className={`mt-1 text-base text-[#6b635a] ${current.goal ? "" : "italic"}`}
            >
              {current.goal || "Outcome — tell Shari in chat or add one sentence here later."}
            </p>

            {onBuildWithShari && (
              <button
                type="button"
                onClick={() =>
                  onBuildWithShari({
                    itemType: "Project",
                    title: current.name,
                    draftContent: [
                      current.goal,
                      current.nextAction,
                      current.notes,
                    ]
                      .filter(Boolean)
                      .join("\n\n"),
                    brief: current.goal || current.name,
                    linkedProjectId: current.id,
                    linkedProjectName: current.name,
                    stage: "working on project",
                  })
                }
                className="mt-3 self-start rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                ✨ Work On This With Shari
              </button>
            )}

            {current.horizon === "now" ? (
              <>
            {/* Next action centerpiece */}
            <div
              id="workspace-field-project-next-action"
              className="mt-5 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.06] p-5"
            >
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

            {/* Upcoming scheduled blocks — the project's next work sessions. */}
            {(() => {
              const blocks = timeBlocksForProject(current.id);
              if (blocks.length === 0) return null;
              const fmt = (date: string, time: string) =>
                new Date(`${date}T${time || "00:00"}`).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });
              return (
                <div className="mt-4 rounded-2xl border border-[#d4cdc3] bg-white/85 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                    Upcoming scheduled blocks
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {blocks.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-baseline justify-between gap-3 rounded-lg border border-[#e4ddd2] bg-white px-3 py-2"
                      >
                        <span className="min-w-0 truncate text-sm font-semibold text-[#1f1c19]">
                          {b.title}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-[#1e4f4f]">
                          {fmt(b.date, b.startTime)} · {b.durationMin} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

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
            🧠 Clear My Mind
          </button>
        </div>
      </div>
    </div>
  );
}

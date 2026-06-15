"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteProject,
  getDayState,
  getProjectItems,
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
import { sortByDropdownLabel } from "@/lib/dropdownSort";
import { ProjectBreakdown } from "@/components/companion/ProjectBreakdown";
import { CollapsibleSection } from "@/components/companion/CollapsibleSection";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
import { useVisualMode } from "@/lib/useVisualMode";
import {
  groupProjectsByList,
  groupTimeBlocksByDate,
  PROJECT_LIST_GROUP_LABEL,
  TIME_BLOCK_GROUP_LABEL,
  type ProjectListGroup,
  type TimeBlockDateGroup,
} from "@/lib/projectGrouping";
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

const SORTED_STATUSES = sortByDropdownLabel(
  STATUSES,
  (s) => PROJECT_STATUS_LABEL[s],
);

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
  const [view, setView] = useState<
    "list" | "create-source" | "create" | "detail"
  >("list");
  const [detailId, setDetailId] = useState<string | null>(null);

  // Guided create
  const [step, setStep] = useState(0);
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");

  // Project Brain
  const [generating, setGenerating] = useState(false);
  const [backups, setBackups] = useState<string[]>([]);
  const [listGroupsOpen, setListGroupsOpen] = useState<
    Record<ProjectListGroup, boolean>
  >({
    active: false,
    "not-started": false,
    completed: false,
  });
  const [detailSectionsOpen, setDetailSectionsOpen] = useState<
    Record<string, boolean>
  >({});

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
    } else if (view === "create-source") {
      detail = {
        view: "create" as const,
        stage: "Choosing how to start a project",
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

  const projectGroups = groupProjectsByList(projects);
  const visualMode = useVisualMode();
  const colorOn = visualMode !== "off";

  function startCreate() {
    setView("create-source");
  }

  function startBlankCreate() {
    setWhat("");
    setWhy("");
    setStep(0);
    setView("create");
  }

  function toggleListGroup(id: string) {
    setListGroupsOpen((g) => ({
      ...g,
      [id]: !g[id as ProjectListGroup],
    }));
  }

  function toggleDetailSection(id: string) {
    setDetailSectionsOpen((s) => ({ ...s, [id]: !s[id] }));
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

  async function generateNextAction(p: Project, modifier?: string) {
    setGenerating(true);
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
            setDetailSectionsOpen({});
            setView("detail");
          }}
          style={
            colorOn
              ? {
                  borderLeftWidth: 4,
                  borderLeftColor: p.color,
                }
              : undefined
          }
          className="w-full rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/40 hover:bg-white"
        >
          <span className="flex items-center gap-2 text-base font-semibold text-[#1f1c19]">
            {colorOn && (
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: p.color }}
              />
            )}
            {p.name}
          </span>
        </button>
      </li>
    );
  }

  function renderListGroup(group: ProjectListGroup) {
    const items = projectGroups[group];
    if (items.length === 0) return null;
    return (
      <CollapsibleSection
        key={group}
        id={group}
        title={PROJECT_LIST_GROUP_LABEL[group]}
        count={items.length}
        open={listGroupsOpen[group]}
        onToggle={toggleListGroup}
        className="mt-3"
      >
        <ul className="flex flex-col gap-2">{items.map(renderCard)}</ul>
      </CollapsibleSection>
    );
  }

  // ---- New project — pick source ------------------------------------------
  if (view === "create-source") {
    const sources = [
      {
        id: "blank",
        label: "Blank Project",
        emoji: "📁",
        hint: "Name it and define the outcome",
        action: startBlankCreate,
      },
      {
        id: "template",
        label: "Template",
        emoji: "📚",
        hint: "Start from a reusable pattern",
        action: () => onOpen?.("templates-library"),
      },
      {
        id: "strategy",
        label: "Strategy",
        emoji: "🎯",
        hint: "Pull from your playbook",
        action: () => onOpen?.("playbook"),
      },
      {
        id: "brain-dump",
        label: "Clear My Mind",
        emoji: "🧠",
        hint: "Capture thoughts, then turn one into a project",
        action: () => onOpen?.("brain-dump"),
      },
    ] as const;
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView("list")}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Back
        </button>
        <p className="mt-4 text-2xl font-semibold text-[#1f1c19]">New Project</p>
        <p className="mt-1 text-base text-[#6b635a]">
          How would you like to start?
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {sources.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={s.action}
              className="flex items-start gap-3 rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-3 text-left hover:border-[#1e4f4f]/40"
            >
              <span className="text-2xl">{s.emoji}</span>
              <span>
                <span className="block text-base font-semibold text-[#1f1c19]">
                  {s.label}
                </span>
                <span className="mt-0.5 block text-sm text-[#6b635a]">
                  {s.hint}
                </span>
              </span>
            </button>
          ))}
        </div>
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
            onClick={() => (step === 0 ? setView("create-source") : setStep(0))}
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

  // ---- Project detail — progressive disclosure ----------------------------
  if (view === "detail" && current) {
    const blocks = timeBlocksForProject(current.id);
    const blockGroups = groupTimeBlocksByDate(blocks);
    const blockGroupOrder: TimeBlockDateGroup[] = [
      "today",
      "week",
      "upcoming",
      "bank",
      "completed",
    ];
    const fmt = (date: string, time: string) =>
      date
        ? new Date(`${date}T${time || "00:00"}`).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "Time Bank";

    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView("list")}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ All projects
        </button>

        <p className="mt-3 text-2xl font-semibold text-[#1f1c19]">
          {current.name}
        </p>

        <div className="mt-4 flex flex-col gap-1">
          <CollapsibleSection
            id="overview"
            title="Overview"
            open={!!detailSectionsOpen.overview}
            onToggle={toggleDetailSection}
          >
            <div className="space-y-4 rounded-xl border border-[#e4ddd2] bg-white/90 p-4">
              <p
                id="workspace-field-project-goal"
                className={`text-base text-[#6b635a] ${current.goal ? "" : "italic"}`}
              >
                {current.goal || "Add a one-line outcome when you're ready."}
              </p>

              {current.horizon === "now" && (
                <div id="workspace-field-project-next-action">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
                    Next step
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#1f1c19]">
                    {current.nextAction.trim() ||
                      "Refresh next step when you want a suggestion."}
                  </p>
                  {backups.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {backups.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => useBackup(current, b)}
                          className="text-left text-sm text-[#1e4f4f] hover:underline"
                        >
                          ↳ {b}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => generateNextAction(current)}
                      disabled={generating}
                      className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {generating ? "Thinking…" : "Suggest next step"}
                    </button>
                    <button
                      type="button"
                      onClick={() => generateNextAction(current, "smaller")}
                      disabled={generating}
                      className="rounded-lg border border-[#1e4f4f]/30 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f]"
                    >
                      Smaller step
                    </button>
                  </div>
                </div>
              )}

              {current.horizon !== "now" && (
                <button
                  type="button"
                  onClick={() => patch(current.id, { horizon: "now" })}
                  className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
                >
                  Activate project
                </button>
              )}

              <div className="flex flex-wrap gap-2 border-t border-[#e4ddd2] pt-3">
                <button
                  type="button"
                  onClick={() => {
                    patch(current.id, { status: "active-focus" });
                    onOpen?.("focus-timer");
                  }}
                  className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                >
                  ▶ Focus session
                </button>
                <button
                  type="button"
                  onClick={() => onOpen?.("time-block")}
                  className="rounded-lg border border-[#1e4f4f]/30 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f]"
                >
                  ⏱ Time block
                </button>
              </div>

              <div className="grid gap-3 border-t border-[#e4ddd2] pt-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-[#6b635a]">
                  Horizon
                  <select
                    value={current.horizon}
                    onChange={(e) =>
                      patch(current.id, {
                        horizon: e.target.value as ProjectHorizon,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-2 py-1.5 text-sm"
                  >
                    {(["now", "soon", "later"] as ProjectHorizon[]).map((h) => (
                      <option key={h} value={h}>
                        {PROJECT_HORIZON_LABEL[h]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-[#6b635a]">
                  Status
                  <select
                    value={current.status}
                    onChange={(e) =>
                      patch(current.id, {
                        status: e.target.value as ProjectStatus,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-2 py-1.5 text-sm"
                  >
                    {SORTED_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {PROJECT_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {PROJECT_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label="Set project color"
                    onClick={() => patch(current.id, { color: c })}
                    className="h-6 w-6 rounded-full"
                    style={{
                      background: c,
                      outline:
                        current.color === c ? "2px solid #1f1c19" : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setProjects(deleteProject(current.id));
                  setView("list");
                }}
                className="text-sm font-semibold text-[#a85c4a] hover:underline"
              >
                Delete project
              </button>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="tasks"
            title="Tasks"
            count={
              getProjectItems(current.id).filter(
                (i) => i.kind === "task" || i.kind === "subtask",
              ).length
            }
            open={!!detailSectionsOpen.tasks}
            onToggle={toggleDetailSection}
          >
            <ProjectBreakdown projectId={current.id} embedded />
          </CollapsibleSection>

          <CollapsibleSection
            id="time-blocks"
            title="Time Blocks"
            count={blocks.length}
            open={!!detailSectionsOpen["time-blocks"]}
            onToggle={toggleDetailSection}
          >
            {blocks.length === 0 ? (
              <p className="text-sm text-[#6b635a]">
                No time blocks yet — schedule one from Overview.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {blockGroupOrder.map((gk) => {
                  const list = blockGroups[gk];
                  if (list.length === 0) return null;
                  return (
                    <CollapsibleSection
                      key={gk}
                      id={`blocks-${gk}`}
                      title={TIME_BLOCK_GROUP_LABEL[gk]}
                      count={list.length}
                      open={!!detailSectionsOpen[`blocks-${gk}`]}
                      onToggle={toggleDetailSection}
                    >
                      <ul className="flex flex-col gap-1.5">
                        {list.map((b) => (
                          <li
                            key={b.id}
                            className="rounded-lg border border-[#e4ddd2] bg-white px-3 py-2 text-sm"
                          >
                            <span className="font-semibold text-[#1f1c19]">
                              {b.title}
                            </span>
                            <span className="ml-2 text-xs text-[#6b635a]">
                              {fmt(b.date, b.startTime)} · {b.durationMin} min
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleSection>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            id="notes"
            title="Notes"
            open={!!detailSectionsOpen.notes}
            onToggle={toggleDetailSection}
          >
            <textarea
              value={current.notes ?? ""}
              onChange={(e) => patch(current.id, { notes: e.target.value })}
              placeholder="Quick notes for this project"
              className="min-h-[100px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
            />
          </CollapsibleSection>

          <CollapsibleSection
            id="conversations"
            title="Conversations"
            open={!!detailSectionsOpen.conversations}
            onToggle={toggleDetailSection}
          >
            <p className="text-sm text-[#6b635a]">
              Use <strong>Ask Shari</strong> in the companion panel to talk
              through this project — chat stays beside you while you work.
            </p>
          </CollapsibleSection>

          <CollapsibleSection
            id="files"
            title="Files"
            open={!!detailSectionsOpen.files}
            onToggle={toggleDetailSection}
          >
            <p className="text-sm text-[#6b635a]">
              Export drafts to Google Docs from Create, or attach links in Notes
              for now.
            </p>
          </CollapsibleSection>
        </div>
      </div>
    );
  }

  // ---- List ---------------------------------------------------------------
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <WorkspaceGuide section="projects" />
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
        Expand a group to see project names — one at a time.
      </p>

      {projects.length === 0 ? (
        <p className="mt-6 text-base text-[#6b635a]">
          Nothing yet. Tap New Project to get started.
        </p>
      ) : (
        <div className="mt-4">
          {renderListGroup("active")}
          {renderListGroup("not-started")}
          {renderListGroup("completed")}
        </div>
      )}
    </div>
  );
}

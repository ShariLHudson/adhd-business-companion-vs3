"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
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
  saveProjectItem,
  timeBlocksForProject,
  type Project,
  type ProjectHorizon,
  type ProjectStatus,
} from "@/lib/companionStore";
import { sortByDropdownLabel } from "@/lib/dropdownSort";
import { ProjectBreakdown } from "@/components/companion/ProjectBreakdown";
import { CollapsibleSection } from "@/components/companion/CollapsibleSection";
import { ProjectAssetsPanel } from "@/components/companion/ProjectAssetsPanel";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { useVisualMode } from "@/lib/useVisualMode";
import {
  groupTimeBlocksByDate,
  recentActiveProjects,
  sortProjects,
  TIME_BLOCK_GROUP_LABEL,
  type ProjectListSort,
  type TimeBlockDateGroup,
} from "@/lib/projectGrouping";
import { initialSectionOpen } from "@/lib/expandableUi";
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
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import {
  listUnifiedProjectFiles,
  PROJECT_FILES_UPDATED,
} from "@/lib/projectFiles";
import { PROJECT_ASSETS_UPDATED } from "@/lib/projectAssets";
import { PROJECT_EXECUTION_LINKS_UPDATED } from "@/lib/projectExecutionLinks";
import {
  countProjectConversations,
  listProjectConversations,
  PROJECT_CONVERSATIONS_UPDATED,
  type ProjectConversationEntry,
} from "@/lib/projectConversations";
import { listProjectAssetNotes, listProjectAssetFiles } from "@/lib/projectAssets";
import { listProjectLinks } from "@/lib/projectLinks";

function initialProjectView(
  resumeProjectId?: string | null,
): {
  view: "list" | "create-source" | "create" | "detail";
  detailId: string | null;
} {
  if (!resumeProjectId) return { view: "list", detailId: null };
  const exists = getProjects().some((p) => p.id === resumeProjectId);
  return exists
    ? { view: "detail", detailId: resumeProjectId }
    : { view: "list", detailId: null };
}

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
  onOpenTimeBlock,
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
  resumeProjectId,
  onResumeConsumed,
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onOpenTimeBlock?: (projectId: string, blockId?: string) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
  /** Open one project on mount — explicit Resume/Continue only, not sidebar browse. */
  resumeProjectId?: string | null;
  onResumeConsumed?: () => void;
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
  >(() => initialProjectView(resumeProjectId).view);
  const [detailId, setDetailId] = useState<string | null>(
    () => initialProjectView(resumeProjectId).detailId,
  );
  const [listQuery, setListQuery] = useState("");
  const [listSort, setListSort] = useState<ProjectListSort>("recent");
  const [expandedListIds, setExpandedListIds] = useState<Record<string, boolean>>(
    {},
  );
  const [recentSectionOpen, setRecentSectionOpen] = useState(initialSectionOpen);
  const [allProjectsSectionOpen, setAllProjectsSectionOpen] = useState(initialSectionOpen);
  const [completedOpen, setCompletedOpen] = useState(initialSectionOpen);

  // Guided create
  const [step, setStep] = useState(0);
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");

  // Project Brain
  const [generating, setGenerating] = useState(false);
  const [backups, setBackups] = useState<string[]>([]);
  const [detailSectionsOpen, setDetailSectionsOpen] = useState<
    Record<string, boolean>
  >({});
  const [projectDataTick, setProjectDataTick] = useState(0);
  const [newGoal, setNewGoal] = useState("");

  const visualMode = useVisualMode();
  const colorOn = visualMode !== "off";

  useEffect(() => {
    const bump = () => setProjectDataTick((n) => n + 1);
    window.addEventListener(PROJECT_CONVERSATIONS_UPDATED, bump);
    window.addEventListener(PROJECT_ASSETS_UPDATED, bump);
    window.addEventListener("project-links-updated", bump);
    window.addEventListener("project-files-updated", bump);
    window.addEventListener(PROJECT_EXECUTION_LINKS_UPDATED, bump);
    window.addEventListener(PROJECT_FILES_UPDATED, bump);
    return () => {
      window.removeEventListener(PROJECT_CONVERSATIONS_UPDATED, bump);
      window.removeEventListener(PROJECT_ASSETS_UPDATED, bump);
      window.removeEventListener("project-links-updated", bump);
      window.removeEventListener("project-files-updated", bump);
      window.removeEventListener(PROJECT_EXECUTION_LINKS_UPDATED, bump);
      window.removeEventListener(PROJECT_FILES_UPDATED, bump);
    };
  }, []);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    if (!resumeProjectId) return;
    const list = getProjects();
    if (list.some((p) => p.id === resumeProjectId)) {
      setDetailId(resumeProjectId);
      setDetailSectionsOpen({});
      setView("detail");
      onResumeConsumed?.();
    }
  }, [resumeProjectId, onResumeConsumed]);

  // Declared before the effects that depend on it (avoids a TDZ crash).
  const current = useMemo(
    () => projects.find((p) => p.id === detailId) ?? null,
    [projects, detailId],
  );

  const projectConversations = useMemo((): ProjectConversationEntry[] => {
    if (!current) return [];
    void projectDataTick;
    return listProjectConversations(current.id);
  }, [current, projectDataTick]);

  const projectAssetCount = useMemo(() => {
    if (!current) return 0;
    void projectDataTick;
    const unified = listUnifiedProjectFiles(current.id).filter(
      (f) => f.category !== "links" && !f.id.startsWith("upload:"),
    );
    return (
      listProjectAssetFiles(current.id).length +
      unified.length +
      listProjectLinks(current.id).length +
      listProjectAssetNotes(current.id).length
    );
  }, [current, projectDataTick]);

  const lastReportedDetail = useRef<string>("");

  useEffect(() => {
    if (!onContextChange) return;

    // Avoid wiping parent context while bootstrapping to initialProjectId.
    if (view === "list" && resumeProjectId && !detailId) return;

    let detail;
    if (view === "list") {
      detail = {
        view: "list" as const,
        stage: "Project list",
        selectedItemId: null,
        selectedItemName: null,
        selectedItemStatus: null,
        selectedItemHorizon: null,
        showProjectColor: colorOn,
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
      const taskCount = getProjectItems(current.id).filter(
        (i) => i.kind === "task" || i.kind === "subtask",
      ).length;
      const openSections = Object.entries(detailSectionsOpen)
        .filter(([, open]) => open)
        .map(([id]) => id);
      detail = {
        view: "detail" as const,
        stage: "Project detail",
        selectedItemId: current.id,
        selectedItemName: current.name,
        selectedItemGoal: current.goal.trim() || null,
        selectedItemStatus: PROJECT_STATUS_LABEL[current.status],
        selectedItemHorizon: PROJECT_HORIZON_LABEL[current.horizon],
        selectedItemColor: current.color,
        showProjectColor: colorOn,
        projectConversationCount: countProjectConversations(current.id),
        projectFileCount: projectAssetCount,
        projectTaskCount: taskCount,
        projectGoalCount: (current.goals ?? []).length,
        openDetailSections: openSections,
        nextAction: current.nextAction.trim() || null,
      };
    } else {
      return;
    }

    const sig = JSON.stringify(detail);
    if (sig === lastReportedDetail.current) return;
    lastReportedDetail.current = sig;
    onContextChange(detail);
  }, [view, step, what, why, current, onContextChange, colorOn, projectAssetCount, detailSectionsOpen, resumeProjectId, detailId]);

  const focusElementId =
    focusField === "project-title"
      ? "workspace-field-project-title"
      : focusField === "project-goal"
        ? "workspace-field-project-goal"
        : focusField === "project-next-action"
          ? "workspace-field-project-next-action"
          : null;

  useWorkspaceFieldFocus(focusField, focusStamp, focusElementId, [
    view,
    step,
    detailId,
  ]);

  const recentProjects = useMemo(
    () => recentActiveProjects(projects, 5),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    const base = sortProjects(projects, listSort);
    if (!q) return base;
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.goal.toLowerCase().includes(q) ||
        (p.nextAction ?? "").toLowerCase().includes(q),
    );
  }, [projects, listQuery, listSort]);

  const activeProjects = useMemo(
    () => filteredProjects.filter((p) => p.status !== "completed"),
    [filteredProjects],
  );

  const completedProjects = useMemo(
    () => filteredProjects.filter((p) => p.status === "completed"),
    [filteredProjects],
  );

  const allProjectsList = useMemo(() => activeProjects, [activeProjects]);

  function toggleListSection(id: string) {
    if (id === "recent-projects") {
      setRecentSectionOpen((o) => !o);
      return;
    }
    if (id === "all-projects") {
      setAllProjectsSectionOpen((o) => !o);
      return;
    }
    if (id === "completed-projects") {
      setCompletedOpen((o) => !o);
    }
  }

  function openProject(id: string) {
    setDetailId(id);
    setDetailSectionsOpen({});
    setView("detail");
  }

  function toggleListExpand(id: string) {
    setExpandedListIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function startCreate() {
    setView("create-source");
  }

  function startBlankCreate() {
    setWhat("");
    setWhy("");
    setStep(0);
    setView("create");
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
      const proj = currentRef.current;
      if (view === "detail" && proj) {
        patch(proj.id, { name: value });
        if (stepId) onSopFieldChange?.(stepId, value);
        return;
      }
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
    if (field === "project-goals") {
      const proj = currentRef.current;
      if (view === "detail" && proj) {
        const goals = [...(proj.goals ?? [])];
        if (value.trim() && !goals.includes(value.trim())) {
          patch(proj.id, { goals: [...goals, value.trim()] });
        }
      }
      return;
    }
    if (field === "project-tasks") {
      const proj = currentRef.current;
      if (view === "detail" && proj && value.trim()) {
        const lines = value
          .split("\n")
          .map((line) => line.replace(/^\s*(?:[*•\-]|\d+[.)])\s*/, "").trim())
          .filter(Boolean);
        for (const title of lines) {
          saveProjectItem({
            projectId: proj.id,
            kind: "task",
            title,
          });
        }
        setProjectDataTick((n) => n + 1);
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

  function renderListRow(p: Project) {
    const expanded = Boolean(expandedListIds[p.id]);
    return (
      <li key={p.id} className="border-b border-[#e7dfd4]/70 last:border-b-0">
        <div className="flex items-center gap-1 py-1.5 pl-1 pr-0.5">
          <button
            type="button"
            onClick={() => toggleListExpand(p.id)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${p.name}` : `Expand ${p.name}`}
          >
            <span className="w-3 shrink-0 text-center text-[10px] text-[#9a8f82]">
              {expanded ? "▼" : "▶"}
            </span>
            {colorOn ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: p.color }}
                aria-hidden
              />
            ) : null}
            <span className="min-w-0 truncate text-sm font-medium text-[#1f1c19]">
              {p.name}
            </span>
            <span className="shrink-0 rounded bg-[#f0f5f5] px-1.5 py-0.5 text-[10px] font-semibold text-[#4b6b6b]">
              {PROJECT_STATUS_LABEL[p.status]}
            </span>
          </button>
          <button
            type="button"
            onClick={() => openProject(p.id)}
            className="shrink-0 rounded px-2 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
          >
            Open
          </button>
        </div>
        {expanded ? (
          <div className="border-t border-[#e7dfd4]/50 bg-[#faf7f2]/50 px-3 py-2 text-xs leading-relaxed text-[#6b635a]">
            {p.goal.trim() ? (
              <p>
                <span className="font-semibold text-[#1f1c19]">Outcome:</span>{" "}
                {p.goal}
              </p>
            ) : (
              <p className="text-[#9a8f82]">No outcome written yet.</p>
            )}
            {p.nextAction?.trim() ? (
              <p className="mt-1">
                <span className="font-semibold text-[#1f1c19]">Next:</span>{" "}
                {p.nextAction}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openProject(p.id)}
                className="rounded bg-[#1e4f4f] px-2 py-1 text-xs font-semibold text-white hover:bg-[#163a3a]"
              >
                Open project
              </button>
              <button
                type="button"
                onClick={() => toggleListExpand(p.id)}
                className="rounded px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-black/5"
              >
                Collapse
              </button>
            </div>
          </div>
        ) : null}
      </li>
    );
  }

  function projectListUl(items: Project[]) {
    if (items.length === 0) return null;
    return (
      <ul className="overflow-hidden rounded-lg border border-[#e4ddd2] bg-white/80">
        {items.map((p) => renderListRow(p))}
      </ul>
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
      <div className={workspacePanelShellClass({ width: "narrow", inSplit: true })}>
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
        <div className={`${workspacePanelShellClass({ width: "narrow", inSplit: true })} flex-1 overflow-y-auto`}>
        <p className="text-sm font-medium text-[#9a8f82]">
          New project · step {step + 1} of 2
        </p>
        <p className="mt-2 text-2xl font-semibold leading-snug text-[#1f1c19]">
          {step === 0
            ? "What are you trying to build?"
            : "Why does this matter right now?"}
        </p>
        <VoiceAnswerField
          id={
            step === 0
              ? "workspace-field-project-title"
              : "workspace-field-project-goal"
          }
          value={step === 0 ? what : why}
          onChange={(v) => {
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
          className="mt-6 flex-1"
          inputClassName="min-h-[140px] flex-1 resize-none rounded-2xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          micTitle={
            step === 0
              ? "What are you trying to build?"
              : "Why does this matter right now?"
          }
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
      <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
        <button
          type="button"
          onClick={() => setView("list")}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ All projects
        </button>

        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
          Project name
          <VoiceAnswerField
            id="workspace-field-project-title"
            value={current.name}
            onChange={(v) => patch(current.id, { name: v })}
            placeholder="What are you building?"
            className="mt-1"
            inputClassName="w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-2xl font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            micTitle="Project name"
          />
        </label>

        <div className="mt-4 flex flex-col gap-1">
          <CollapsibleSection
            id="overview"
            title="Overview"
            open={!!detailSectionsOpen.overview}
            onToggle={toggleDetailSection}
          >
            <div className="space-y-4 rounded-xl border border-[#e4ddd2] bg-white/90 p-4">
              <label className="block text-xs font-semibold text-[#6b635a]">
                Outcome
                <VoiceAnswerField
                  id="workspace-field-project-goal"
                  value={current.goal}
                  onChange={(v) => patch(current.id, { goal: v })}
                  placeholder="Why does this matter right now?"
                  className="mt-1"
                  inputClassName="min-h-[72px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  micTitle="Outcome — why it matters"
                />
              </label>

              <div id="workspace-field-project-goals">
                <p className="text-xs font-semibold text-[#6b635a]">Goals</p>
                <ul className="mt-2 space-y-2">
                  {(current.goals ?? []).map((g, i) => (
                    <li
                      key={`${g}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#e4ddd2] bg-white px-3 py-2 text-sm"
                    >
                      <span className="flex-1">{g}</span>
                      <button
                        type="button"
                        onClick={() =>
                          patch(current.id, {
                            goals: (current.goals ?? []).filter((_, j) => j !== i),
                          })
                        }
                        className="text-xs font-semibold text-[#a85c4a]"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add a goal"
                    className="flex-1 rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      const t = newGoal.trim();
                      if (!t) return;
                      const goals = current.goals ?? [];
                      if (goals.includes(t)) return;
                      patch(current.id, { goals: [...goals, t] });
                      setNewGoal("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const t = newGoal.trim();
                      if (!t) return;
                      const goals = current.goals ?? [];
                      if (goals.includes(t)) return;
                      patch(current.id, { goals: [...goals, t] });
                      setNewGoal("");
                    }}
                    className="rounded-xl bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
              </div>

              {current.horizon === "now" && (
                <div id="workspace-field-project-next-action">
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
                    Next step
                    <VoiceAnswerField
                      value={current.nextAction}
                      onChange={(v) => patch(current.id, { nextAction: v })}
                      placeholder="One small step you could take next"
                      className="mt-1"
                      inputClassName="min-h-[56px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-base font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                      micTitle="Next step"
                    />
                  </label>
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
                  onClick={() =>
                    onOpenTimeBlock
                      ? onOpenTimeBlock(current.id)
                      : onOpen?.("time-block")
                  }
                  className="rounded-lg border border-[#1e4f4f]/30 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f]"
                >
                  ⏱ Momentum appointment
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
            title="Momentum Appointments"
            count={blocks.length}
            open={!!detailSectionsOpen["time-blocks"]}
            onToggle={toggleDetailSection}
          >
            {blocks.length === 0 ? (
              <p className="text-sm text-[#6b635a]">
                No momentum appointments yet — add one from Overview.
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
                          <li key={b.id}>
                            <button
                              type="button"
                              onClick={() => onOpenTimeBlock?.(current.id, b.id)}
                              className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#e4ddd2] bg-white px-3 py-2 text-left text-sm transition-colors hover:border-[#1e4f4f]/40 hover:bg-[#f0f5f5]"
                            >
                              <span className="font-semibold text-[#1f1c19]">
                                {b.title}
                              </span>
                              <span className="shrink-0 text-xs text-[#6b635a]">
                                {fmt(b.date, b.startTime)} · {b.durationMin} min
                              </span>
                            </button>
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
            <VoiceAnswerField
              value={current.notes ?? ""}
              onChange={(v) => patch(current.id, { notes: v })}
              placeholder="Quick notes for this project"
              inputClassName="min-h-[100px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
            />
          </CollapsibleSection>

          <CollapsibleSection
            id="conversations"
            title="Conversations"
            count={projectConversations.length}
            open={!!detailSectionsOpen.conversations}
            onToggle={toggleDetailSection}
          >
            {projectConversations.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-[#6b635a]">
                  Chat with Shari while this project is open — your exchanges
                  show up here.
                </p>
                {onAsk && (
                  <button
                    type="button"
                    onClick={() =>
                      onAsk(
                        `I'm working on **${current.name}**. Help me think through the next move.`,
                      )
                    }
                    className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Ask Shari about this project
                  </button>
                )}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {projectConversations.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-[#e4ddd2] bg-white px-3 py-2 text-sm"
                  >
                    <p className="text-xs text-[#9a8f82]">
                      {new Date(entry.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1 font-semibold text-[#1f1c19]">
                      You: {entry.userPreview}
                    </p>
                    <p className="mt-1 text-[#6b635a]">
                      Shari: {entry.assistantPreview}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            id="assets"
            title="Project Assets"
            count={projectAssetCount}
            open={Boolean(detailSectionsOpen.assets || detailSectionsOpen.files)}
            onToggle={toggleDetailSection}
          >
            <ProjectAssetsPanel
              projectId={current.id}
              refreshKey={projectDataTick}
              onChanged={() => setProjectDataTick((n) => n + 1)}
            />
          </CollapsibleSection>
        </div>
      </div>
    );
  }

  // ---- List ---------------------------------------------------------------
  return (
    <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <WorkspaceAreaWorksGuide areaId="projects" />
          <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">Projects</p>
          <p className="mt-1 text-base text-[#6b635a]">
            Your filing cabinet — pick a project when you&apos;re ready.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="shrink-0 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          + New Project
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Search
          <input
            type="search"
            value={listQuery}
            onChange={(e) => setListQuery(e.target.value)}
            placeholder="Search projects…"
            className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Sort
          <select
            value={listSort}
            onChange={(e) => setListSort(e.target.value as ProjectListSort)}
            className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f] sm:w-44"
          >
            <option value="recent">Recently active</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      {projects.length === 0 ? (
        <p className="mt-5 text-sm text-[#6b635a]">
          Nothing yet. Tap <strong>New Project</strong> to get started.
        </p>
      ) : listQuery.trim() ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Results
            <span className="ml-2 font-normal normal-case text-[#9a8f82]">
              ({activeProjects.length + completedProjects.length} match)
            </span>
          </p>
          <div className="mt-2">
            {projectListUl(activeProjects)}
            {completedProjects.length > 0 ? (
              <div className="mt-3">{projectListUl(completedProjects)}</div>
            ) : null}
          </div>
          {activeProjects.length === 0 && completedProjects.length === 0 ? (
            <p className="mt-3 text-sm text-[#6b635a]">
              No projects match that search.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-1">
          {recentProjects.length > 0 ? (
            <CollapsibleSection
              id="recent-projects"
              title="Recent Projects"
              count={recentProjects.length}
              open={recentSectionOpen}
              onToggle={toggleListSection}
            >
              {projectListUl(recentProjects)}
            </CollapsibleSection>
          ) : null}

          <CollapsibleSection
            id="all-projects"
            title="All Projects"
            count={allProjectsList.length}
            open={allProjectsSectionOpen}
            onToggle={toggleListSection}
          >
            {allProjectsList.length === 0 ? (
              <p className="text-sm text-[#6b635a]">No active projects yet.</p>
            ) : (
              projectListUl(allProjectsList)
            )}
          </CollapsibleSection>

          {completedProjects.length > 0 ? (
            <CollapsibleSection
              id="completed-projects"
              title="Completed"
              count={completedProjects.length}
              open={completedOpen}
              onToggle={toggleListSection}
            >
              {projectListUl(completedProjects)}
            </CollapsibleSection>
          ) : null}
        </div>
      )}
    </div>
  );
}

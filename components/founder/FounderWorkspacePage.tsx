"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  FounderItemFormModal,
  type FounderItemFormValues,
} from "@/components/founder/FounderItemFormModal";
import { FounderGuidanceChat } from "@/components/founder/FounderGuidanceChat";
import { ResizableSplit } from "@/components/founder/ResizableSplit";
import { FounderItemExports } from "@/components/founder/FounderItemExports";
import { ProjectIntelligencePanel } from "@/components/founder/ProjectIntelligencePanel";
import { FounderCursorPromptModal } from "@/components/founder/quickActions/FounderCursorPromptModal";
import type { FounderActionCenterHandlers } from "@/components/founder/FounderActionCenter";
import { FounderQuickExperimentModal } from "@/components/founder/quickActions/FounderQuickExperimentModal";
import { FounderQuickIssueModal } from "@/components/founder/quickActions/FounderQuickIssueModal";
import { FounderDashboard } from "@/components/founder/FounderDashboard";
import { FounderWorkOnModal } from "@/components/founder/quickActions/FounderWorkOnModal";
import { FounderIssueFormModal } from "@/components/founder/tracking/FounderIssueFormModal";
import {
  FounderTrackingView,
  type IssueStatusFilter,
} from "@/components/founder/tracking/FounderTrackingView";
import { FounderSyncStatusBar } from "@/components/founder/FounderSyncStatus";
import type { FounderGuidanceSuggestedAction } from "@/lib/founderGuidance/types";
import { clientExportToGoogleDoc } from "@/lib/founderWorkspace/clientGoogleExport";
import { useFounderWorkspaceSync } from "@/lib/founderWorkspace/useFounderWorkspaceSync";
import type {
  FounderWorkspaceData,
  FounderWorkspaceItem,
  FounderWorkspaceItemStatus,
  FounderWorkspaceSection,
} from "@/lib/founderWorkspace";
import {
  formatIntelligenceForGuidance,
  useProjectIntelligence,
  type ProjectIntelligence,
  type ProjectSortKey,
} from "@/lib/founderWorkspace/intelligence";
import type { CursorPromptInput } from "@/lib/founderWorkspace/cursorPromptGenerator";
import { generateCursorPrompt as buildCursorPrompt } from "@/lib/founderWorkspace/cursorPromptGenerator";
import {
  formatTrackingForGuidance,
  resolveCursorPromptInput,
  useFounderTracking,
  type FounderIssueSeverity,
  type FounderTrackedIssue,
  type FounderTrackingSection,
} from "@/lib/founderWorkspace/tracking";
import {
  generateFounderDailyBriefing,
  getWorkOnRecommendation,
  type WorkOnRecommendation,
} from "@/lib/founderWorkspace/briefing";
import { formatProductIntelligenceForGuidance } from "@/lib/founderWorkspace/productIntelligence";
import { useProductIntelligence } from "@/lib/founderWorkspace/productIntelligence/useProductIntelligence";
import { formatBusinessHealthForGuidance } from "@/lib/founderWorkspace/businessHealth";
import { useBusinessHealth } from "@/lib/founderWorkspace/businessHealth/useBusinessHealth";
import { formatAnalyticsForGuidance } from "@/lib/founderWorkspace/analytics";
import { useFounderAnalytics } from "@/lib/founderWorkspace/analytics/useFounderAnalytics";
import {
  formatExperimentMetricsForGuidance,
  useExperimentMetrics,
} from "@/lib/founderWorkspace/experimentMetrics";
import { formatDashboardForGuidance } from "@/lib/founderWorkspace/dashboard";
import {
  experimentDraftFromTask,
  insightNoteFromTask,
  issueDraftFromTask,
  resolveRecommendedTask,
} from "@/lib/founderWorkspace/actionCenter";
import { generateResearchNote } from "@/lib/founderWorkspace/actionCenter/researchGenerator";
import { kindLabel, statusLabel } from "@/lib/founderWorkspace";
import {
  COMPANION_GALLERY_DEMO_HREF,
} from "@/lib/gallery";

type FounderNavSection = FounderWorkspaceSection | "issue" | "dev_experiment" | "dashboard";

function isWorkspaceSection(s: FounderNavSection): s is FounderWorkspaceSection {
  return s === "project" || s === "note" || s === "experiment";
}

const PROJECT_SORT_OPTIONS: { value: ProjectSortKey; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "health", label: "Health" },
  { value: "momentum", label: "Momentum" },
  { value: "last_activity", label: "Last Activity" },
];

const SECTIONS: {
  id: FounderNavSection;
  label: string;
  addLabel?: string;
}[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "project", label: "Projects", addLabel: "Add Project" },
  { id: "issue", label: "Issues" },
  { id: "dev_experiment", label: "Experiments" },
  { id: "note", label: "Notes", addLabel: "Add Note" },
];

function sectionItems(data: FounderWorkspaceData, section: FounderWorkspaceSection) {
  if (section === "project") return data.projects;
  if (section === "experiment") return data.experiments;
  return data.notes;
}

function statusBadgeClass(status: FounderWorkspaceItemStatus): string {
  switch (status) {
    case "active":
      return "bg-[#1e4f4f]/12 text-[#1e4f4f]";
    case "parked":
      return "bg-[#e8c547]/25 text-[#7a5c00]";
    case "done":
      return "bg-[#6b635a]/15 text-[#6b635a]";
    default:
      return "bg-[#ebe4d9] text-[#2d2926]";
  }
}

function ItemCard({
  item,
  intelligence,
  focused,
  onFocus,
  onEdit,
  onMarkDone,
  onPark,
  onRemove,
  onCursorPrompt,
}: {
  item: FounderWorkspaceItem;
  intelligence?: ProjectIntelligence;
  focused: boolean;
  onFocus: () => void;
  onEdit: () => void;
  onMarkDone: () => void;
  onPark: () => void;
  onRemove: () => void;
  onCursorPrompt?: () => void;
}) {
  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        focused
          ? "border-[#1e4f4f] ring-2 ring-[#1e4f4f]/25"
          : "border-[#d4cdc3]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onFocus}
              className="text-left font-semibold text-[#1f1c19] hover:text-[#1e4f4f]"
              title="Focus for Guidance chat"
            >
              {item.title}
            </button>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(item.status)}`}
            >
              {statusLabel(item.status)}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[#6b635a]">{kindLabel(item.kind)}</p>
        </div>
      </div>

      {item.description ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-[#2d2926]">{item.description}</p>
      ) : (
        <p className="mt-2 text-sm italic text-[#6b635a]">No description yet.</p>
      )}
      <p className="mt-3 text-[11px] text-[#6b635a]">
        Updated {new Date(item.updatedAt).toLocaleString()}
      </p>

      {intelligence ? (
        <ProjectIntelligencePanel intelligence={intelligence} />
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#ebe4d9] pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium text-[#1e4f4f] hover:bg-[#f5f0e8]"
        >
          Edit
        </button>
        {item.status !== "done" ? (
          <button
            type="button"
            onClick={onMarkDone}
            className="rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium text-[#2d2926] hover:bg-[#f5f0e8]"
          >
            Mark Done
          </button>
        ) : null}
        {item.status !== "parked" ? (
          <button
            type="button"
            onClick={onPark}
            className="rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium text-[#2d2926] hover:bg-[#f5f0e8]"
          >
            Park
          </button>
        ) : null}
        <FounderItemExports item={item} />
        {item.kind === "project" && onCursorPrompt ? (
          <button
            type="button"
            onClick={onCursorPrompt}
            className="rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium text-[#1e4f4f] hover:bg-[#f5f0e8]"
          >
            Generate Cursor Prompt
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-[11px] font-medium text-[#a85c4a] hover:underline"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export function FounderWorkspacePage() {
  const router = useRouter();
  const {
    data,
    syncStatus,
    syncMessage,
    persistUpsert,
    persistStatus,
    persistRemove,
    retrySync,
  } = useFounderWorkspaceSync();
  const tracking = useFounderTracking();
  const productIntelligence = useProductIntelligence();
  const businessHealth = useBusinessHealth();
  const [section, setSection] = useState<FounderNavSection>("dashboard");
  const [issueStatusFilter, setIssueStatusFilter] =
    useState<IssueStatusFilter>("open");
  const [showChat, setShowChat] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<FounderWorkspaceItem | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [quickIssueOpen, setQuickIssueOpen] = useState(false);
  const [quickExperimentOpen, setQuickExperimentOpen] = useState(false);
  const [cursorPromptOpen, setCursorPromptOpen] = useState(false);
  const [cursorPromptContext, setCursorPromptContext] =
    useState<CursorPromptInput | null>(null);
  const [workOnOpen, setWorkOnOpen] = useState(false);
  const [editingTrackedIssue, setEditingTrackedIssue] =
    useState<FounderTrackedIssue | null>(null);
  const [trackedIssueEditOpen, setTrackedIssueEditOpen] = useState(false);

  const focusedItem =
    data && focusedItemId
      ? [...data.projects, ...data.experiments, ...data.notes].find(
          (i) => i.id === focusedItemId,
        ) ?? null
      : null;

  const focusedProjectId =
    focusedItem?.kind === "project" ? focusedItem.id : null;

  const {
    analyses,
    dashboard,
    analysisByProjectId,
    sortKey,
    setSortKey,
    markProjectEdited,
  } = useProjectIntelligence(data, focusedProjectId);

  const { report: analyticsReport } = useFounderAnalytics(data, analyses);
  const { report: experimentMetricsReport } = useExperimentMetrics(data, analyses);

  async function signOut() {
    await fetch("/api/founder-admin/logout", { method: "POST" });
    router.replace("/founder/login");
    router.refresh();
  }

  function openAdd() {
    setFormMode("add");
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: FounderWorkspaceItem) {
    setFormMode("edit");
    setEditingItem(item);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingItem(null);
  }

  function handleFormSave(values: FounderItemFormValues) {
    if (!data) return;
    persistUpsert(values, editingItem?.kind);
    if (values.kind === "project" && (values.id || editingItem?.id)) {
      markProjectEdited(values.id ?? editingItem!.id);
    }
    if (values.kind !== section) {
      setSection(values.kind);
    }
    closeForm();
  }

  function handleMarkDone(item: FounderWorkspaceItem) {
    persistStatus(item.kind, item.id, "done");
  }

  function handlePark(item: FounderWorkspaceItem) {
    persistStatus(item.kind, item.id, "parked");
  }

  function handleRemove(item: FounderWorkspaceItem) {
    if (!window.confirm("Delete this item?")) return;
    if (focusedItemId === item.id) setFocusedItemId(null);
    persistRemove(item.kind, item.id);
  }

  function toggleFocus(item: FounderWorkspaceItem) {
    setFocusedItemId((prev) => (prev === item.id ? null : item.id));
  }

  const workspaceSnapshot = data
    ? {
        projects: data.projects,
        experiments: data.experiments,
        notes: data.notes,
      }
    : null;

  async function handleGuidanceAction(action: FounderGuidanceSuggestedAction) {
    const payload = action.payload ?? {};

    if (action.type === "copy_summary") {
      const text = payload.summary ?? "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        window.alert("Could not copy — select and copy manually.");
      }
      return;
    }

    if (action.type === "add_project") {
      persistUpsert({
        kind: "project",
        title: payload.title ?? "New project",
        description: payload.description ?? "",
        status: payload.status ?? "new",
      });
      setSection("project");
      return;
    }
    if (action.type === "add_experiment") {
      persistUpsert({
        kind: "experiment",
        title: payload.title ?? "New experiment",
        description: payload.description ?? "",
        status: payload.status ?? "new",
      });
      setSection("experiment");
      return;
    }
    if (action.type === "add_note") {
      persistUpsert({
        kind: "note",
        title: payload.title ?? "New note",
        description: payload.description ?? "",
        status: payload.status ?? "new",
      });
      setSection("note");
      return;
    }

    if (action.type === "add_issue") {
      tracking.upsertIssue({
        title: payload.title ?? "New issue",
        description: payload.description ?? "",
        severity: (payload.severity as FounderIssueSeverity) ?? "medium",
        status: "new",
        source: "guidance",
        screenshots: [],
        currentBehavior: payload.currentBehavior,
        expectedBehavior: payload.expectedBehavior,
        likelyFiles: payload.likelyFiles,
      });
      setSection("issue");
      return;
    }

    if (action.type === "add_tracked_experiment") {
      tracking.upsertExperiment({
        title: payload.title ?? "New experiment",
        hypothesis: payload.hypothesis ?? "",
        testPlan: payload.testPlan ?? "",
        expectedOutcome: payload.expectedOutcome ?? "",
        result: "",
        status: "idea",
        relatedIssueId: payload.issueId,
      });
      setSection("dev_experiment");
      return;
    }

    if (action.type === "issue_to_experiment" && payload.issueId) {
      tracking.createExperimentFromIssue(payload.issueId);
      setSection("dev_experiment");
      return;
    }

    if (action.type === "start_working") {
      const navigateTo = payload.navigateTo;
      if (navigateTo === "retest") {
        setSection("issue");
        setIssueStatusFilter("retest");
        return;
      }
      if (
        navigateTo === "issue" ||
        navigateTo === "dev_experiment" ||
        navigateTo === "project" ||
        navigateTo === "note"
      ) {
        setSection(navigateTo);
      }
      if (payload.issueFilter === "retest") {
        setIssueStatusFilter("retest");
      }
      if (payload.itemId && navigateTo === "project") {
        setFocusedItemId(payload.itemId);
      }
      if (!navigateTo && recommendedTask) {
        navigateToTask(recommendedTask);
      }
      return;
    }

    if (action.type === "research_this") {
      const topic =
        payload.researchTopic ??
        payload.title ??
        recommendedTask?.title ??
        "Research topic";
      const context =
        payload.researchContext ??
        payload.description ??
        recommendedTask?.reason;
      saveResearchNote(topic, context ?? "");
      return;
    }

    if (action.type === "needs_research") {
      if (recommendedTask) {
        applyTaskDisposition(recommendedTask, "parked");
      } else if (payload.itemId && payload.kind) {
        persistStatus(payload.kind, payload.itemId, "parked");
      }
      const topic =
        payload.researchTopic ??
        payload.title ??
        recommendedTask?.title ??
        "Research topic";
      saveResearchNote(topic, payload.researchContext ?? payload.description ?? "");
      return;
    }

    if (action.type === "copy_cursor_prompt") {
      const kind =
        (payload.promptKind as
          | "bug_fix"
          | "feature"
          | "experiment"
          | "retest"
          | undefined) ??
        (payload.issueId ? "bug_fix" : payload.projectId ? "feature" : payload.experimentId ? "experiment" : "bug_fix");

      if (payload.prompt?.trim()) {
        try {
          await navigator.clipboard.writeText(payload.prompt);
        } catch {
          window.alert("Could not copy Cursor prompt.");
        }
        return;
      }

      if (!data) return;
      const resolved = resolveCursorPromptInput({
        kind,
        issueId: payload.issueId,
        projectId: payload.projectId,
        experimentId: payload.experimentId,
        issues: tracking.data.issues,
        projects: data.projects,
        experiments: tracking.data.experiments,
      });
      if (resolved) {
        setCursorPromptContext(resolved);
        setCursorPromptOpen(true);
        if (payload.prompt?.trim()) {
          try {
            await navigator.clipboard.writeText(payload.prompt);
          } catch {
            /* clipboard optional */
          }
        }
      }
      return;
    }

    const itemId = payload.itemId;
    const kind = payload.kind;
    if (!itemId || !kind || !data) return;

    const item = [...data.projects, ...data.experiments, ...data.notes].find(
      (i) => i.id === itemId,
    );
    if (!item) return;

    if (action.type === "mark_done") {
      persistStatus(kind, itemId, "done");
      return;
    }
    if (action.type === "park") {
      persistStatus(kind, itemId, "parked");
      return;
    }
    if (action.type === "export_google_doc") {
      const result = await clientExportToGoogleDoc(item);
      if (!result.ok) {
        window.alert(result.error ?? "Google Docs export failed.");
      }
    }
  }

  const intelligenceSummary =
    analyses.length > 0
      ? formatIntelligenceForGuidance(analyses, dashboard)
      : undefined;

  const trackingSummary = formatTrackingForGuidance(tracking.data);

  const dailyBriefing = useMemo(() => {
    if (!data) return null;
    return generateFounderDailyBriefing({
      workspace: data,
      analyses,
      dashboard,
      tracking: tracking.data,
    });
  }, [data, analyses, dashboard, tracking.data]);

  const recommendedTask = useMemo(() => {
    if (!data || !dailyBriefing) return null;
    return resolveRecommendedTask({
      briefing: dailyBriefing,
      tracking: tracking.data,
      analyses,
      workspace: data,
    });
  }, [data, dailyBriefing, tracking.data, analyses]);

  const dashboardSummary =
    dailyBriefing && data
      ? formatDashboardForGuidance({
          briefing: dailyBriefing,
          businessHealth,
          productIntelligence,
          analytics: analyticsReport,
          experimentMetrics: experimentMetricsReport,
          recentNotes: data.notes,
          recommendedTask: recommendedTask ?? undefined,
        })
      : undefined;

  const productIntelligenceSummary = formatProductIntelligenceForGuidance(
    productIntelligence,
  );

  const businessHealthSummary = formatBusinessHealthForGuidance(businessHealth);

  const analyticsSummary = formatAnalyticsForGuidance(analyticsReport);

  const experimentMetricsSummary = formatExperimentMetricsForGuidance(
    experimentMetricsReport,
  );

  const workOnRecommendation: WorkOnRecommendation | null = dailyBriefing
    ? getWorkOnRecommendation(dailyBriefing)
    : null;

  function openTrackedIssueEdit(issue: FounderTrackedIssue) {
    setEditingTrackedIssue(issue);
    setTrackedIssueEditOpen(true);
    setSection("issue");
    if (issue.status === "retest") {
      setIssueStatusFilter("retest");
    }
  }

  function handleWorkOnGo() {
    if (!workOnRecommendation?.navigateTo) return;
    handleBriefingNavigate(
      workOnRecommendation.navigateTo,
      workOnRecommendation.itemId,
    );
    setWorkOnOpen(false);
  }

  function handleBriefingNavigate(
    target: FounderNavSection | FounderTrackingSection,
    itemId?: string,
  ) {
    if (target === "retest") {
      setSection("issue");
      setIssueStatusFilter("retest");
      return;
    }
    setSection(target);
    if (target === "project" && itemId) {
      setFocusedItemId(itemId);
    }
  }

  function handleDashboardNavigate(
    target: "project" | "issue" | "dev_experiment" | "note",
    opts?: { issueFilter?: "retest"; projectId?: string },
  ) {
    setSection(target);
    if (opts?.issueFilter) setIssueStatusFilter(opts.issueFilter);
    if (opts?.projectId) setFocusedItemId(opts.projectId);
  }

  function navigateToTask(task: NonNullable<typeof recommendedTask>) {
    if (!task.navigateTo) {
      setWorkOnOpen(true);
      return;
    }
    if (task.issueFilter === "retest") {
      setSection("issue");
      setIssueStatusFilter("retest");
      return;
    }
    setSection(task.navigateTo);
    if (task.issueFilter) setIssueStatusFilter(task.issueFilter);
    if (task.itemId && task.navigateTo === "project") {
      setFocusedItemId(task.itemId);
    }
  }

  function applyTaskDisposition(
    task: NonNullable<typeof recommendedTask>,
    disposition: "done" | "parked",
  ) {
    const source = task.source;
    if (source.kind === "project") {
      persistStatus(
        "project",
        source.project.id,
        disposition === "done" ? "done" : "parked",
      );
      return;
    }
    if (source.kind === "issue") {
      tracking.upsertIssue({
        ...source.issue,
        status: disposition === "done" ? "fixed" : "parked",
      });
      return;
    }
    if (source.kind === "experiment") {
      tracking.upsertExperiment({
        ...source.experiment,
        status: disposition === "done" ? "successful" : "parked",
      });
    }
  }

  function saveResearchNote(topic: string, context: string) {
    if (!data) return;
    const note = generateResearchNote(topic, context);
    persistUpsert({
      kind: "note",
      title: note.title,
      description: note.body,
      status: "new",
    });
    setSection("note");
  }

  const actionHandlers: FounderActionCenterHandlers | null = recommendedTask
    ? {
        onStartWorking: () => navigateToTask(recommendedTask),
        onCaptureInsight: () => {
          const note = insightNoteFromTask(recommendedTask);
          persistUpsert({
            kind: "note",
            title: note.title,
            description: note.body,
            status: "new",
          });
          setSection("note");
        },
        onTestThisIdea: () => {
          const draft = experimentDraftFromTask(recommendedTask);
          tracking.upsertExperiment({
            title: draft.title,
            hypothesis: draft.hypothesis,
            testPlan: draft.testPlan,
            expectedOutcome: "Measurable improvement or clear learning",
            result: "",
            status: "idea",
            relatedProjectId: draft.relatedProjectId,
            relatedProjectTitle: draft.relatedProjectTitle,
            relatedIssueId: draft.relatedIssueId,
          });
          setSection("dev_experiment");
        },
        onReportProblem: () => {
          const draft = issueDraftFromTask(recommendedTask);
          tracking.upsertIssue({
            title: draft.title,
            description: draft.description,
            severity: "medium",
            status: "new",
            source: "founder",
            screenshots: [],
            relatedProjectId:
              recommendedTask.source.kind === "project"
                ? recommendedTask.source.project.id
                : recommendedTask.source.kind === "issue"
                  ? recommendedTask.source.issue.relatedProjectId
                  : undefined,
            relatedProjectTitle:
              recommendedTask.source.kind === "project"
                ? recommendedTask.source.project.title
                : recommendedTask.source.kind === "issue"
                  ? recommendedTask.source.issue.relatedProjectTitle
                  : undefined,
          });
          setSection("issue");
        },
        onDone: () => applyTaskDisposition(recommendedTask, "done"),
        onNotNow: () => {
          /* no status change */
        },
        onPark: () => applyTaskDisposition(recommendedTask, "parked"),
        onNeedsResearch: () => {
          applyTaskDisposition(recommendedTask, "parked");
          saveResearchNote(recommendedTask.title, recommendedTask.reason);
        },
        onResearchThis: () => {
          saveResearchNote(recommendedTask.title, recommendedTask.reason);
        },
      }
    : null;

  const experimentMetricsById = useMemo(() => {
    const map = new Map<string, (typeof experimentMetricsReport.experiments)[0]>();
    for (const row of experimentMetricsReport.experiments) {
      map.set(row.id, row);
    }
    return map;
  }, [experimentMetricsReport.experiments]);

  const guidanceChat = (
    <FounderGuidanceChat
      workspace={workspaceSnapshot}
      activeTab={section}
      selectedItem={focusedItem}
      intelligenceSummary={intelligenceSummary}
      trackingSummary={trackingSummary}
      dashboardSummary={dashboardSummary}
      productIntelligenceSummary={productIntelligenceSummary}
      businessHealthSummary={businessHealthSummary}
      analyticsSummary={analyticsSummary}
      experimentMetricsSummary={experimentMetricsSummary}
      activeTrackedExperimentId={
        section === "dev_experiment" ? tracking.data.experiments[0]?.id ?? null : null
      }
      onSuggestedAction={(action) => void handleGuidanceAction(action)}
    />
  );

  function sectionCount(navId: FounderNavSection): number {
    if (!data) return 0;
    if (navId === "dashboard") return 0;
    if (navId === "project") return data.projects.length;
    if (navId === "note") return data.notes.length;
    if (navId === "issue") {
      return tracking.data.issues.filter(
        (i) => i.status !== "fixed" && i.status !== "parked",
      ).length;
    }
    if (navId === "dev_experiment") return tracking.data.experiments.length;
    return 0;
  }

  const isDashboardSection = section === "dashboard";
  const isTrackingSection = section === "issue" || section === "dev_experiment";

  const items =
    data && isWorkspaceSection(section) ? sectionItems(data, section) : [];
  const sortedProjectItems =
    section === "project" && analyses.length > 0
      ? analyses.map((a) => a.project)
      : items;
  const displayItems = section === "project" ? sortedProjectItems : items;
  const activeMeta = SECTIONS.find((s) => s.id === section);

  const workspacePane = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-[#d4cdc3] bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-[#1f1c19]">
              Founder Workspace <span className="text-[#6b635a]">(Private)</span>
            </h1>
            <p className="text-xs text-[#6b635a]">
              Build · Fix · Test — private founder workspace
            </p>
            <div className="mt-1">
              <FounderSyncStatusBar
                status={syncStatus}
                message={syncMessage}
                onRetry={() => void retrySync()}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={COMPANION_GALLERY_DEMO_HREF}
              className="rounded-lg border border-[#1e4f4f]/35 bg-[#1e4f4f]/8 px-3 py-1.5 text-xs font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/14"
            >
              Gallery demo
            </a>
            <a
              href="/companion"
              className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-medium text-[#2d2926] hover:bg-white"
            >
              Companion app
            </a>
            <button
              type="button"
              onClick={() => setShowChat((v) => !v)}
              className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-medium text-[#2d2926] lg:hidden"
            >
              {showChat ? "Hide chat" : "Show chat"}
            </button>
            <Link
              href="/founder/validation"
              className="rounded-lg border border-[#1e4f4f] bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              Validation Mode
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg bg-[#6e6a66] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Sign out
            </button>
          </div>
        </div>

        <nav
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Workspace sections"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                section === s.id
                  ? "bg-[#1e4f4f] text-white"
                  : "bg-[#ebe4d9] text-[#2d2926] hover:bg-[#e0d9ce]"
              }`}
            >
              {s.label}
              {sectionCount(s.id) > 0 ? (
                <span className="ml-1.5 opacity-70">({sectionCount(s.id)})</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {activeMeta?.addLabel ? (
            <button
              type="button"
              onClick={openAdd}
              className="rounded-lg bg-[#e0795a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9684d]"
            >
              {activeMeta.addLabel}
            </button>
          ) : null}
          {section === "project" && data && data.projects.length > 0 ? (
            <label className="flex items-center gap-2 text-xs text-[#6b635a]">
              Sort
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as ProjectSortKey)}
                className="rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm text-[#2d2926]"
              >
                {PROJECT_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!data ? (
          <p className="text-sm text-[#6b635a]">Loading workspace…</p>
        ) : isDashboardSection && dailyBriefing && recommendedTask && actionHandlers ? (
          <FounderDashboard
            briefing={dailyBriefing}
            businessHealth={businessHealth}
            productIntelligence={productIntelligence}
            analytics={analyticsReport}
            experimentMetrics={experimentMetricsReport}
            recentNotes={data.notes}
            recommendedTask={recommendedTask}
            actionHandlers={actionHandlers}
            onNavigate={handleDashboardNavigate}
          />
        ) : null}
        {isTrackingSection && data ? (
          <FounderTrackingView
            section={section}
            projects={data.projects}
            tracking={tracking}
            issueStatusFilter={issueStatusFilter}
            onIssueStatusFilterChange={setIssueStatusFilter}
            experimentMetricsById={experimentMetricsById}
            onOpenCursorPrompt={(ctx) => {
              setCursorPromptContext(ctx);
              setCursorPromptOpen(true);
            }}
          />
        ) : null}
        {!data || isTrackingSection || isDashboardSection ? null : displayItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d4cdc3] bg-white/60 p-8 text-center">
            <p className="text-sm font-medium text-[#2d2926]">Nothing here yet.</p>
            <p className="mt-1 text-sm text-[#6b635a]">
              Click {activeMeta?.addLabel ?? "Add"} to create your first one.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {displayItems.map((item) => (
              <li key={item.id}>
                <ItemCard
                  item={item}
                  intelligence={
                    item.kind === "project"
                      ? analysisByProjectId.get(item.id)
                      : undefined
                  }
                  focused={focusedItemId === item.id}
                  onFocus={() => toggleFocus(item)}
                  onEdit={() => openEdit(item)}
                  onMarkDone={() => handleMarkDone(item)}
                  onPark={() => handlePark(item)}
                  onRemove={() => handleRemove(item)}
                  onCursorPrompt={
                    item.kind === "project"
                      ? () => {
                          setCursorPromptContext({
                            kind: "feature",
                            project: item,
                          });
                          setCursorPromptOpen(true);
                        }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <FounderItemFormModal
        open={formOpen}
        mode={formMode}
        defaultKind={section === "note" ? "note" : "project"}
        initialItem={editingItem}
        onClose={closeForm}
        onSave={handleFormSave}
      />

      {data ? (
        <>
          <FounderQuickIssueModal
            open={quickIssueOpen}
            projects={data.projects}
            onClose={() => setQuickIssueOpen(false)}
            onSave={(input) => {
              tracking.upsertIssue(input);
              setSection("issue");
            }}
          />
          <FounderQuickExperimentModal
            open={quickExperimentOpen}
            projects={data.projects}
            onClose={() => setQuickExperimentOpen(false)}
            onSave={(input) => {
              tracking.upsertExperiment(input);
              setSection("dev_experiment");
            }}
          />
          <FounderCursorPromptModal
            open={cursorPromptOpen}
            initialContext={cursorPromptContext}
            projects={data.projects}
            issues={tracking.data.issues}
            experiments={tracking.data.experiments}
            onClose={() => {
              setCursorPromptOpen(false);
              setCursorPromptContext(null);
            }}
            onSaveToNotes={(title, body) => {
              persistUpsert({
                kind: "note",
                title,
                description: body,
                status: "new",
              });
              setSection("note");
            }}
          />
          <FounderWorkOnModal
            open={workOnOpen}
            recommendation={workOnRecommendation}
            onClose={() => setWorkOnOpen(false)}
            onGo={handleWorkOnGo}
          />
          <FounderIssueFormModal
            open={trackedIssueEditOpen}
            initial={editingTrackedIssue}
            projects={data.projects}
            onClose={() => {
              setTrackedIssueEditOpen(false);
              setEditingTrackedIssue(null);
            }}
            onSave={(input) => tracking.upsertIssue(input)}
          />
        </>
      ) : null}
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-[#f5f0e8]">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {showChat ? (
          <div className="hidden min-h-0 flex-1 lg:flex">
            <ResizableSplit
              left={guidanceChat}
              right={workspacePane}
              storageKey="founder-workspace-split-v1"
            />
          </div>
        ) : null}

        <div
          className={`min-h-0 flex-1 flex-col ${
            showChat ? "flex lg:hidden" : "flex"
          }`}
        >
          {showChat ? (
            <div className="flex max-h-[40dvh] min-h-[200px] flex-col border-b border-[#d4cdc3] lg:hidden">
              {guidanceChat}
            </div>
          ) : null}
          {workspacePane}
        </div>
      </div>
    </div>
  );
}

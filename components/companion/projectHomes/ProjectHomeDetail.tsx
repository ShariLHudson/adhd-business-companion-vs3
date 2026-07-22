"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  PROJECT_HOME_STATUS_LABEL,
  addNoteToHome,
  addSectionToHome,
  addTaskToHome,
  applyApprovedShariTask,
  getProjectHomeBackgroundUrl,
  getProjectHomeRoom,
  isSampleProjectHome,
  listHomeProjectItems,
  prototypeRecentProgress,
  prototypeRecentWins,
  prototypeRelatedConversations,
  prototypeUpcomingMilestones,
  resolveProjectHomeArtwork,
  setProjectHomeCurrentFocus,
  type ProjectHomeRecord,
} from "@/lib/projectHomes";
import { ConnectedPlacesSection } from "@/components/companion/projectHomes/ConnectedPlacesSection";
import { ProjectBreakdown } from "@/components/companion/ProjectBreakdown";
import {
  SUGGEST_NEXT_STEP_HELPERS,
  type SuggestNextStepHelperId,
} from "@/lib/projects/suggestNextStepHelpers";
import { summarizeRelatedProjectWork } from "@/lib/projects/projectRelatedWork";
import { RelatedToPanel } from "@/components/companion/RelatedToPanel";

type Props = {
  project: ProjectHomeRecord;
  onProjectChange: (next: ProjectHomeRecord) => void;
  /** Call the Board with this project’s Current Focus (Prompt 145). */
  onCallTheBoard?: (project: ProjectHomeRecord) => void;
};

type DrawerId = "plan" | "tools" | "progress" | "connections";

const PROJECT_TOOLS = [
  {
    id: "ask-shari",
    label: "Ask Shari",
    blurb: "Talk through this project beside you.",
  },
  {
    id: "ask-chamber",
    label: "Ask Chamber",
    blurb: "Quiet counsel when you want another view.",
  },
  {
    id: "ask-board",
    label: "Call the Board",
    blurb: "Bring this project’s decision to the Round Table.",
  },
  {
    id: "cartographer",
    label: "Cartographer",
    blurb: "Map the path when the terrain feels wide.",
  },
  {
    id: "clear-my-mind",
    label: "Clear My Mind",
    blurb: "Set the noise down before you continue.",
  },
] as const;

function ProjectHomeDrawer({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: DrawerId;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = `project-home-drawer-panel-${id}`;
  return (
    <section
      className={`project-homes-section project-homes-drawer${open ? " project-homes-drawer--open" : ""}`}
      data-testid={`project-home-drawer-${id}`}
    >
      <button
        type="button"
        className="project-homes-drawer__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        data-testid={`project-home-drawer-toggle-${id}`}
        onClick={onToggle}
      >
        <h3>{title}</h3>
        <span className="project-homes-drawer__chevron" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          className="project-homes-drawer__body"
          data-testid={`project-home-drawer-body-${id}`}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

/** Project Home workspace — focus first, details behind estate drawers. */
export function ProjectHomeDetail({
  project,
  onProjectChange,
  onCallTheBoard,
}: Props) {
  const room = getProjectHomeRoom(project.projectHomeId);
  const artwork = resolveProjectHomeArtwork(project);
  const cover = getProjectHomeBackgroundUrl(project);
  const sample = isSampleProjectHome(project);
  const [openDrawer, setOpenDrawer] = useState<DrawerId | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [continueMessage, setContinueMessage] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [sectionDraft, setSectionDraft] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [focusDraft, setFocusDraft] = useState(project.currentFocus);
  const [editingFocus, setEditingFocus] = useState(false);
  const [itemsTick, setItemsTick] = useState(0);
  const [shariSuggestion, setShariSuggestion] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [helperMessage, setHelperMessage] = useState<string | null>(null);

  const items = useMemo(() => {
    void itemsTick;
    return listHomeProjectItems(project);
  }, [project, itemsTick]);

  const sections = items.filter((i) => i.kind === "section");
  const tasks = items.filter((i) => i.kind === "task");
  const smallerSteps = items.filter((i) => i.kind === "subtask");
  const recentProgress = prototypeRecentProgress(project);
  const milestones = prototypeUpcomingMilestones(project);
  const completedWork = prototypeRecentWins(project);
  const relatedFromStore = useMemo(
    () => summarizeRelatedProjectWork(project.companionProjectId),
    [project.companionProjectId, itemsTick],
  );
  const relatedConversations = relatedFromStore.hasAny
    ? relatedFromStore.conversationTitles
    : prototypeRelatedConversations(project.currentFocus);

  function toggleDrawer(id: DrawerId) {
    setOpenDrawer((current) => (current === id ? null : id));
  }

  function refreshItems(next: ProjectHomeRecord) {
    onProjectChange(next);
    setItemsTick((n) => n + 1);
  }

  function handleAddSection() {
    const { home } = addSectionToHome(project, sectionDraft);
    setSectionDraft("");
    setActionMessage("Section added.");
    refreshItems(home);
  }

  function handleAddTask() {
    const { home } = addTaskToHome(project, taskDraft);
    setTaskDraft("");
    setActionMessage("Task added.");
    refreshItems(home);
  }

  function handleAddNote() {
    if (!noteDraft.trim()) return;
    const home = addNoteToHome(project, noteDraft);
    setNoteDraft("");
    setActionMessage("Note saved with this project.");
    refreshItems(home);
  }

  function handleContinueNextStep() {
    setContinueMessage(
      "You're with this next step — stay here as long as it helps.",
    );
  }

  function handleSuggestHelper(id: SuggestNextStepHelperId) {
    const helper = SUGGEST_NEXT_STEP_HELPERS.find((h) => h.id === id);
    if (!helper) return;
    const guidance = helper.localGuidance({
      name: project.name,
      goal: project.purpose,
      nextAction: project.nextSuggestedStep || project.currentFocus,
    });
    setHelperMessage(guidance);
    if (id !== "matters") {
      onProjectChange({
        ...project,
        nextSuggestedStep: guidance,
        currentFocus: project.currentFocus || guidance,
      });
    }
  }

  function handleSaveFocus() {
    const next = setProjectHomeCurrentFocus(project, focusDraft);
    onProjectChange(next);
    setEditingFocus(false);
    setActionMessage("Saved");
  }

  function handleProposeShariTask() {
    const firstSection = sections[0];
    const label = firstSection
      ? `Add a task under ${firstSection.title}`
      : "Add a next-step task";
    setShariSuggestion(
      `I can ${label.toLowerCase()}: “Clarify the next concrete step.” Would you like me to do that?`,
    );
  }

  function handleApproveShariTask() {
    if (!shariSuggestion) return;
    const { home } = applyApprovedShariTask(
      project,
      "Clarify the next concrete step",
      sections[0]?.id,
    );
    setShariSuggestion(null);
    setActionMessage("Task added.");
    refreshItems(home);
  }

  return (
    <div className="project-home-workspace" data-testid="project-home-detail">
      <p className="project-homes-kicker">Walking into the Project Home</p>
      <div className="project-homes-title-row">
        <h1 className="project-homes-title">{project.name}</h1>
        {sample ? (
          <span
            className="project-homes-sample-badge"
            data-testid="project-home-detail-sample-badge"
          >
            Example Project
          </span>
        ) : null}
      </div>
      <p className="project-homes-lead">{project.purpose}</p>
      <span className="project-homes-badge">
        {PROJECT_HOME_STATUS_LABEL[project.status]} · {room.name}
      </span>

      <div
        className="project-homes-detail-hero"
        style={{ backgroundImage: `url(${cover})` }}
      >
        <div className="project-homes-detail-hero__veil" aria-hidden />
        <div className="project-homes-detail-hero__copy">
          <p className="project-homes-detail-hero__eyebrow">Project Home</p>
          <p className="project-homes-detail-hero__name">{room.name}</p>
          <p className="project-homes-detail-hero__desc">{room.description}</p>
          {artwork.isPlaceholder ? (
            <p className="project-homes-placeholder-note">
              Temporary room artwork — dedicated Strategy Conference plate
              coming later.
            </p>
          ) : null}
        </div>
      </div>

      <section
        className="project-homes-section project-homes-section--emphasis"
        data-testid="project-home-current-focus"
      >
        <h3>Current Focus</h3>
        {editingFocus ? (
          <div className="mt-2 flex flex-col gap-2">
            <input
              value={focusDraft}
              onChange={(e) => setFocusDraft(e.target.value)}
              className="w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-base text-[#1f1c19]"
              data-testid="project-home-focus-input"
              aria-label="Current focus"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="project-homes-btn project-homes-btn--primary"
                onClick={handleSaveFocus}
                data-testid="project-home-focus-save"
              >
                Save focus
              </button>
              <button
                type="button"
                className="project-homes-btn project-homes-btn--ghost"
                onClick={() => {
                  setFocusDraft(project.currentFocus);
                  setEditingFocus(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>{project.currentFocus}</p>
            {!sample ? (
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-[#1e4f4f]"
                onClick={() => setEditingFocus(true)}
                data-testid="project-home-focus-edit"
              >
                Change focus
              </button>
            ) : null}
          </>
        )}
      </section>

      <section
        className="project-homes-section project-homes-section--emphasis"
        data-testid="project-home-next-step"
      >
        <h3>Your Next Step</h3>
        <p>{project.nextSuggestedStep}</p>
        <div className="project-homes-primary-action">
          <button
            type="button"
            className="project-homes-btn project-homes-btn--primary"
            data-testid="project-home-continue-next-step"
            onClick={handleContinueNextStep}
          >
            Continue with this step
          </button>
          {onCallTheBoard && !sample ? (
            <button
              type="button"
              className="project-homes-btn project-homes-btn--secondary"
              data-testid="project-home-call-the-board"
              onClick={() => onCallTheBoard(project)}
            >
              Call the Board
            </button>
          ) : null}
          {continueMessage ? (
            <p
              className="project-homes-action-message"
              role="status"
              data-testid="project-home-continue-message"
            >
              {continueMessage}
            </p>
          ) : null}
        </div>
        <div
          className="mt-3 flex flex-wrap gap-2"
          data-testid="project-home-suggest-helpers"
        >
          {SUGGEST_NEXT_STEP_HELPERS.map((helper) => (
            <button
              key={helper.id}
              type="button"
              className={
                helper.id === "suggest"
                  ? "project-homes-btn project-homes-btn--secondary"
                  : "project-homes-btn project-homes-btn--ghost"
              }
              data-testid={`project-home-suggest-${helper.id}`}
              onClick={() => handleSuggestHelper(helper.id)}
            >
              {helper.label}
            </button>
          ))}
        </div>
        {helperMessage ? (
          <p
            className="project-homes-action-message mt-2"
            role="status"
            data-testid="project-home-helper-message"
          >
            {helperMessage}
          </p>
        ) : null}
      </section>

      <ProjectHomeDrawer
        id="plan"
        title="Project Plan"
        open={openDrawer === "plan"}
        onToggle={() => toggleDrawer("plan")}
      >
        <p className="project-homes-drawer__lead">
          Sections, steps, and notes for this project — open when you are ready
          to shape the plan.
        </p>

        <div
          className="project-homes-plan-structure"
          data-testid="project-home-structure"
        >
          <h4 className="project-homes-drawer__subtitle">Structure</h4>
          <p className="project-homes-structure__placeholder">
            Sections, tasks, and subtasks — add near the work they belong to.
          </p>
          {project.companionProjectId ? (
            <div
              className="mt-3"
              data-testid="project-home-breakdown"
              key={`${project.companionProjectId}-${itemsTick}`}
            >
              <ProjectBreakdown
                projectId={project.companionProjectId}
                embedded
              />
            </div>
          ) : (
            <div className="project-homes-plan-lists">
              <div data-testid="project-home-plan-sections">
                <p className="project-homes-plan-list-label">Sections</p>
                {sections.length > 0 ? (
                  <ul>
                    {sections.map((s) => (
                      <li key={s.id}>{s.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="project-homes-drawer__empty">No sections yet.</p>
                )}
              </div>
              <div data-testid="project-home-plan-tasks">
                <p className="project-homes-plan-list-label">Steps / Tasks</p>
                {tasks.length > 0 ? (
                  <ul>
                    {tasks.map((t) => (
                      <li key={t.id}>{t.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="project-homes-drawer__empty">No tasks yet.</p>
                )}
              </div>
              <div data-testid="project-home-plan-smaller-steps">
                <p className="project-homes-plan-list-label">Smaller Steps</p>
                {smallerSteps.length > 0 ? (
                  <ul>
                    {smallerSteps.map((s) => (
                      <li key={s.id}>{s.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="project-homes-drawer__empty">
                    No smaller steps yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="project-homes-plan-actions"
          data-testid="project-home-actions"
        >
          <h4 className="project-homes-drawer__subtitle">Project Actions</h4>
          <p className="project-homes-actions-lead">
            Capture a task anytime — it lands in Inbox. Sections are optional.
          </p>
          <div className="project-homes-action-rows">
            <div className="project-homes-action-row">
              <input
                type="text"
                value={taskDraft}
                onChange={(e) => setTaskDraft(e.target.value)}
                placeholder="Task name — no section needed"
                aria-label="Task name"
                data-testid="project-home-task-input"
              />
              <button
                type="button"
                className="project-homes-btn project-homes-btn--secondary"
                data-testid="project-home-add-task"
                onClick={handleAddTask}
              >
                Add Task
              </button>
            </div>
            <div className="project-homes-action-row">
              <input
                type="text"
                value={sectionDraft}
                onChange={(e) => setSectionDraft(e.target.value)}
                placeholder="Optional section name"
                aria-label="Optional section name"
                data-testid="project-home-section-input"
              />
              <button
                type="button"
                className="project-homes-btn project-homes-btn--ghost"
                data-testid="project-home-add-section"
                onClick={handleAddSection}
              >
                Add Section
              </button>
            </div>
            <div className="project-homes-action-row">
              <input
                type="text"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="A note for this project"
                aria-label="Project note"
                data-testid="project-home-note-input"
              />
              <button
                type="button"
                className="project-homes-btn project-homes-btn--secondary"
                data-testid="project-home-add-note"
                onClick={handleAddNote}
                disabled={!noteDraft.trim()}
              >
                Add Note
              </button>
            </div>
          </div>
          {actionMessage ? (
            <p className="project-homes-action-message" role="status">
              {actionMessage}
            </p>
          ) : null}
          {sections.length + tasks.length > 0 ? (
            <ul
              className="project-homes-store-items"
              data-testid="project-home-store-items"
            >
              {sections.map((s) => (
                <li key={s.id}>Section · {s.title}</li>
              ))}
              {tasks.map((t) => (
                <li key={t.id}>Task · {t.title}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </ProjectHomeDrawer>

      <div className="project-homes-actions mt-2">
        <button
          type="button"
          className="project-homes-btn project-homes-btn--secondary"
          onClick={() => setMoreOpen((v) => !v)}
          data-testid="project-home-more-menu"
        >
          {moreOpen ? "Less" : "More…"}
        </button>
        {!sample ? (
          <button
            type="button"
            className="project-homes-btn project-homes-btn--ghost"
            onClick={handleProposeShariTask}
            data-testid="project-home-build-with-shari"
          >
            Build With Shari
          </button>
        ) : null}
      </div>
      {shariSuggestion ? (
        <div
          className="project-homes-section mt-3"
          data-testid="project-home-shari-proposal"
        >
          <p>{shariSuggestion}</p>
          <div className="project-homes-actions">
            <button
              type="button"
              className="project-homes-btn project-homes-btn--primary"
              onClick={handleApproveShariTask}
              data-testid="project-home-shari-approve"
            >
              Yes, add it
            </button>
            <button
              type="button"
              className="project-homes-btn project-homes-btn--ghost"
              onClick={() => setShariSuggestion(null)}
              data-testid="project-home-shari-decline"
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}
      {moreOpen ? (
        <p className="project-homes-drawer__lead mt-2">
          Archive, complete, and rename live on the project card Options menu.
          Structure edits are in Project Plan above.
        </p>
      ) : null}

      <ProjectHomeDrawer
        id="tools"
        title="Project Tools"
        open={openDrawer === "tools"}
        onToggle={() => toggleDrawer("tools")}
      >
        <p className="project-homes-drawer__lead">
          Estate companions for this project — Ask Shari suggests; you approve
          before anything is added.
        </p>
        <ul
          className="project-homes-tools-list"
          data-testid="project-home-tools-list"
        >
          {PROJECT_TOOLS.map((tool) => (
            <li key={tool.id}>
              {tool.id === "ask-shari" && !sample ? (
                <button
                  type="button"
                  className="project-homes-tool-item"
                  data-testid={`project-home-tool-${tool.id}`}
                  onClick={handleProposeShariTask}
                >
                  <span className="project-homes-tool-item__label">
                    {tool.label}
                  </span>
                  <span className="project-homes-tool-item__blurb">
                    {tool.blurb}
                  </span>
                </button>
              ) : tool.id === "ask-board" && onCallTheBoard && !sample ? (
                <button
                  type="button"
                  className="project-homes-tool-item"
                  data-testid={`project-home-tool-${tool.id}`}
                  onClick={() => onCallTheBoard(project)}
                >
                  <span className="project-homes-tool-item__label">
                    {tool.label}
                  </span>
                  <span className="project-homes-tool-item__blurb">
                    {tool.blurb}
                  </span>
                </button>
              ) : (
                <div
                  className="project-homes-tool-item project-homes-tool-item--preparing"
                  data-testid={`project-home-tool-${tool.id}`}
                  aria-disabled="true"
                >
                  <span className="project-homes-tool-item__label">
                    {tool.label}
                  </span>
                  <span className="project-homes-tool-item__blurb">
                    {tool.blurb}
                  </span>
                  <span className="project-homes-tool-item__status">
                    Being prepared
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </ProjectHomeDrawer>

      <ProjectHomeDrawer
        id="progress"
        title="Progress"
        open={openDrawer === "progress"}
        onToggle={() => toggleDrawer("progress")}
      >
        <div data-testid="project-home-progress-recent">
          <h4 className="project-homes-drawer__subtitle">Recent Progress</h4>
          <ul>
            {recentProgress.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div data-testid="project-home-progress-milestones">
          <h4 className="project-homes-drawer__subtitle">Milestones</h4>
          <ul>
            {milestones.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div data-testid="project-home-progress-completed">
          <h4 className="project-homes-drawer__subtitle">Completed work</h4>
          <ul>
            {completedWork.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </ProjectHomeDrawer>

      <ProjectHomeDrawer
        id="connections"
        title="Connections"
        open={openDrawer === "connections"}
        onToggle={() => toggleDrawer("connections")}
      >
        <div data-testid="project-home-connections-conversations">
          <h4 className="project-homes-drawer__subtitle">Conversations</h4>
          {relatedConversations.length > 0 ? (
            <ul>
              {relatedConversations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="project-homes-drawer__empty">
              Related conversations will appear when they connect to this project.
            </p>
          )}
        </div>
        <div data-testid="project-home-connections-files">
          <h4 className="project-homes-drawer__subtitle">Files</h4>
          {relatedFromStore.fileTitles.length > 0 ? (
            <ul>
              {relatedFromStore.fileTitles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="project-homes-drawer__empty">
              Files linked to this project will gather here.
            </p>
          )}
        </div>
        <div data-testid="project-home-connections-links">
          <h4 className="project-homes-drawer__subtitle">Links</h4>
          {relatedFromStore.linkTitles.length > 0 ? (
            <ul>
              {relatedFromStore.linkTitles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="project-homes-drawer__empty">
              Helpful links will settle here when you save them to this project.
            </p>
          )}
        </div>
        <div data-testid="project-home-connections-documents">
          <h4 className="project-homes-drawer__subtitle">Notes</h4>
          {relatedFromStore.notePreviews.length > 0 ? (
            <ul>
              {relatedFromStore.notePreviews.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="project-homes-drawer__empty">
              Project notes will live here when you capture them.
            </p>
          )}
        </div>
        <RelatedToPanel
          title="Related Work & maps"
          testId="project-home-related-to"
          hideEmpty
          groups={[
            {
              id: "work",
              label: "Work",
              items: relatedFromStore.workTitles,
              emptyHint: "Work linked to this project will appear here.",
            },
            {
              id: "maps",
              label: "Maps",
              items: relatedFromStore.mapTitles,
              emptyHint: "Maps connected through Work will appear here.",
            },
            {
              id: "strategies",
              label: "Strategies",
              items: relatedFromStore.strategyTitles,
            },
            {
              id: "evidence",
              label: "Evidence",
              items: relatedFromStore.evidenceTitles,
            },
            {
              id: "wins",
              label: "Wins",
              items: relatedFromStore.winTitles,
            },
          ]}
        />
        <ConnectedPlacesSection projectHomeId={project.projectHomeId} />
      </ProjectHomeDrawer>

      <p className="project-homes-prototype-note">
        Project Homes uses your existing projects storage for sections, tasks,
        and notes. Connected Places and Project Tools are not wired yet.
      </p>
    </div>
  );
}

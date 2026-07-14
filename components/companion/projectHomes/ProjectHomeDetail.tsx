"use client";

import { useMemo, useState } from "react";
import {
  PROJECT_HOME_STATUS_LABEL,
  addNoteToHome,
  addSectionToHome,
  addTaskToHome,
  getProjectHomeBackgroundUrl,
  getProjectHomeRoom,
  isSampleProjectHome,
  listHomeProjectItems,
  prototypeOpenQuestions,
  prototypeRecentProgress,
  prototypeRecentWins,
  prototypeRelatedConversations,
  prototypeUpcomingMilestones,
  resolveProjectHomeArtwork,
  type ProjectHomeRecord,
} from "@/lib/projectHomes";
import { ConnectedPlacesSection } from "@/components/companion/projectHomes/ConnectedPlacesSection";

type Props = {
  project: ProjectHomeRecord;
  onProjectChange: (next: ProjectHomeRecord) => void;
};

/** Project Home workspace — progress first, living place feel. */
export function ProjectHomeDetail({ project, onProjectChange }: Props) {
  const room = getProjectHomeRoom(project.projectHomeId);
  const artwork = resolveProjectHomeArtwork(project);
  const cover = getProjectHomeBackgroundUrl(project);
  const sample = isSampleProjectHome(project);
  const [structureOpen, setStructureOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [sectionDraft, setSectionDraft] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [itemsTick, setItemsTick] = useState(0);

  const items = useMemo(() => {
    void itemsTick;
    return listHomeProjectItems(project);
  }, [project, itemsTick]);

  const sections = items.filter((i) => i.kind === "section");
  const tasks = items.filter((i) => i.kind === "task");

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
        data-testid="project-home-actions"
      >
        <h3>Project Actions</h3>
        <p className="project-homes-actions-lead">
          Add a section, task, or note when you are ready. These save with your
          projects.
        </p>
        <div className="project-homes-action-rows">
          <div className="project-homes-action-row">
            <input
              type="text"
              value={sectionDraft}
              onChange={(e) => setSectionDraft(e.target.value)}
              placeholder="Section name"
              aria-label="Section name"
              data-testid="project-home-section-input"
            />
            <button
              type="button"
              className="project-homes-btn project-homes-btn--secondary"
              data-testid="project-home-add-section"
              onClick={handleAddSection}
            >
              Add Section
            </button>
          </div>
          <div className="project-homes-action-row">
            <input
              type="text"
              value={taskDraft}
              onChange={(e) => setTaskDraft(e.target.value)}
              placeholder="Task name"
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
      </section>

      <section
        className="project-homes-section project-homes-structure"
        data-testid="project-home-structure"
      >
        <button
          type="button"
          className="project-homes-structure__toggle"
          aria-expanded={structureOpen}
          data-testid="project-home-structure-toggle"
          onClick={() => setStructureOpen((o) => !o)}
        >
          <h3>Project Structure</h3>
          <span aria-hidden>{structureOpen ? "▾" : "▸"}</span>
        </button>
        {structureOpen ? (
          <p className="project-homes-structure__placeholder">
            Break this project into manageable steps.
          </p>
        ) : null}
      </section>

      <section className="project-homes-section project-homes-section--emphasis">
        <h3>Current Focus</h3>
        <p>{project.currentFocus}</p>
      </section>

      <section className="project-homes-section project-homes-section--emphasis">
        <h3>Next Suggested Step</h3>
        <p>{project.nextSuggestedStep}</p>
      </section>

      <section className="project-homes-section">
        <h3>Recent Progress</h3>
        <ul>
          {prototypeRecentProgress(project).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="project-homes-section">
        <h3>Upcoming Milestones</h3>
        <ul>
          {prototypeUpcomingMilestones(project).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="project-homes-section">
        <h3>Related Conversations</h3>
        <ul>
          {prototypeRelatedConversations(project.currentFocus).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="project-homes-section">
        <h3>Open Questions</h3>
        <ul>
          {prototypeOpenQuestions(project).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="project-homes-section">
        <h3>Recent Wins</h3>
        <ul>
          {prototypeRecentWins(project).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <ConnectedPlacesSection projectHomeId={project.projectHomeId} />

      <p className="project-homes-prototype-note">
        Project Homes uses your existing projects storage for sections, tasks,
        and notes. Connected Places are not wired yet.
      </p>
    </div>
  );
}

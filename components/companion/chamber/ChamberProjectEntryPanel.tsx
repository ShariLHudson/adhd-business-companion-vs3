"use client";

import { useMemo, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { ChamberOfMomentumRoomShell } from "@/components/companion/chamber/ChamberOfMomentumRoomShell";
import { getProjects } from "@/lib/companionStore";
import { buildChamberMemoryGuidance } from "@/lib/estate/chamberOfMomentumMemory";
import {
  CHAMBER_PROJECT_BLOCKER_OPTIONS,
  CHAMBER_PROJECT_ENTRY_PROMPT,
  CHAMBER_PROJECT_MOMENTUM_LABEL,
  CHAMBER_PROJECT_OUTCOME_EXAMPLES,
  chamberProjectSummary,
  createChamberProject,
  isSpecificNextAction,
  recordChamberProjectBlocker,
  suggestProjectBreakdown,
} from "@/lib/estate/chamberProjectEngine";
import type { ChamberProjectBlockerCategory } from "@/lib/estate/chamberProjectMeta";
import { recentActiveProjects } from "@/lib/projectGrouping";
import "@/app/companion/chamber-of-momentum.css";

type Props = {
  onBack: () => void;
  onOpenProject: (projectId: string) => void;
};

/** Chamber project doorway — outcome first, one next step, no dashboard clutter. */
export function ChamberProjectEntryPanel({ onBack, onOpenProject }: Props) {
  const [view, setView] = useState<"pick" | "create">("pick");
  const [name, setName] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [blockerProjectId, setBlockerProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const memoryGuidance = useMemo(() => buildChamberMemoryGuidance(), [view]);

  const activeProjects = useMemo(
    () => recentActiveProjects(getProjects(), 3),
    [view],
  );

  const breakdown = desiredOutcome.trim()
    ? suggestProjectBreakdown(desiredOutcome)
    : [];

  function startCreate(example?: string) {
    setView("create");
    setError(null);
    if (example) {
      setDesiredOutcome(example);
      if (!name.trim()) {
        setName(example);
      }
      const steps = suggestProjectBreakdown(example);
      if (steps[0] && !nextAction.trim()) {
        setNextAction(steps[0]!);
      }
    }
  }

  function handleCreate() {
    if (!name.trim() || !desiredOutcome.trim()) {
      setError("Give this project a name and a clear outcome.");
      return;
    }
    if (!isSpecificNextAction(nextAction)) {
      setError(
        'Name one specific next action — for example, "Write the homepage headline."',
      );
      return;
    }
    const project = createChamberProject({
      name,
      desiredOutcome,
      whyItMatters,
      nextAction,
    });
    onOpenProject(project.id);
  }

  function handleBlocker(
    projectId: string,
    blocker: ChamberProjectBlockerCategory,
  ) {
    recordChamberProjectBlocker(projectId, blocker);
    setBlockerProjectId(null);
    onOpenProject(projectId);
  }

  return (
    <ChamberOfMomentumRoomShell>
      <EstateWorkspace className="chamber-entry chamber-project-entry grow-room-panel">
        <GrowPanelBackButton
          onBack={() => {
            if (view === "create") {
              setView("pick");
              setError(null);
              return;
            }
            onBack();
          }}
          label={view === "create" ? "Chamber" : "Estate"}
        />

        {view === "pick" ? (
          <>
            <header className="chamber-entry__welcome">
              <p className="chamber-entry__welcome-kicker">Goals & Projects</p>
              <h1 className="chamber-entry__welcome-title">
                {CHAMBER_PROJECT_ENTRY_PROMPT}
              </h1>
              <p className="chamber-entry__welcome-subtitle">
                One clear outcome and one honest next step — not a giant task
                list.
              </p>
              {memoryGuidance ? (
                <p className="chamber-entry__memory-hint">{memoryGuidance}</p>
              ) : null}
            </header>

            <div className="chamber-project-entry__examples">
              {CHAMBER_PROJECT_OUTCOME_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="chamber-project-entry__example"
                  onClick={() => startCreate(example)}
                >
                  {example}
                </button>
              ))}
            </div>

            {activeProjects.length > 0 ? (
              <section className="chamber-project-entry__active">
                <h2 className="chamber-project-entry__section-title">
                  Continue a project
                </h2>
                {activeProjects.map((project) => {
                  const summary = chamberProjectSummary(project);
                  return (
                    <article
                      key={project.id}
                      className="chamber-project-entry__card"
                    >
                      <div className="chamber-project-entry__card-head">
                        <h3 className="chamber-project-entry__card-title">
                          {project.name}
                        </h3>
                        <span className="chamber-project-entry__state">
                          {CHAMBER_PROJECT_MOMENTUM_LABEL[summary.momentumState]}
                        </span>
                      </div>
                      <p className="chamber-project-entry__outcome">
                        {summary.desiredOutcome}
                      </p>
                      <p className="chamber-project-entry__next">
                        <strong>Next:</strong>{" "}
                        {summary.nextAction.trim()
                          ? summary.nextAction
                          : "Name one small next action"}
                      </p>
                      <div className="chamber-project-entry__card-actions">
                        <button
                          type="button"
                          className="chamber-project-entry__primary-btn"
                          onClick={() => onOpenProject(project.id)}
                        >
                          Open project
                        </button>
                        <button
                          type="button"
                          className="chamber-project-entry__secondary-btn"
                          onClick={() => setBlockerProjectId(project.id)}
                        >
                          I&apos;m blocked
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : null}

            <button
              type="button"
              className="grow-room__card journal-room__option chamber-project-entry__new"
              onClick={() => startCreate()}
            >
              <span className="journal-room__option-title">
                Start something new
              </span>
              <span className="journal-room__option-desc">
                Capture the outcome, why it matters, and your first next step.
              </span>
            </button>
          </>
        ) : (
          <form
            className="chamber-project-entry__form"
            onSubmit={(event) => {
              event.preventDefault();
              handleCreate();
            }}
          >
            <header className="chamber-entry__welcome">
              <p className="chamber-entry__welcome-kicker">New project</p>
              <h1 className="chamber-entry__welcome-title">
                What are you trying to accomplish?
              </h1>
            </header>

            <label className="chamber-project-entry__field">
              <span>Project name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Website launch"
              />
            </label>

            <label className="chamber-project-entry__field">
              <span>Desired outcome</span>
              <input
                value={desiredOutcome}
                onChange={(event) => setDesiredOutcome(event.target.value)}
                placeholder="Launch my website"
              />
            </label>

            <label className="chamber-project-entry__field">
              <span>Why it matters</span>
              <textarea
                value={whyItMatters}
                onChange={(event) => setWhyItMatters(event.target.value)}
                placeholder="So clients can find me and understand my offer."
                rows={2}
              />
            </label>

            <label className="chamber-project-entry__field">
              <span>Next action</span>
              <input
                value={nextAction}
                onChange={(event) => setNextAction(event.target.value)}
                placeholder="Write the homepage headline"
              />
            </label>

            {breakdown.length > 0 ? (
              <div className="chamber-project-entry__breakdown">
                <p className="chamber-project-entry__breakdown-label">
                  If this feels big, start here:
                </p>
                <ol>
                  {breakdown.slice(0, 5).map((step) => (
                    <li key={step}>
                      <button
                        type="button"
                        className="chamber-project-entry__breakdown-step"
                        onClick={() => setNextAction(step)}
                      >
                        {step}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {error ? <p className="chamber-project-entry__error">{error}</p> : null}

            <button type="submit" className="chamber-project-entry__primary-btn">
              Save and open project
            </button>
          </form>
        )}

        {blockerProjectId ? (
          <div className="chamber-project-entry__blocker" role="dialog" aria-label="What is getting in the way?">
            <h2 className="chamber-project-entry__section-title">
              What is getting in the way?
            </h2>
            <div className="chamber-project-entry__blocker-row">
              {CHAMBER_PROJECT_BLOCKER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="chamber-entry__unsure-btn"
                  onClick={() => handleBlocker(blockerProjectId, option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="chamber-project-entry__secondary-btn"
              onClick={() => setBlockerProjectId(null)}
            >
              Cancel
            </button>
          </div>
        ) : null}
      </EstateWorkspace>
    </ChamberOfMomentumRoomShell>
  );
}

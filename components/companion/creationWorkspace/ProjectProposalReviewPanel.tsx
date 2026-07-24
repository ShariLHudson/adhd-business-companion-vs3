"use client";

import { useMemo, useState } from "react";
import {
  approveCreationWorkspaceProjectHandoff,
  cancelProjectHandoff,
  keepProjectHandoffAsProposal,
  resolveDestinationReturnActions,
  updateProjectProposalSelection,
  type CreationWorkspaceProjectHandoff,
} from "@/lib/creationWorkspace";

type Props = {
  handoff: CreationWorkspaceProjectHandoff;
  onApproved: (projectId: string) => void;
  onCancel: () => void;
  onKeepProposal: () => void;
  onReturnToCreationWorkspace?: (workspaceId: string) => void;
};

const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white shadow-md hover:bg-[#163a3a]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]";

export function ProjectProposalReviewPanel({
  handoff: initial,
  onApproved,
  onCancel,
  onKeepProposal,
  onReturnToCreationWorkspace,
}: Props) {
  const [handoff, setHandoff] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(
    initial.phases[0]?.id ?? null,
  );

  const returns = useMemo(
    () =>
      resolveDestinationReturnActions({
        returnContext: handoff.returnContext,
        researchCollectionIds: handoff.researchCollectionIds,
      }),
    [handoff],
  );

  function toggleTask(phaseId: string, taskId: string, selected: boolean) {
    setHandoff(
      updateProjectProposalSelection(handoff, {
        phaseId,
        taskId,
        selected,
      }),
    );
  }

  function editTaskTitle(phaseId: string, taskId: string, title: string) {
    setHandoff(
      updateProjectProposalSelection(handoff, {
        phaseId,
        taskId,
        title,
      }),
    );
  }

  function removeTask(phaseId: string, taskId: string) {
    toggleTask(phaseId, taskId, false);
  }

  function approve(mode: "approve_all" | "approve_selected") {
    setError(null);
    const result = approveCreationWorkspaceProjectHandoff({ handoff, mode });
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onApproved(result.projectId);
  }

  return (
    <section
      className="relative flex h-full min-h-0 w-full flex-col overflow-auto bg-[linear-gradient(160deg,#f7f1e8_0%,#efe6d8_45%,#e7ddd0_100%)] px-4 py-5 text-[#2f2a24] sm:px-6"
      data-testid="project-proposal-review"
      aria-label="Project proposal review"
    >
      <header className="mb-4 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#6b6358]">
          Project Proposal Review
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {handoff.proposedTitle}
        </h1>
        <p className="mt-2 text-base text-[#4b463f]">{handoff.purpose}</p>
        <p className="mt-2 text-sm text-[#6b6358]">
          Nothing is created until you approve. Review phases and tasks, edit
          titles, and remove anything that does not belong.
        </p>
      </header>

      <div className="flex max-w-3xl flex-col gap-3">
        {handoff.phases.map((phase) => {
          const open = expandedPhaseId === phase.id;
          const selectedTasks = phase.tasks.filter((t) => t.selected);
          return (
            <article
              key={phase.id}
              className="rounded-2xl border border-[#d4cdc3] bg-white/70 p-4 shadow-sm"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 text-left"
                onClick={() =>
                  setExpandedPhaseId(open ? null : phase.id)
                }
              >
                <div>
                  <h2 className="text-lg font-semibold">{phase.name}</h2>
                  <p className="text-sm text-[#6b6358]">
                    {selectedTasks.length} of {phase.tasks.length} tasks selected
                  </p>
                </div>
                <span className="text-sm text-[#6b6358]">
                  {open ? "Hide" : "Expand"}
                </span>
              </button>
              {open && (
                <ul className="mt-3 space-y-2">
                  {phase.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex flex-col gap-2 rounded-xl border border-[#e6dfd5] bg-[#fbf8f3] p-3 sm:flex-row sm:items-center"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={task.selected}
                          onChange={(e) =>
                            toggleTask(phase.id, task.id, e.target.checked)
                          }
                        />
                        Include
                      </label>
                      <input
                        className="min-w-0 flex-1 rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-sm"
                        value={task.title}
                        onChange={(e) =>
                          editTaskTitle(phase.id, task.id, e.target.value)
                        }
                        aria-label={`Task title for ${task.title}`}
                      />
                      <button
                        type="button"
                        className={BTN_SECONDARY}
                        onClick={() => removeTask(phase.id, task.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                  {phase.milestones.length > 0 && (
                    <li className="pt-2 text-sm text-[#6b6358]">
                      Milestones:{" "}
                      {phase.milestones
                        .filter((m) => m.selected)
                        .map((m) => m.title)
                        .join("; ")}
                    </li>
                  )}
                </ul>
              )}
            </article>
          );
        })}

        {(handoff.dependencies.length > 0 || handoff.risks.length > 0) && (
          <div className="rounded-2xl border border-[#d4cdc3] bg-white/60 p-4 text-sm">
            {handoff.dependencies.length > 0 && (
              <p>
                <span className="font-semibold">Dependencies:</span>{" "}
                {handoff.dependencies.join("; ")}
              </p>
            )}
            {handoff.risks.length > 0 && (
              <p className="mt-2">
                <span className="font-semibold">Risks:</span>{" "}
                {handoff.risks.join("; ")}
              </p>
            )}
            {handoff.researchCollectionIds.length > 0 && (
              <p className="mt-2 text-[#6b6358]">
                Linked research collections: {handoff.researchCollectionIds.length}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className={BTN_PRIMARY} onClick={() => approve("approve_all")}>
            Approve All
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={() => approve("approve_selected")}
          >
            Approve Selected
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              keepProjectHandoffAsProposal(handoff);
              onKeepProposal();
            }}
          >
            Keep as Proposal
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              cancelProjectHandoff(handoff);
              onCancel();
            }}
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {returns.map((action) => (
            <button
              key={action.id}
              type="button"
              className={BTN_SECONDARY}
              onClick={() => {
                if (
                  action.id === "return_to_creation_workspace" &&
                  action.workspaceId
                ) {
                  onReturnToCreationWorkspace?.(action.workspaceId);
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

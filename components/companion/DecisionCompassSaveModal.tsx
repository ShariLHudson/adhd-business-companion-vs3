"use client";

import { useState } from "react";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import {
  addDecisionToProject,
  createDecisionProject,
} from "@/lib/decisionProjectBridge";
import { saveDecisionToSavedWork } from "@/lib/decisionCompassExploration";
import {
  receiptAddedToProject,
  receiptDecisionSavedOnly,
  receiptProjectCreated,
} from "@/lib/executionReceipts";
import { ProjectPickerModal } from "@/components/companion/ProjectPickerModal";
import type { Project } from "@/lib/companionStore";

export function DecisionCompassSaveModal({
  open,
  session,
  onClose,
  onReceipt,
}: {
  open: boolean;
  session: PersistedDecisionCompassSession;
  onClose: () => void;
  onReceipt: (message: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!open) return null;

  const title =
    session.decision?.trim().slice(0, 60) ||
    session.recommendation?.choice?.slice(0, 60) ||
    "Decision";

  function handleSaveOnly() {
    const { location } = saveDecisionToSavedWork(session);
    onReceipt(receiptDecisionSavedOnly(location));
    onClose();
  }

  function handleCreateNew() {
    const result = createDecisionProject(session);
    onReceipt(
      receiptProjectCreated(
        result.projectName,
        result.milestoneCount,
        result.taskCount,
      ),
    );
    onClose();
  }

  function handleProjectPicked(project: Project) {
    const result = addDecisionToProject(session, project.id, project.name);
    onReceipt(
      receiptAddedToProject(
        result.projectName,
        result.milestoneCount,
        result.taskCount,
      ),
    );
    setPickerOpen(false);
    onClose();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
        data-testid="decision-compass-save-modal"
      >
        <div
          className="w-full max-w-md rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] p-5 shadow-xl"
          role="dialog"
          aria-label="Save decision"
        >
          <p className="text-lg font-semibold text-[#1f1c19]">Save Decision</p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Turn this decision into organized work — or save it for later.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-xl bg-[#1e4f4f] px-4 py-3 text-left text-sm font-semibold text-white"
            >
              Add to Existing Project
              <span className="mt-0.5 block text-xs font-normal text-white/80">
                Milestones, action plan, and risks become project sections
              </span>
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-3 text-left text-sm font-semibold text-[#1e4f4f]"
            >
              Create New Project
              <span className="mt-0.5 block text-xs font-normal text-[#6b635a]">
                New project with decision summary, tasks, and risks
              </span>
            </button>
            <button
              type="button"
              onClick={handleSaveOnly}
              className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-sm font-semibold text-[#2d2926]"
            >
              Save Only
              <span className="mt-0.5 block text-xs font-normal text-[#6b635a]">
                Saved Work — no project yet
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-sm font-semibold text-[#6b635a] hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>

      <ProjectPickerModal
        open={pickerOpen}
        artifactTitle={title}
        onClose={() => setPickerOpen(false)}
        onSelect={handleProjectPicked}
        sortRecentFirst
      />
    </>
  );
}

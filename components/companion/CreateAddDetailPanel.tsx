"use client";

import { useState, type ReactNode } from "react";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { appendExtraDetail } from "@/lib/createBuild";
import type { CreateWorkflowState } from "@/lib/createWorkflow";

const btnPrimary =
  "w-full rounded-xl bg-[#1e4f4f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-40";

export function CreateAddDetailPanel({
  workflow,
  onWorkflowChange,
  onBack,
}: {
  workflow: CreateWorkflowState;
  onWorkflowChange: (next: CreateWorkflowState) => void;
  onBack: () => void;
}) {
  const [extraDetail, setExtraDetail] = useState("");

  return (
    <QuestionCard>
      <p className="text-lg font-semibold text-[#1f1c19]">
        What additional information would you like to add?
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        This will be added to what you already shared — nothing gets cleared.
      </p>
      <VoiceAnswerField
        value={extraDetail}
        onChange={setExtraDetail}
        multiline
        compact
        placeholder="Extra context, tone notes, must-include details…"
        autoFocus
        className="mt-4"
        micTitle="Add more detail"
      />
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={!extraDetail.trim()}
          onClick={() => {
            onWorkflowChange(appendExtraDetail(workflow, extraDetail.trim()));
            setExtraDetail("");
          }}
          className={btnPrimary}
        >
          Add Detail
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-[#6b635a] hover:text-[#1f1c19]"
        >
          Cancel
        </button>
      </div>
    </QuestionCard>
  );
}

function QuestionCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e7dfd4] bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

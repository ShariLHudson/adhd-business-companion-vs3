"use client";

import { useMemo, useState } from "react";
import {
  linkWorkRelationship,
  listWorkRelationships,
  unlinkWorkRelationship,
  type WorkRelationshipTargetType,
} from "@/lib/universalWorkEngine";

const TARGET_OPTIONS: {
  kind: WorkRelationshipTargetType;
  label: string;
}[] = [
  { kind: "project", label: "Project" },
  { kind: "calendar-event", label: "Calendar" },
  { kind: "visual-thinking", label: "Visual Thinking" },
  { kind: "task", label: "Task" },
  { kind: "research", label: "Research" },
  { kind: "file", label: "File" },
];

type Props = {
  workId: string;
  sectionId?: string | null;
  /** Bump to refresh after external link changes. */
  refreshKey?: number;
  onOpenProject?: () => void;
};

/**
 * Quiet secondary entry for Work/section connections (099).
 * No wall of destination buttons — progressive disclosure only.
 */
export function ConnectedWorkDisclosure({
  workId,
  sectionId,
  refreshKey = 0,
  onOpenProject,
}: Props) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [targetKind, setTargetKind] =
    useState<WorkRelationshipTargetType>("project");
  const [targetId, setTargetId] = useState("");
  const [tick, setTick] = useState(0);

  const relationships = useMemo(() => {
    void refreshKey;
    void tick;
    return listWorkRelationships(workId);
  }, [workId, refreshKey, tick]);

  const sectionRels = relationships.filter(
    (r) =>
      (r.sourceEntityType ?? "work") === "section" &&
      r.sourceEntityId === sectionId,
  );
  const workRels = relationships.filter(
    (r) => (r.sourceEntityType ?? "work") === "work",
  );
  const visible = sectionId
    ? [...sectionRels, ...workRels.filter((r) => r.toRef.kind === "project")]
    : workRels;

  function handleAdd() {
    const id = targetId.trim();
    if (!id || !workId.trim()) return;
    linkWorkRelationship({
      fromWorkId: workId,
      sourceEntityType: sectionId ? "section" : "work",
      sourceEntityId: sectionId ?? workId,
      toRef: { kind: targetKind, id },
      relationship: "related_to",
      note:
        targetKind === "calendar-event" || targetKind === "visual-thinking"
          ? "Linked from Create — open destination when ready"
          : null,
    });
    setTargetId("");
    setAdding(false);
    setTick((t) => t + 1);
  }

  return (
    <div
      className="border-t border-[#e7dfd4] pt-2"
      data-testid="connected-work-disclosure"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-medium text-[#6b635a] underline-offset-2 hover:text-[#1e4f4f] hover:underline"
        data-testid="connected-work-toggle"
      >
        {open ? "Hide connections" : "Connected to…"}
        {visible.length > 0 ? ` (${visible.length})` : ""}
      </button>
      {open ? (
        <div className="mt-2 flex flex-col gap-2" data-testid="connected-work-panel">
          {visible.length === 0 ? (
            <p className="text-xs leading-relaxed text-[#9a8f82]">
              Nothing linked yet. Add a quiet connection when it helps — Projects,
              Calendar, or Visual Thinking.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5" role="list">
              {visible.map((rel) => (
                <li
                  key={rel.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-[#faf7f2] px-2.5 py-1.5 text-sm text-[#4b463f]"
                  data-testid={`connected-work-item-${rel.id}`}
                >
                  <span>
                    <span className="font-medium text-[#1f1c19]">
                      {rel.toRef.kind}
                    </span>
                    <span className="text-[#9a8f82]"> · {rel.toRef.id}</span>
                  </span>
                  <span className="flex gap-2">
                    {rel.toRef.kind === "project" && onOpenProject ? (
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#1e4f4f] underline"
                        onClick={onOpenProject}
                      >
                        Open
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#6b635a] underline"
                      data-testid={`connected-work-unlink-${rel.id}`}
                      onClick={() => {
                        unlinkWorkRelationship(rel.id);
                        setTick((t) => t + 1);
                      }}
                    >
                      Unlink
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {!adding ? (
            <button
              type="button"
              className="self-start text-sm font-medium text-[#1e4f4f] underline-offset-2 hover:underline"
              data-testid="connected-work-add"
              onClick={() => setAdding(true)}
            >
              Add a connection
            </button>
          ) : (
            <div
              className="flex flex-col gap-2 rounded-xl border border-[#e7dfd4] bg-white/80 p-3"
              data-testid="connected-work-add-form"
            >
              <label className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                Destination
                <select
                  className="mt-1 w-full rounded-lg border border-[#cfc6b8] px-2 py-1.5 text-sm text-[#1f1c19]"
                  value={targetKind}
                  onChange={(e) =>
                    setTargetKind(e.target.value as WorkRelationshipTargetType)
                  }
                  data-testid="connected-work-target-kind"
                >
                  {TARGET_OPTIONS.map((o) => (
                    <option key={o.kind} value={o.kind}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                ID or name
                <input
                  className="mt-1 w-full rounded-lg border border-[#cfc6b8] px-2 py-1.5 text-sm text-[#1f1c19]"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="e.g. project home id"
                  data-testid="connected-work-target-id"
                />
              </label>
              {(targetKind === "calendar-event" ||
                targetKind === "visual-thinking") && (
                <p className="text-xs leading-relaxed text-[#9a8f82]">
                  This records the link. Writing to Calendar or opening Visual
                  Thinking still needs your confirmation in those places.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                  data-testid="connected-work-add-confirm"
                  onClick={handleAdd}
                >
                  Link
                </button>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm text-[#6b635a]"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useId, useState } from "react";

import type {
  FounderWorkspaceItem,
  FounderWorkspaceItemKind,
  FounderWorkspaceItemStatus,
} from "@/lib/founderWorkspace";
import { FounderItemExports } from "@/components/founder/FounderItemExports";
import {
  FOUNDER_WORKSPACE_KINDS,
  FOUNDER_WORKSPACE_STATUSES,
  saveButtonLabel,
} from "@/lib/founderWorkspace";

export type FounderItemFormValues = {
  id?: string;
  kind: FounderWorkspaceItemKind;
  title: string;
  description: string;
  status: FounderWorkspaceItemStatus;
};

type FounderItemFormModalProps = {
  open: boolean;
  mode: "add" | "edit";
  defaultKind: FounderWorkspaceItemKind;
  initialItem?: FounderWorkspaceItem | null;
  onClose: () => void;
  onSave: (values: FounderItemFormValues) => void;
};

export function FounderItemFormModal({
  open,
  mode,
  defaultKind,
  initialItem,
  onClose,
  onSave,
}: FounderItemFormModalProps) {
  const titleId = useId();
  const [kind, setKind] = useState<FounderWorkspaceItemKind>(defaultKind);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FounderWorkspaceItemStatus>("new");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialItem) {
      setKind(initialItem.kind);
      setTitle(initialItem.title);
      setDescription(initialItem.description);
      setStatus(initialItem.status);
      return;
    }
    setKind(defaultKind);
    setTitle("");
    setDescription("");
    setStatus("new");
  }, [open, mode, defaultKind, initialItem]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initialItem?.id,
      kind,
      title: title.trim(),
      description,
      status,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-[#1f1c19]">
          {mode === "edit" ? "Edit item" : `New ${FOUNDER_WORKSPACE_KINDS.find((k) => k.value === defaultKind)?.label ?? "item"}`}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#2d2926]">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-[#d4cdc3] px-3 py-2"
              placeholder="Give it a clear name"
              required
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#2d2926]">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="rounded-lg border border-[#d4cdc3] px-3 py-2"
              placeholder="What is this for? What's the next step?"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[#2d2926]">Type</span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as FounderWorkspaceItemKind)}
                className="rounded-lg border border-[#d4cdc3] px-3 py-2"
              >
                {FOUNDER_WORKSPACE_KINDS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[#2d2926]">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FounderWorkspaceItemStatus)}
                className="rounded-lg border border-[#d4cdc3] px-3 py-2"
              >
                {FOUNDER_WORKSPACE_STATUSES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {mode === "edit" && initialItem ? (
            <div className="border-t border-[#ebe4d9] pt-3">
              <p className="mb-2 text-xs font-medium text-[#6b635a]">Export</p>
              <FounderItemExports
                item={{
                  ...initialItem,
                  title,
                  description,
                  kind,
                  status,
                }}
              />
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#d4cdc3] px-4 py-2 text-sm font-medium text-[#2d2926]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saveButtonLabel(kind)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

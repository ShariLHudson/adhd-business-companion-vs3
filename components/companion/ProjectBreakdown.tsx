"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteProjectItem,
  getProjectItems,
  saveProjectItem,
  toggleProjectItemDone,
  type ProjectItem,
  type ProjectItemKind,
} from "@/lib/companionProjectsStore";
import { CollapsibleSection } from "@/components/companion/CollapsibleSection";

type Props = {
  projectId: string;
  embedded?: boolean;
};

function childKind(parent: ProjectItem | undefined): ProjectItemKind {
  if (!parent) return "section";
  if (parent.kind === "section") return "task";
  return "subtask";
}

export function ProjectBreakdown({ projectId, embedded = false }: Props) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [newSection, setNewSection] = useState("");
  const [addingUnder, setAddingUnder] = useState<string | null>(null);
  const [newChild, setNewChild] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const refresh = useCallback(
    () => setItems(getProjectItems(projectId)),
    [projectId],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const roots = useMemo(
    () => items.filter((i) => !i.parentId && i.kind === "section"),
    [items],
  );

  const childrenOf = (parentId: string) =>
    items.filter((i) => i.parentId === parentId);

  function toggleSection(id: string) {
    setOpenSections((s) => ({ ...s, [id]: !s[id] }));
  }

  function addSection() {
    const title = newSection.trim();
    if (!title) return;
    saveProjectItem({ projectId, kind: "section", title });
    setNewSection("");
    refresh();
  }

  function addChild(parentId: string) {
    const title = newChild.trim();
    if (!title) return;
    const parent = items.find((i) => i.id === parentId);
    saveProjectItem({
      projectId,
      kind: childKind(parent),
      title,
      parentId,
    });
    setNewChild("");
    setAddingUnder(null);
    setOpenSections((s) => ({ ...s, [parentId]: true }));
    refresh();
  }

  function toggle(id: string) {
    toggleProjectItemDone(id);
    refresh();
  }

  function remove(id: string) {
    deleteProjectItem(id);
    refresh();
  }

  function renderNode(item: ProjectItem, depth: number) {
    const kids = childrenOf(item.id);
    const isSection = item.kind === "section";
    const canNest = depth < 6;

    if (isSection) {
      return (
        <CollapsibleSection
          key={item.id}
          id={item.id}
          title={item.title}
          count={kids.length}
          open={!!openSections[item.id]}
          onToggle={toggleSection}
          className="rounded-xl border border-[#e4ddd2] bg-white p-2"
        >
          <div className="flex flex-col gap-2">
            {kids.map((child) => renderNode(child, depth + 1))}
            {addingUnder === item.id ? (
              <ChildInput
                value={newChild}
                onChange={setNewChild}
                onAdd={() => addChild(item.id)}
                placeholder="Task"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingUnder(item.id)}
                className="text-left text-xs font-semibold text-[#1e4f4f]"
              >
                + Task
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="mt-2 text-xs text-[#a85c4a] hover:underline"
          >
            Remove section
          </button>
        </CollapsibleSection>
      );
    }

    return (
      <div
        key={item.id}
        className="rounded-lg bg-[#faf6f0]/80 p-2"
        style={{ marginLeft: Math.min(depth, 4) * 8 }}
      >
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggle(item.id)}
            className="mt-0.5 h-4 w-4 accent-[#1e4f4f]"
          />
          <p
            className={`flex-1 text-sm text-[#1f1c19] ${
              item.done ? "line-through opacity-60" : "font-semibold"
            }`}
          >
            {item.title}
          </p>
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="text-xs text-[#a85c4a] hover:underline"
          >
            ✕
          </button>
        </div>
        {kids.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1">
            {kids.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
        {canNest &&
          (addingUnder === item.id ? (
            <ChildInput
              value={newChild}
              onChange={setNewChild}
              onAdd={() => addChild(item.id)}
              placeholder="Subtask"
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingUnder(item.id)}
              className="mt-1 text-xs font-semibold text-[#1e4f4f]"
            >
              + Subtask
            </button>
          ))}
      </div>
    );
  }

  const body = (
    <>
      {roots.length === 0 ? (
        <p className="text-sm text-[#6b635a]">
          No tasks yet — add a section to break this project down.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {roots.map((section) => renderNode(section, 0))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          placeholder="New section (e.g. Marketing)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSection();
            }
          }}
          className="flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
        />
        <button
          type="button"
          onClick={addSection}
          className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          + Section
        </button>
      </div>
    </>
  );

  if (embedded) return body;

  return (
    <div className="rounded-2xl border border-[#d4cdc3] bg-white/85 p-4">
      {body}
    </div>
  );
}

function ChildInput({
  value,
  onChange,
  onAdd,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
}) {
  return (
    <div className="mt-1 flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd();
          }
        }}
        className="flex-1 rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm outline-none focus:border-[#1e4f4f]"
      />
      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white"
      >
        Add
      </button>
    </div>
  );
}

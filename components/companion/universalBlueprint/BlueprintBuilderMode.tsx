"use client";

import { useEffect, useState } from "react";
import {
  addBlueprintGroup,
  addBlueprintSection,
  deleteBlueprintGroup,
  duplicateBlueprintSection,
  getBlueprint,
  listStructureUndo,
  moveBlueprintGroup,
  moveBlueprintSection,
  moveBlueprintSectionToGroup,
  renameBlueprintGroup,
  renameBlueprintSection,
  restoreBlueprintSection,
  setBlueprintSectionRole,
  softDeleteBlueprintSection,
  undoBlueprintStructure,
  type BlueprintDefinition,
} from "@/lib/universalWorkEngine";
import {
  readBuilderSession,
  writeBuilderSession,
} from "@/lib/universalBlueprintInterface";

type Props = {
  blueprintId: string;
  onClose?: () => void;
  onChanged?: (bp: BlueprintDefinition) => void;
};

/**
 * 106 — Builder Mode (structure editing). Separate from Guided Writing.
 */
export function BlueprintBuilderMode({
  blueprintId,
  onClose,
  onChanged,
}: Props) {
  const [tick, setTick] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const bp = getBlueprint(blueprintId);
  const groups = bp?.groups ?? [];
  const deleted = (bp?.sections ?? []).filter((s) => s.softDeleted);

  useEffect(() => {
    const snap = readBuilderSession(blueprintId);
    if (!snap) return;
    setSelectedGroupId(snap.selectedGroupId);
    setSelectedSectionId(snap.selectedSectionId);
    setCollapsed(new Set(snap.collapsedGroupIds));
  }, [blueprintId]);

  useEffect(() => {
    writeBuilderSession({
      blueprintId,
      selectedGroupId,
      selectedSectionId,
      collapsedGroupIds: [...collapsed],
      updatedAt: new Date().toISOString(),
    });
  }, [blueprintId, selectedGroupId, selectedSectionId, collapsed, tick]);

  if (!bp) {
    return (
      <section className="bp-exp-panel" data-testid="blueprint-builder-mode">
        <p>That Blueprint isn’t available right now.</p>
      </section>
    );
  }

  const apply = (next: BlueprintDefinition, note: string) => {
    setTick((n) => n + 1);
    setStatus(note);
    setConfirm(null);
    onChanged?.(next);
  };

  const run = (fn: () => BlueprintDefinition, note: string) => {
    try {
      apply(fn(), note);
    } catch (err) {
      setStatus(
        err instanceof Error ? err.message : "I couldn’t make that change.",
      );
    }
  };

  const toggleCollapse = (groupId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const selectedSection = bp.sections.find((s) => s.id === selectedSectionId);

  return (
    <section
      className="bp-exp-panel ubi-root"
      data-testid="blueprint-builder-mode"
      data-blueprint-id={blueprintId}
      aria-label="Blueprint Builder Mode"
    >
      <header className="bp-exp-header">
        <div>
          <p className="bp-exp-eyebrow">Builder Mode</p>
          <h3 className="bp-exp-title">{bp.title}</h3>
          <p className="bp-exp-muted">
            Rearrange groups and sections. Guided writing stays separate.
          </p>
        </div>
        <div className="bp-exp-actions">
          <button
            type="button"
            className="bp-exp-btn"
            data-testid="builder-undo"
            disabled={listStructureUndo(blueprintId).length === 0}
            onClick={() => {
              const prev = undoBlueprintStructure(blueprintId);
              if (prev) apply(prev, "Undid the last structure change.");
              else setStatus("Nothing to undo.");
            }}
          >
            Undo
          </button>
          {onClose ? (
            <button
              type="button"
              className="bp-exp-btn bp-exp-btn-primary"
              data-testid="builder-close"
              onClick={onClose}
            >
              Done
            </button>
          ) : null}
        </div>
      </header>

      <div className="bp-exp-toolbar">
        <button
          type="button"
          className="bp-exp-btn"
          data-testid="builder-add-group"
          onClick={() =>
            run(
              () => addBlueprintGroup(blueprintId, "New group"),
              "Added a group.",
            )
          }
        >
          Add Group
        </button>
        <button
          type="button"
          className="bp-exp-btn"
          data-testid="builder-add-section"
          disabled={!selectedGroupId && groups.length === 0}
          onClick={() => {
            const groupId = selectedGroupId ?? groups[0]?.groupId;
            if (!groupId) {
              setStatus("Add a group first.");
              return;
            }
            run(
              () =>
                addBlueprintSection(blueprintId, {
                  title: "New section",
                  groupId,
                }),
              "Added a section.",
            );
          }}
        >
          Add Section
        </button>
      </div>

      <ul className="bp-builder-groups" role="list">
        {groups
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((group) => {
            const open = !collapsed.has(group.groupId);
            const sections = group.sectionIds
              .map((id) => bp.sections.find((s) => s.id === id && !s.softDeleted))
              .filter(Boolean);
            return (
              <li
                key={group.groupId}
                className={`bp-builder-group ${
                  selectedGroupId === group.groupId ? "is-selected" : ""
                }`}
                data-testid={`builder-group-${group.groupId}`}
              >
                <div className="bp-builder-group-row">
                  <button
                    type="button"
                    className="bp-exp-btn bp-exp-btn-ghost"
                    aria-expanded={open}
                    data-testid={`builder-collapse-${group.groupId}`}
                    onClick={() => toggleCollapse(group.groupId)}
                  >
                    {open ? "▾" : "▸"}
                  </button>
                  <button
                    type="button"
                    className="bp-builder-select"
                    onClick={() => {
                      setSelectedGroupId(group.groupId);
                      setSelectedSectionId(null);
                      setRenameValue(group.title);
                    }}
                  >
                    {group.title}
                  </button>
                  <button
                    type="button"
                    className="bp-exp-btn"
                    aria-label={`Move ${group.title} up`}
                    onClick={() =>
                      run(
                        () =>
                          moveBlueprintGroup(blueprintId, group.groupId, "up"),
                        "Moved group up.",
                      )
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="bp-exp-btn"
                    aria-label={`Move ${group.title} down`}
                    onClick={() =>
                      run(
                        () =>
                          moveBlueprintGroup(
                            blueprintId,
                            group.groupId,
                            "down",
                          ),
                        "Moved group down.",
                      )
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="bp-exp-btn"
                    data-testid={`builder-delete-group-${group.groupId}`}
                    onClick={() =>
                      setConfirm(`delete-group:${group.groupId}`)
                    }
                  >
                    Delete
                  </button>
                </div>
                {open ? (
                  <ul className="bp-builder-sections" role="list">
                    {sections.map((section) => {
                      if (!section) return null;
                      return (
                        <li
                          key={section.id}
                          className={`bp-builder-section ${
                            selectedSectionId === section.id
                              ? "is-selected"
                              : ""
                          }`}
                          data-testid={`builder-section-${section.id}`}
                        >
                          <button
                            type="button"
                            className="bp-builder-select"
                            onClick={() => {
                              setSelectedSectionId(section.id);
                              setSelectedGroupId(group.groupId);
                              setRenameValue(section.title);
                            }}
                          >
                            {section.title}
                            <span className="bp-exp-muted">
                              {" "}
                              · {section.role === "required" ? "Required" : "Optional"}
                            </span>
                          </button>
                          <div className="bp-builder-section-actions">
                            <button
                              type="button"
                              className="bp-exp-btn"
                              aria-label={`Move ${section.title} up`}
                              onClick={() =>
                                run(
                                  () =>
                                    moveBlueprintSection(
                                      blueprintId,
                                      section.id,
                                      "up",
                                    ),
                                  "Moved section up.",
                                )
                              }
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="bp-exp-btn"
                              aria-label={`Move ${section.title} down`}
                              onClick={() =>
                                run(
                                  () =>
                                    moveBlueprintSection(
                                      blueprintId,
                                      section.id,
                                      "down",
                                    ),
                                  "Moved section down.",
                                )
                              }
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="bp-exp-btn"
                              onClick={() =>
                                run(
                                  () =>
                                    duplicateBlueprintSection(
                                      blueprintId,
                                      section.id,
                                    ),
                                  "Duplicated section.",
                                )
                              }
                            >
                              Duplicate
                            </button>
                            <button
                              type="button"
                              className="bp-exp-btn"
                              onClick={() =>
                                setConfirm(`delete-section:${section.id}`)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
      </ul>

      {(selectedGroupId || selectedSectionId) && (
        <div className="bp-builder-inspector" data-testid="builder-inspector">
          <label className="bp-exp-label">
            Rename
            <input
              className="bp-exp-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              data-testid="builder-rename-input"
            />
          </label>
          <button
            type="button"
            className="bp-exp-btn bp-exp-btn-primary"
            data-testid="builder-rename-save"
            onClick={() => {
              if (selectedSectionId) {
                run(
                  () =>
                    renameBlueprintSection(
                      blueprintId,
                      selectedSectionId,
                      renameValue,
                    ),
                  "Renamed section.",
                );
              } else if (selectedGroupId) {
                run(
                  () =>
                    renameBlueprintGroup(
                      blueprintId,
                      selectedGroupId,
                      renameValue,
                    ),
                  "Renamed group.",
                );
              }
            }}
          >
            Save name
          </button>
          {selectedSection ? (
            <>
              <button
                type="button"
                className="bp-exp-btn"
                data-testid="builder-mark-required"
                onClick={() =>
                  run(
                    () =>
                      setBlueprintSectionRole(
                        blueprintId,
                        selectedSection.id,
                        "required",
                      ),
                    "Marked required.",
                  )
                }
              >
                Mark Required
              </button>
              <button
                type="button"
                className="bp-exp-btn"
                data-testid="builder-mark-optional"
                onClick={() =>
                  run(
                    () =>
                      setBlueprintSectionRole(
                        blueprintId,
                        selectedSection.id,
                        "optional",
                      ),
                    "Marked optional.",
                  )
                }
              >
                Mark Optional
              </button>
              {groups.length > 1 ? (
                <label className="bp-exp-label">
                  Move to group
                  <select
                    className="bp-exp-input"
                    data-testid="builder-move-to-group"
                    value={selectedSection.groupId ?? selectedGroupId ?? ""}
                    onChange={(e) => {
                      const target = e.target.value;
                      if (!target) return;
                      run(
                        () =>
                          moveBlueprintSectionToGroup(
                            blueprintId,
                            selectedSection.id,
                            target,
                          ),
                        "Moved section to group.",
                      );
                    }}
                  >
                    {groups.map((g) => (
                      <option key={g.groupId} value={g.groupId}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </>
          ) : null}
        </div>
      )}

      {deleted.length > 0 ? (
        <details className="bp-exp-details" data-testid="builder-deleted">
          <summary>Restore deleted sections</summary>
          <ul>
            {deleted.map((s) => (
              <li key={s.id}>
                {s.title}{" "}
                <button
                  type="button"
                  className="bp-exp-btn"
                  onClick={() =>
                    run(
                      () => restoreBlueprintSection(blueprintId, s.id),
                      "Restored section.",
                    )
                  }
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {confirm ? (
        <div
          className="bp-exp-confirm"
          role="alertdialog"
          aria-labelledby="builder-confirm-title"
          data-testid="builder-confirm"
        >
          <p id="builder-confirm-title">
            {confirm.startsWith("delete-group")
              ? "Delete this group? Sections must be empty or you can force later."
              : "Delete this section? You can restore it from the deleted list."}
          </p>
          <button
            type="button"
            className="bp-exp-btn bp-exp-btn-primary"
            data-testid="builder-confirm-yes"
            onClick={() => {
              if (confirm.startsWith("delete-group:")) {
                const id = confirm.slice("delete-group:".length);
                run(
                  () => deleteBlueprintGroup(blueprintId, id, { force: true }),
                  "Deleted group.",
                );
              } else if (confirm.startsWith("delete-section:")) {
                const id = confirm.slice("delete-section:".length);
                run(
                  () => softDeleteBlueprintSection(blueprintId, id),
                  "Deleted section.",
                );
                if (selectedSectionId === id) setSelectedSectionId(null);
              }
            }}
          >
            Yes, delete
          </button>
          <button
            type="button"
            className="bp-exp-btn"
            onClick={() => setConfirm(null)}
          >
            Keep it
          </button>
        </div>
      ) : null}

      {status ? (
        <p className="bp-exp-status" role="status" data-testid="builder-status">
          {status}
        </p>
      ) : null}
    </section>
  );
}

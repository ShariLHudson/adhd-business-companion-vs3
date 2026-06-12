import { describe, expect, it } from "vitest";

import {
  itemToNoteRow,
  mergeWorkspaces,
  noteRowToItem,
  projectRowToItem,
} from "./dbMapping";
import type { FounderWorkspaceData, FounderWorkspaceItem } from "./types";

describe("founder workspace db mapping", () => {
  it("maps project rows to items", () => {
    const item = projectRowToItem({
      id: "p1",
      owner_id: "founder-001",
      title: "Beta",
      description: "Ship it",
      type: "project",
      status: "active",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    });
    expect(item.kind).toBe("project");
    expect(item.title).toBe("Beta");
  });

  it("round-trips notes with title separator and status tag", () => {
    const item: FounderWorkspaceItem = {
      id: "n1",
      kind: "note",
      title: "Idea",
      description: "Try onboarding v2",
      status: "parked",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    const row = itemToNoteRow(item, "founder-001");
    const back = noteRowToItem(row);
    expect(back.title).toBe("Idea");
    expect(back.description).toBe("Try onboarding v2");
    expect(back.status).toBe("parked");
  });

  it("merges by newest updatedAt", () => {
    const local: FounderWorkspaceData = {
      projects: [
        {
          id: "p1",
          kind: "project",
          title: "Local",
          description: "",
          status: "new",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-03T00:00:00.000Z",
        },
      ],
      experiments: [],
      notes: [],
    };
    const remote: FounderWorkspaceData = {
      projects: [
        {
          id: "p1",
          kind: "project",
          title: "Remote",
          description: "",
          status: "new",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      experiments: [],
      notes: [],
    };
    const merged = mergeWorkspaces(local, remote);
    expect(merged.projects[0]?.title).toBe("Local");
  });
});

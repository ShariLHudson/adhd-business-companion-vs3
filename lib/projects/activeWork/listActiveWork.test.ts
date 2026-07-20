import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PROJECTS_EMPTY_ENCOURAGEMENT,
  PROJECTS_LANDING_TITLE,
  PROJECTS_START_NEW_LABEL,
} from "./copy";
import { listActiveWorkCards } from "./listActiveWork";

describe("057 — Projects Active Work", () => {
  it("exposes member-facing Continue Your Work copy — never Project Home create", () => {
    expect(PROJECTS_LANDING_TITLE).toBe("Continue Your Work");
    expect(PROJECTS_START_NEW_LABEL).toBe("Start Something New");
    expect(PROJECTS_EMPTY_ENCOURAGEMENT).toMatch(/active work yet/i);
    expect(PROJECTS_EMPTY_ENCOURAGEMENT).not.toMatch(/Project Home/i);
  });

  it("lists empty Active Work without throwing", () => {
    expect(listActiveWorkCards([])).toEqual([]);
  });

  it("Projects panel wires Start Something New to Create (057)", () => {
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/projectHomes/ProjectHomesPrototypePanel.tsx",
      ),
      "utf8",
    );
    expect(panel).toContain("onStartSomethingNew");
    expect(panel).toContain("listActiveWorkCards");
    expect(panel).not.toContain("Create a Project Home");
    expect(panel).toContain("onRemoveActiveWork");
  });
});

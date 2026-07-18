/**
 * Package 189 — Create minimal chrome + blueprint-driven conversation.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  bootstrapCreateBuilderSession,
  processCreateBuilderTurn,
} from "@/lib/createBuilderChat";
import {
  CREATE_BACK_TO_FOCUS_DESTINATION,
  CREATE_BACK_TO_FOCUS_LABEL,
  CREATE_GUIDED_SUPPORT_LINE,
  createGuidedOpenerForType,
  firstBlueprintQuestionForType,
  isBannedCreateReflectivePrompt,
  shouldShowLegacySectionEditor,
} from "@/lib/createGuidedConversation189";
import { formatAppBackLabel } from "@/lib/navigationBack";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("create guided conversation 189", () => {
  it("formats Back to Focus for Create chrome", () => {
    expect(formatAppBackLabel(CREATE_BACK_TO_FOCUS_DESTINATION)).toBe(
      CREATE_BACK_TO_FOCUS_LABEL,
    );
  });

  it("Client Onboarding opener uses blueprint first question", () => {
    const first = firstBlueprintQuestionForType("Client Onboarding");
    expect(first).toMatch(/Who will receive this onboarding guide/i);
    const opener = createGuidedOpenerForType("Client Onboarding");
    expect(opener).toMatch(/We can build that/i);
    expect(opener).toMatch(/Who will receive this onboarding guide/i);
    expect(isBannedCreateReflectivePrompt(opener)).toBe(false);
  });

  it("rejects banned reflective Create prompts", () => {
    expect(isBannedCreateReflectivePrompt("What feels unfinished?")).toBe(true);
    expect(
      isBannedCreateReflectivePrompt("What possibilities have you considered?"),
    ).toBe(true);
    expect(
      isBannedCreateReflectivePrompt("Who will receive this onboarding guide?"),
    ).toBe(false);
  });

  it("new creations do not open legacy section editor without content", () => {
    expect(
      shouldShowLegacySectionEditor({
        hasResolvedType: true,
        sectionContents: ["", ""],
        draftText: "",
      }),
    ).toBe(false);
    expect(
      shouldShowLegacySectionEditor({
        hasResolvedType: true,
        sectionContents: ["Welcome steps…"],
        draftText: "",
      }),
    ).toBe(true);
  });

  it("clear onboarding request selects blueprint question — not reflective", () => {
    const { session, opener } = bootstrapCreateBuilderSession("Client Onboarding");
    expect(opener).toMatch(/Who will receive this onboarding guide/i);
    expect(opener).not.toMatch(/What feels unfinished/i);
    expect(session.phase).toBe("discovery");
  });

  it("What do you mean? receives CRCI repair, not a new blueprint jump", () => {
    const { session } = bootstrapCreateBuilderSession("Client Onboarding");
    const last =
      "We can build that Client Onboarding together. Who will receive this onboarding guide?";
    const turn = processCreateBuilderTurn(
      session,
      "What do you mean?",
      last,
    );
    expect(turn.session.typeLabel).toBe("Client Onboarding");
    expect(turn.reply.length).toBeGreaterThan(10);
    expect(turn.reply).not.toMatch(/What feels unfinished/i);
    expect(turn.reply).not.toMatch(/What possibilities have you considered/i);
  });

  it("WorkspaceLayout supports Create minimalChrome", () => {
    const layout = read("components/companion/WorkspaceLayout.tsx");
    expect(layout).toContain("minimalChrome");
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("minimalChrome={workspacePanel === \"content-generator\"}");
    expect(client).toContain("CREATE_BACK_TO_FOCUS_DESTINATION");
    expect(client).toContain("createGuidedOpenerForType");
  });

  it("ContentGeneratorPanel hides early clutter for new creates", () => {
    const panel = read("components/companion/ContentGeneratorPanel.tsx");
    expect(panel).toContain("CreateGuidedMinimalPanel");
    expect(panel).toContain("shouldShowLegacySectionEditor");
    expect(panel).toContain("showGuidedMinimal");
    expect(panel).not.toMatch(
      /WorkspaceAreaWorksGuide areaId="content-generator"/,
    );
    expect(CREATE_GUIDED_SUPPORT_LINE).toMatch(/one step at a time/i);
  });
});

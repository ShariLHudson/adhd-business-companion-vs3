/**
 * CompanionPageClient chat-routing wiring for Plan My Day I'm Stuck.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PLAN_DAY_IM_STUCK_QUESTION,
  buildPlanDayImStuckQuestion,
} from "@/lib/planMyDay/planDayImStuck";

function readCompanionPageClient(): string {
  return readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );
}

describe("CompanionPageClient Plan Day I'm Stuck chat routing", () => {
  it("opens contextual help with plan context and no stuck workflow", () => {
    const source = readCompanionPageClient();

    expect(source).toContain("PLAN_DAY_IM_STUCK_EVENT");
    expect(source).toContain("buildPlanDayImStuckQuestion");
    expect(source).toContain("beginContextualHelpSession");
    expect(source).toContain("navigateToChatCore()");
    expect(source).not.toContain("PlanDayImStuckCard");
    expect(source).not.toContain("applyImStuckAnswer");
    expect(PLAN_DAY_IM_STUCK_QUESTION).toMatch(/Plan My Day/);

    const addListenerMatches = source.match(
      /addEventListener\(\s*PLAN_DAY_IM_STUCK_EVENT/g,
    );
    expect(addListenerMatches).toHaveLength(1);

    const handlerStart = source.indexOf("function onPlanDayImStuck");
    expect(handlerStart).toBeGreaterThan(-1);
    const handlerBlock = source.slice(
      handlerStart,
      source.indexOf(
        "window.addEventListener(PLAN_DAY_IM_STUCK_EVENT",
        handlerStart,
      ),
    );
    expect(handlerBlock).toContain("buildPlanDayImStuckQuestion");
    expect(handlerBlock).toContain("beginContextualHelpSession");
    expect(handlerBlock).toContain('sectionId: "plan-my-day"');
    expect(handlerBlock).not.toContain("handleSendRef.current");
  });

  it("includes today’s plan titles in the opener", () => {
    const question = buildPlanDayImStuckQuestion({
      itemTitles: ["Finish proposal", "Call Jordan"],
      energy: "medium",
    });
    expect(question).toContain("Finish proposal");
    expect(question).toContain("Call Jordan");
    expect(question).toContain("energy: medium");
    expect(question).toMatch(/too many tasks/);
  });

  it("keeps existing guided-field help chat routing unchanged", () => {
    const source = readCompanionPageClient();
    expect(source).toContain("GUIDED_FIELD_HELP_EVENT");
    expect(source).toContain("openGuidedFieldHelpChat");
    const guidedAdds = source.match(
      /addEventListener\(\s*GUIDED_FIELD_HELP_EVENT/g,
    );
    expect(guidedAdds).toHaveLength(1);
  });
});

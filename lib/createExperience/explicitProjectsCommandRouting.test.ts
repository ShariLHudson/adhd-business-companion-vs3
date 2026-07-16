import { describe, expect, it } from "vitest";
import {
  evaluateEstateJudgment,
  isEstateJudgmentQuery,
} from "@/lib/estateIntelligence/judgment";
import { isEstateGuideQuestion } from "@/lib/sparkKnowledge/estateGuide";
import { resolveMyDayAndWorkOpenerFromText } from "@/lib/estate/myDayAndWorkNavigation";
import { resolveIntentFirstRoute } from "@/lib/estateBrain/routeIntentFirstNavigation";
import {
  isExplicitProjectsCommandIntent,
  isExplicitProjectsNavigationIntent,
  isProjectCreationIntent,
  resolveImmediateCreateProjectAction,
} from "./createExperienceRouting";

const SOFT_INVITE_RE =
  /A few places come to mind|There are a few places I think might fit|We can stay right here too/i;

const CREATE_SOFT_MENU_RE =
  /Art Studio|Round Table|Create Studio|Creative Studio/i;

describe("explicit Projects command routing", () => {
  it('routes "go to projects" to project-homes without soft multi-place invites', () => {
    const text = "go to projects";
    expect(isExplicitProjectsNavigationIntent(text)).toBe(true);
    expect(isExplicitProjectsCommandIntent(text)).toBe(true);
    expect(isProjectCreationIntent(text)).toBe(false);
    expect(resolveMyDayAndWorkOpenerFromText(text)).toBe("project-homes");
    expect(isEstateJudgmentQuery(text)).toBe(false);
    expect(isEstateGuideQuestion(text)).toBe(false);

    const judgment = evaluateEstateJudgment({ userText: text });
    expect(judgment.handled).toBe(false);
    expect(judgment.intro).not.toMatch(SOFT_INVITE_RE);
    expect(judgment.body).not.toMatch(SOFT_INVITE_RE);
    expect(judgment.body).not.toMatch(/Clear My Mind|Discovery Room/i);
  });

  it('routes "i want to create a project" to Project Homes create — not Create/Art Studio soft menu', () => {
    const text = "i want to create a project";
    expect(isProjectCreationIntent(text)).toBe(true);
    expect(isExplicitProjectsCommandIntent(text)).toBe(true);
    expect(isEstateJudgmentQuery(text)).toBe(false);
    expect(isEstateGuideQuestion(text)).toBe(false);

    const project = resolveImmediateCreateProjectAction(text);
    expect(project?.estatePlaceId).toBe("project-homes");
    expect(project?.toolSection).toBe("project-homes");
    expect(project?.initialView).toBe("create-purpose");

    const route = resolveIntentFirstRoute(text);
    expect(route?.spaceId).toBe("project-homes");
    expect(route?.toolId).toBe("project-homes");
    expect(route?.immediateNavigate).toBe(true);
    expect(route?.alternativeEnvironments).toBeUndefined();
    expect(route?.followUpLine).not.toMatch(SOFT_INVITE_RE);
    expect(route?.followUpLine).not.toMatch(CREATE_SOFT_MENU_RE);
    expect(JSON.stringify(route?.nextExperienceSuggestions ?? [])).not.toMatch(
      CREATE_SOFT_MENU_RE,
    );

    const judgment = evaluateEstateJudgment({ userText: text });
    expect(judgment.handled).toBe(false);
    expect(judgment.body).not.toMatch(SOFT_INVITE_RE);
    expect(judgment.body).not.toMatch(CREATE_SOFT_MENU_RE);
  });

  it("keeps vague place-seeking soft invites for non-project commands", () => {
    const text = "I need somewhere to read";
    expect(isExplicitProjectsCommandIntent(text)).toBe(false);
    expect(isEstateJudgmentQuery(text)).toBe(true);
    const judgment = evaluateEstateJudgment({ userText: text });
    expect(judgment.handled).toBe(true);
    expect(`${judgment.intro}\n${judgment.body}`).toMatch(
      /come to mind|might fit|read|quiet|library/i,
    );
  });
});

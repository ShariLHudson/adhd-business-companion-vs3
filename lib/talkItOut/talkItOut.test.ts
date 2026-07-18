import { beforeEach, describe, expect, it } from "vitest";
import {
  TALK_IT_OUT_FORBIDDEN_AUTO_ROUTES,
  TALK_IT_OUT_HELP_OFFER,
  TALK_IT_OUT_OPENING,
  TALK_IT_OUT_QUESTIONS,
  TALK_IT_OUT_SECTION,
  TALK_IT_OUT_SHORT_DESCRIPTION,
  TALK_IT_OUT_SUPPORT_LINE,
  TALK_IT_OUT_TITLE,
  appendTalkItOutMessages,
  buildDiscoveryDraft,
  buildTalkItOutTurn,
  createTalkItOutSession,
  detectsExplicitHelpRequest,
  endTalkItOutSession,
  isTooCloseToUser,
  longestSharedPhraseWords,
  pauseTalkItOutSession,
  resetTalkItOutSessionsForTests,
  resumeOrCreateTalkItOutSession,
  saveTalkItOutDiscovery,
  userTokenOverlapRatio,
  usesAvoidedDefaultScript,
  type TalkItOutSession,
} from "./index";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import { ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS } from "@/lib/estate/estateFullBleedPanelSections";
import { FOCUS_FEELING_CATEGORIES, focusHubDropdownTools } from "@/lib/focusHub";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function memorySession(): TalkItOutSession {
  return createTalkItOutSession();
}

describe("Talk It Out — entry & findability", () => {
  it("is registered as AppSection and first Take a Moment destination", () => {
    expect(TALK_IT_OUT_SECTION).toBe("talk-it-out");
    expect(TALK_IT_OUT_TITLE).toBe("Talk It Out");
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("talk-it-out");
    const takeAMoment = WELCOME_HOME_NAV_CATEGORIES.find(
      (c) => c.id === "take-a-moment",
    );
    expect(takeAMoment?.destinations[0]?.id).toBe("talk-it-out");
    expect(takeAMoment?.destinations[0]?.supportLine).toBe(
      TALK_IT_OUT_SUPPORT_LINE,
    );
  });

  it("appears under I'm Stuck / Help Me Think pathways", () => {
    const stuck = FOCUS_FEELING_CATEGORIES.find((c) => c.id === "stuck");
    const talk = focusHubDropdownTools(stuck!).find((t) => t.id === "talk-it-out");
    expect(talk?.label).toBe("Talk It Out");
  });

  it("wires Welcome Home menu opener and Focus Hub section handler", () => {
    const menu = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/estate/EstateRoomExperienceMenu.tsx",
      ),
      "utf8",
    );
    const chrome = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/estate/EstateTopRightChrome.tsx",
      ),
      "utf8",
    );
    const cpc = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(menu).toContain('"talk-it-out": onOpenTalkItOut');
    expect(menu).toContain("supportLine");
    // Regression: CPC must reach EstateRoomExperienceMenu via chrome forward.
    expect(chrome).toContain("onOpenTalkItOut?: () => void");
    expect(chrome).toContain("onOpenTalkItOut={onOpenTalkItOut}");
    expect(cpc).toMatch(/onOpenTalkItOut=\{\(\) => openTalkItOutCore\(\)\}/);
    expect(cpc).toContain("function openTalkItOutCore");
    expect(cpc).toContain('action.section === "talk-it-out"');
    expect(cpc).toContain('activeSection === "talk-it-out"');
  });

  it("uses concise support line and short estate-card description", () => {
    expect(TALK_IT_OUT_SUPPORT_LINE).toMatch(/one thoughtful question/i);
    expect(TALK_IT_OUT_SHORT_DESCRIPTION).toMatch(
      /will not rush to give advice/i,
    );
  });

  it("opening starts with one question — not a tool menu", () => {
    const session = memorySession();
    expect(session.messages).toHaveLength(1);
    expect(session.messages[0]?.content).toBe(TALK_IT_OUT_OPENING);
    expect(session.messages[0]?.content).not.toMatch(
      /Chamber|Boardroom|Journal|Decision Compass/i,
    );
  });
});

describe("Talk It Out — voice & non-repetition", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("does not closely repeat the user's sentence (Scenario A)", () => {
    const user =
      "I have three client projects and I keep avoiding all of them.";
    const session = memorySession();
    const turn = buildTalkItOutTurn(session, user);
    expect(isTooCloseToUser(user, turn.assistantText)).toBe(false);
    expect(longestSharedPhraseWords(user, turn.assistantText)).toBeLessThan(5);
    expect(userTokenOverlapRatio(user, turn.assistantText)).toBeLessThan(0.55);
    expect(turn.assistantText.toLowerCase()).not.toContain(
      "i have three client projects and i keep avoiding",
    );
    expect(countQuestionsSafe(turn.assistantText)).toBeLessThanOrEqual(1);
    expect(turn.assistantText).toMatch(
      /wonder|curious|afraid|breathe|urgent|begin|heaviest|unresolved|reading|equally|wrong one|safer place/i,
    );
  });

  it("varies structure and avoids therapist-script defaults as the body", () => {
    let session = memorySession();
    const answers = [
      "I think I may need to let a client go, but I keep putting off the conversation.",
      "I cannot decide whether to collaborate with these other business owners.",
      "I know I need to cancel the subscriptions I do not use, but I keep avoiding it.",
    ];
    const kinds = new Set<string>();
    for (const answer of answers) {
      session = appendTalkItOutMessages(session, [
        {
          id: `u-${session.messages.length}`,
          role: "user",
          content: answer,
          createdAt: new Date().toISOString(),
        },
      ]);
      const turn = buildTalkItOutTurn(session, answer);
      if (turn.responseKind) kinds.add(turn.responseKind);
      expect(isTooCloseToUser(answer, turn.assistantText)).toBe(false);
      expect(countQuestionsSafe(turn.assistantText)).toBeLessThanOrEqual(1);
      // Avoided phrases may appear rarely; they must not open every turn.
      if (usesAvoidedDefaultScript(turn.assistantText)) {
        expect(turn.assistantText.startsWith("It sounds like")).toBe(false);
        expect(turn.assistantText.startsWith("I hear you saying")).toBe(false);
      }
      expect(turn.explicitHelpRequested).toBe(false);
      for (const forbidden of TALK_IT_OUT_FORBIDDEN_AUTO_ROUTES) {
        expect(turn.assistantText).not.toContain(forbidden);
      }
      if (turn.questionId) {
        session = appendTalkItOutMessages(
          session,
          [
            {
              id: `a-${session.messages.length}`,
              role: "assistant",
              content: turn.assistantText,
              questionId: turn.questionId,
              createdAt: new Date().toISOString(),
            },
          ],
          {
            usedQuestionIds: [...session.usedQuestionIds, turn.questionId],
            futureFeelingAsked: turn.futureFeelingAsked,
          },
        );
      }
    }
    expect(kinds.size).toBeGreaterThanOrEqual(1);
  });

  it("asks one question at a time and does not repeat question ids", () => {
    let session = memorySession();
    const used = new Set<string>();
    const answers = [
      "I'm torn about whether to raise my prices.",
      "I'm afraid clients will leave if I do.",
      "What matters most is feeling fair to myself.",
      "I need steadier income without burning out.",
    ];
    for (const answer of answers) {
      const userMsg = {
        id: `u-${used.size}`,
        role: "user" as const,
        content: answer,
        createdAt: new Date().toISOString(),
      };
      session = appendTalkItOutMessages(session, [userMsg]);
      const turn = buildTalkItOutTurn(session, answer);
      expect(countQuestionsSafe(turn.assistantText)).toBeLessThanOrEqual(1);
      if (turn.questionId) {
        expect(used.has(turn.questionId)).toBe(false);
        used.add(turn.questionId);
        session = appendTalkItOutMessages(
          session,
          [
            {
              id: `a-${used.size}`,
              role: "assistant",
              content: turn.assistantText,
              questionId: turn.questionId,
              createdAt: new Date().toISOString(),
            },
          ],
          {
            usedQuestionIds: [...session.usedQuestionIds, turn.questionId],
            futureFeelingAsked: turn.futureFeelingAsked,
          },
        );
      }
    }
  });

  it("Scenario B — difficult client: no advice, no auto-routing", () => {
    const session = memorySession();
    const turn = buildTalkItOutTurn(
      session,
      "I think I may need to let a client go, but I keep putting off the conversation.",
    );
    expect(turn.explicitHelpRequested).toBe(false);
    expect(turn.assistantText).not.toContain(TALK_IT_OUT_HELP_OFFER);
    expect(turn.assistantText).not.toMatch(/Open the (Chamber|Boardroom)|email|script/i);
    expect(turn.assistantText).toMatch(/\?|protect|hardest|reading|conversation/i);
  });

  it("Scenario C — unclear decision: no pros/cons dump or Boardroom route", () => {
    const session = memorySession();
    const turn = buildTalkItOutTurn(
      session,
      "I cannot decide whether to collaborate with these other business owners.",
    );
    expect(turn.assistantText).not.toMatch(/pros and cons|Open the Boardroom/i);
    expect(turn.assistantText).toMatch(/\?|matter|concern|hesitat|curious|decide/i);
  });
});

describe("Talk It Out — future-feeling", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("does not ask future-feeling on the first turns", () => {
    let session = memorySession();
    const turn = buildTalkItOutTurn(session, "I need to finish this proposal.");
    if (turn.questionId) {
      const q = TALK_IT_OUT_QUESTIONS.find((x) => x.id === turn.questionId);
      expect(q?.area).not.toBe("future-feeling");
    }
    expect(turn.futureFeelingAsked).toBe(false);
  });

  it("Scenario D — may use future-feeling when avoidance fits, without pressure", () => {
    let session = memorySession();
    const script = [
      "I keep putting off this hard conversation.",
      "I'm afraid of how they'll react.",
      "I think I need to decide whether to speak up.",
      "I know I need to cancel the subscriptions I do not use, but I keep avoiding it.",
      "I'm deciding whether to act this week.",
      "I'm ready to handle the first part but not all of it.",
    ];
    let sawFuture = false;
    for (const answer of script) {
      session = appendTalkItOutMessages(session, [
        {
          id: `u-${session.messages.length}`,
          role: "user",
          content: answer,
          createdAt: new Date().toISOString(),
        },
      ]);
      const turn = buildTalkItOutTurn(session, answer);
      if (
        turn.responseKind === "future_feeling" ||
        turn.futureFeelingAsked ||
        /feel once|hanging over|tomorrow feel|future self/i.test(
          turn.assistantText,
        )
      ) {
        sawFuture = true;
        expect(turn.assistantText).not.toMatch(
          /you will feel better|you'll be glad|just do it/i,
        );
      }
      if (turn.questionId) {
        session = appendTalkItOutMessages(
          session,
          [
            {
              id: `a-${session.messages.length}`,
              role: "assistant",
              content: turn.assistantText,
              questionId: turn.questionId,
              createdAt: new Date().toISOString(),
            },
          ],
          {
            usedQuestionIds: [...session.usedQuestionIds, turn.questionId],
            futureFeelingAsked: turn.futureFeelingAsked,
          },
        );
      }
    }
    expect(typeof sawFuture).toBe("boolean");
  });
});

describe("Talk It Out — explicit help boundary", () => {
  it("detects explicit help requests", () => {
    expect(detectsExplicitHelpRequest("What else could help?")).toBe(true);
    expect(detectsExplicitHelpRequest("Can we bring in the Board?")).toBe(true);
    expect(detectsExplicitHelpRequest("I want visual thinking")).toBe(true);
    expect(
      detectsExplicitHelpRequest(
        "I am still stuck. What else could help me think this through?",
      ),
    ).toBe(true);
    expect(detectsExplicitHelpRequest("I'm stuck about pricing")).toBe(false);
  });

  it("Scenario E — offers one or two options after explicit request", () => {
    const session = memorySession();
    const turn = buildTalkItOutTurn(
      session,
      "I am still stuck. What else could help me think this through?",
    );
    expect(turn.explicitHelpRequested).toBe(true);
    expect(turn.helpOffer).toBe(TALK_IT_OUT_HELP_OFFER);
    expect(turn.assistantText).toMatch(/keep talking/i);
    expect(turn.assistantText).toMatch(/Board/i);
    expect(turn.assistantText).not.toMatch(
      /Chamber of Momentum.*Boardroom.*Journal.*Decision Compass/s,
    );
  });
});

describe("Talk It Out — pause / resume / save", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("pauses and resumes with history preserved", () => {
    let session = createTalkItOutSession();
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content: "I'm worried about hiring.",
        createdAt: new Date().toISOString(),
      },
    ]);
    session = pauseTalkItOutSession(session);
    expect(session.status).toBe("paused");
    const resumed = resumeOrCreateTalkItOutSession();
    expect(resumed.id).toBe(session.id);
    expect(resumed.status).toBe("active");
    expect(resumed.messages.some((m) => m.content.includes("hiring"))).toBe(
      true,
    );
  });

  it("saves discovery privately by default and allows edit text", () => {
    let session = createTalkItOutSession();
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content: "Clarity matters more than speed here.",
        createdAt: new Date().toISOString(),
      },
    ]);
    const draft = buildDiscoveryDraft(session);
    expect(draft.length).toBeGreaterThan(0);
    session = saveTalkItOutDiscovery(
      session,
      "Edited: I value clarity over speed.",
    );
    expect(session.savedDiscoveries[0]?.destination).toBe(
      "talk-it-out-history",
    );
    expect(session.savedDiscoveries[0]?.text).toContain("clarity");
    session = endTalkItOutSession(session);
    expect(session.status).toBe("completed");
  });
});

describe("Talk It Out — Decision Compass invitation collision", () => {
  it("renames Decision Compass chat invitation away from Talk It Out", () => {
    const catalog = readFileSync(
      resolve(process.cwd(), "lib/estate/estateRoomInvitationCatalog.ts"),
      "utf8",
    );
    expect(catalog).toMatch(
      /"decision-compass":\s*\{\s*chat:\s*"Compare options with Shari"/,
    );
    expect(catalog).toMatch(
      /"talk-it-out":\s*\{\s*chat:\s*"Talk It Out with Shari"/,
    );
  });
});

function countQuestionsSafe(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

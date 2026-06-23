import { describe, expect, it } from "vitest";
import {
  adhdEntrepreneurPrimaryHintForChat,
  adhdRealityCheck,
  analyzeAdhdEntrepreneurTurn,
  buildFilteredBoardAdvisorHint,
  detectAdhdBusinessPatterns,
  INTELLIGENCE_HIERARCHY_ORDER,
  translateExpertAdviceInText,
} from "./adhdEntrepreneurIntelligence";
import { analyzeAdhdNativeTurn } from "./adhdNativeIntelligence";

describe("adhdEntrepreneurIntelligence", () => {
  it("defines intelligence hierarchy with ADHD entrepreneur first", () => {
    expect(INTELLIGENCE_HIERARCHY_ORDER[0]).toBe("adhd_entrepreneur");
    expect(INTELLIGENCE_HIERARCHY_ORDER[2]).toBe("board_of_directors");
  });

  it("detects ADHD business patterns", () => {
    expect(detectAdhdBusinessPatterns("I keep buying another course")).toContain(
      "course_collecting",
    );
    expect(detectAdhdBusinessPatterns("shiny object syndrome again")).toContain(
      "shiny_object",
    );
  });

  it("translates traditional marketing advice", () => {
    const translated = translateExpertAdviceInText(
      "You should post on five platforms every day",
    );
    expect(translated).toMatch(/one platform/i);
  });

  it("translates traditional operations advice", () => {
    const translated = translateExpertAdviceInText(
      "Create detailed SOPs for all major workflows",
    );
    expect(translated).toMatch(/one process/i);
  });

  it("fails ADHD reality check for overloaded recommendations", () => {
    const check = adhdRealityCheck(
      "Create a comprehensive 90-day strategic plan for every area of the business",
    );
    expect(check.realistic).toBe(false);
    expect(check.simplified).toBeTruthy();
  });

  it("primary hint mandates ADHD filter before board", () => {
    const analysis = analyzeAdhdEntrepreneurTurn({
      userText: "I need a comprehensive content strategy",
      boardDomain: "marketing",
    });
    const hint = adhdEntrepreneurPrimaryHintForChat({ analysis });
    expect(hint).toMatch(/Layer 1 — PRIMARY/i);
    expect(hint).toMatch(/Board of Directors/i);
    expect(hint).toMatch(/NOT ADHD Companion \+ Board/i);
  });

  it("board hint is subordinate and filtered", () => {
    const hint = buildFilteredBoardAdvisorHint("marketing");
    expect(hint).toMatch(/Layer 3 — advisory only/i);
    expect(hint).toMatch(/Filter every board insight/i);
    expect(hint).toMatch(/one companion voice/i);
  });

  it("integrates with adhd native analysis", () => {
    const adhdNative = analyzeAdhdNativeTurn({
      text: "I'm on a roll and just shipped something",
      emotionalState: "focused",
      obstacle: null,
    });
    const analysis = analyzeAdhdEntrepreneurTurn({
      userText: "I'm on a roll and just shipped something",
      adhdNative,
      boardDomain: "marketing",
    });
    const hint = adhdEntrepreneurPrimaryHintForChat({ analysis, adhdNative });
    expect(hint).toMatch(/Protect momentum/i);
  });
});

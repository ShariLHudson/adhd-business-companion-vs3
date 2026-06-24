import { describe, expect, it } from "vitest";
import {
  buildAdhdEmotionalFrictionReply,
  classifyAdhdEmotionalFrictionCategory,
  isAdhdEmotionalFrictionTurn,
  isTaskFirstTurn,
} from "./adhdEmotionalFrictionIntelligence";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";

const FORBIDDEN_TASK_PLANNING = [
  /what needs your attention most right now/i,
  /what project are you working on/i,
  /what task are you trying to finish/i,
  /focus mode/i,
  /focus audio/i,
  /visual thinking/i,
  /decision compass/i,
];

const EMOTIONAL_FRICTION_CASES = [
  "I get discouraged because I can't stay focused.",
  "I know what to do but can't make myself do it.",
  "I keep starting over.",
  "I feel stuck.",
  "I lose motivation quickly.",
  "I can't stay consistent.",
  "I keep getting distracted.",
  "I feel like I'm spinning my wheels.",
];

const TASK_FIRST_CASES = [
  "I need to focus on my marketing plan.",
  "I need help finishing my website.",
];

describe("adhdEmotionalFrictionIntelligence", () => {
  describe("isAdhdEmotionalFrictionTurn", () => {
    it.each(EMOTIONAL_FRICTION_CASES)("detects emotional friction: %s", (text) => {
      expect(isAdhdEmotionalFrictionTurn(text)).toBe(true);
      expect(isTaskFirstTurn(text)).toBe(false);
    });

    it.each(TASK_FIRST_CASES)("does not flag task-first turns: %s", (text) => {
      expect(isAdhdEmotionalFrictionTurn(text)).toBe(false);
      expect(isTaskFirstTurn(text)).toBe(true);
    });

    it("defers to crisis routing for breathless distress", () => {
      expect(
        isAdhdEmotionalFrictionTurn(
          "I feel stuck and can't catch my breath",
        ),
      ).toBe(false);
    });
  });

  describe("buildAdhdEmotionalFrictionReply", () => {
    it.each(EMOTIONAL_FRICTION_CASES)(
      "returns acknowledgement and one question for: %s",
      (text) => {
        const reply = buildAdhdEmotionalFrictionReply(text);
        expect(reply).toMatch(/frustrating/i);
        expect(reply).toMatch(/ADHD brains/i);
        const questionMarks = reply.match(/\?/g) ?? [];
        expect(questionMarks.length).toBe(1);
        for (const forbidden of FORBIDDEN_TASK_PLANNING) {
          expect(reply).not.toMatch(forbidden);
        }
      },
    );

    it("picks motivation question for discouraged / motivation phrasing", () => {
      const reply = buildAdhdEmotionalFrictionReply(
        "I get discouraged because I can't stay focused.",
      );
      expect(reply).toMatch(/lose interest quickly|difficult to start/i);
      expect(classifyAdhdEmotionalFrictionCategory(
        "I get discouraged because I can't stay focused.",
      )).toBe("motivation");
    });

    it("picks distraction question for focus / distraction phrasing", () => {
      const reply = buildAdhdEmotionalFrictionReply(
        "I keep getting distracted.",
      );
      expect(reply).toMatch(/pulled away|refusing to stay/i);
    });
  });

  describe("frictionless routing integration", () => {
    it.each(EMOTIONAL_FRICTION_CASES)(
      "routes emotional friction before focus support: %s",
      (text) => {
        const decision = resolveFrictionlessAction({ userText: text });
        expect(decision.category).toBe("adhd_emotional_friction");
        expect(decision.suppressRelationship).toBe(true);
        expect(decision.localReply).toMatch(/frustrating/i);
        for (const forbidden of FORBIDDEN_TASK_PLANNING) {
          expect(decision.localReply).not.toMatch(forbidden);
        }
      },
    );

    it.each(TASK_FIRST_CASES)(
      "routes task-first turns to planning/help, not emotional friction: %s",
      (text) => {
        const decision = resolveFrictionlessAction({ userText: text });
        expect(decision.category).not.toBe("adhd_emotional_friction");
      },
    );

    it("routes marketing plan focus to planning, not emotional friction", () => {
      const decision = resolveFrictionlessAction({
        userText: "I need to focus on my marketing plan.",
      });
      expect(decision.category).not.toBe("adhd_emotional_friction");
      expect(decision.category).toBe("direct_action");
      expect(decision.localReply).toMatch(/marketing plan|Create/i);
    });
  });
});

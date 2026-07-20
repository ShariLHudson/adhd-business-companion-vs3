/**
 * @vitest-environment jsdom
 * Events Intelligence — clear event goal → guide planning (not Talk It Out).
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  detectEventIntent,
  EVENTS_INTELLIGENCE_CANONICAL_FILES,
  eventsIntelligenceRetrievalPath,
  EVENT_SECTION_DEFS,
  getActiveEventRecord,
  isEventsReflectiveTrap,
  processEventsIntelligenceTurn,
  shouldRouteToEventsIntelligence,
} from "./index";

describe("Events Intelligence runtime", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("loads the canonical Events Intelligence file set", () => {
    expect(EVENTS_INTELLIGENCE_CANONICAL_FILES.length).toBeGreaterThanOrEqual(15);
    expect(
      EVENTS_INTELLIGENCE_CANONICAL_FILES.some((f) =>
        f.includes("EI-005_RUNTIME_CONVERSATION_BEHAVIOR"),
      ),
    ).toBe(true);
    expect(
      EVENTS_INTELLIGENCE_CANONICAL_FILES.some((f) =>
        f.includes("EI-W601_GUIDE_EVENT_PLANNING"),
      ),
    ).toBe(true);
    for (const path of EVENTS_INTELLIGENCE_CANONICAL_FILES) {
      expect(() => readFileSync(resolve(process.cwd(), path), "utf8")).not.toThrow();
    }
  });

  it("keeps the full event map in the background", () => {
    const ids = EVENT_SECTION_DEFS.map((s) => s.id);
    for (const needed of [
      "event_type",
      "purpose",
      "audience",
      "outcomes",
      "format",
      "dates",
      "venue",
      "budget",
      "agenda",
      "speakers",
      "sponsors",
      "vendors",
      "staff",
      "volunteers",
      "registration",
      "marketing",
      "communications",
      "attendee_experience",
      "accessibility",
      "hospitality",
      "technology",
      "production",
      "supplies",
      "swag",
      "safety",
      "contingencies",
      "run_of_show",
      "post_event_follow_up",
      "measurement",
      "archive_and_reuse",
    ]) {
      expect(ids).toContain(needed);
    }
  });

  it("detects retreat weekend as a clear event goal", () => {
    const intent = detectEventIntent(
      "I need help creating a retreat weekend event.",
    );
    expect(intent.isClearEventGoal).toBe(true);
    expect(intent.eventType).toBe("retreat");
    expect(intent.multiDay).toBe(true);
    expect(shouldRouteToEventsIntelligence({ userText: intent.rawText })).toBe(
      true,
    );
  });

  it("045 KNOW — does not launch Events Create for knowledge questions", () => {
    expect(
      shouldRouteToEventsIntelligence({
        userText: "What should I consider when planning a retreat?",
      }),
    ).toBe(false);
  });

  it("first retreat turn opens Event Creation Workspace and one foundation question", () => {
    const result = processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });

    expect(result.handled).toBe(true);
    expect(result.kind).toBe("start");
    expect(result.projectHomeCreated).toBe(true);
    expect(result.projectHomeId).toBeTruthy();
    expect(result.record?.eventType).toBe("retreat");
    expect(result.record?.lifecyclePhase).toBe("discovery");
    expect(result.record?.sections.length).toBe(EVENT_SECTION_DEFS.length);

    const reply = result.reply.toLowerCase();
    expect(reply).toMatch(/retreat|help you create/);
    // T1 — engine must not claim workspace opened/ready; CPC Trust Kernel authorizes after mount
    expect(reply).toMatch(/let's work on it together|work on it together/);
    expect(reply).not.toMatch(/\bi(?:'ve| have)? opened\b|workspace is ready/);
    expect(reply).not.toMatch(/pieces you can already see/);
    expect(reply).toMatch(/leave this retreat|outcome|successful/);
    expect(reply).not.toMatch(/trying to get clear/);
    expect(reply).not.toMatch(/what feels unfinished/);
    expect(reply).not.toMatch(/quieter question/);
    expect((result.reply.match(/\?/g) ?? []).length).toBe(1);
    expect(isEventsReflectiveTrap(result.reply)).toBe(false);

    expect(result.retrievalPath.length).toBeGreaterThan(0);
    expect(getActiveEventRecord()?.id).toBe(result.record?.id);
  });

  it("continues with one step after the foundation answer — no checklist dump", () => {
    processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    const next = processEventsIntelligenceTurn({
      userText: "People leave rested and clear on their next season.",
    });
    expect(next.handled).toBe(true);
    expect(next.kind).toBe("continue");
    expect(next.record?.outcomes).toMatch(/rested/i);
    expect(next.reply).not.toMatch(/speakers.*sponsors.*vendors.*swag/i);
    expect((next.reply.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
  });

  it("does not invent tasks on start", () => {
    const result = processEventsIntelligenceTurn({
      userText: "Help me plan a workshop event.",
    });
    expect(result.record?.tasks).toEqual([]);
  });

  it("retrieval path follows phase", () => {
    const path = eventsIntelligenceRetrievalPath({ phase: "discovery" });
    expect(path.some((p) => p.includes("EI-005"))).toBe(true);
    expect(path.some((p) => p.includes("EI-K102") || p.includes("strategy"))).toBe(
      true,
    );
  });

  it("CPC wires Events Intelligence before generic chat", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    // Entrypoint + Trust Kernel sole egress (engine invoked via enterCreationFromShari)
    expect(client).toContain("enterCreationFromShari");
    expect(client).toContain("shouldRouteToEventsIntelligence");
    expect(client).toContain("eventsIntelligenceHintForChat");
    expect(client).toContain("authorizeCreationEgress");
    const eventsAt = client.indexOf("shouldRouteToEventsIntelligence");
    const facilitatedAt = client.indexOf("facilitatedV2Active && createBuilderSession");
    expect(eventsAt).toBeGreaterThan(0);
    expect(facilitatedAt).toBeGreaterThan(eventsAt);
  });
});


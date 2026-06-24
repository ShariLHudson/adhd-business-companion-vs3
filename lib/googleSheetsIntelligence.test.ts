import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildGoogleSheetPendingPayload,
  buildSheetCsv,
  detectSheetIntent,
  getGoogleSheetTemplate,
  resolveGoogleSheetsTurn,
  shouldExcludeSheetOffer,
  startGoogleSheetIntake,
  templateColumns,
} from "./googleSheetsIntelligence";
import {
  clearGoogleSheetIntakeSession,
  loadGoogleSheetIntakeSession,
  saveGoogleSheetIntakeSession,
} from "./googleSheetsSessionStore";
import {
  clearFrictionlessPending,
  isFrictionlessAffirmation,
  loadFrictionlessPending,
  resolveFrictionlessAction,
  resolveFrictionlessContinuation,
  saveFrictionlessPending,
} from "./frictionlessActionLayer";

describe("googleSheetsIntelligence (P0.18)", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    };
    vi.stubGlobal("window", { dispatchEvent: vi.fn(), sessionStorage: storage });
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("sessionStorage", storage);
    clearGoogleSheetIntakeSession();
    clearFrictionlessPending();
  });

  it("content calendar → sheet intent", () => {
    expect(detectSheetIntent("Help me create a content calendar")).toBe(
      "content_calendar",
    );
  });

  it("lead tracker → sheet intent", () => {
    expect(detectSheetIntent("I need a lead tracker")).toBe("lead_follow_up");
    expect(detectSheetIntent("Track leads for my workshop")).toBe(
      "lead_follow_up",
    );
  });

  it("sales funnel tracker → sheet intent", () => {
    expect(detectSheetIntent("Create a sales funnel tracker")).toBe(
      "sales_funnel_tracker",
    );
  });

  it("property pricing sheet → sheet intent", () => {
    expect(detectSheetIntent("Make a property pricing sheet")).toBe(
      "property_pricing",
    );
  });

  it('"write an email" does not trigger Sheets', () => {
    expect(shouldExcludeSheetOffer("I need to write an email")).toBe(true);
    expect(detectSheetIntent("I need to write an email")).toBeNull();
    expect(detectSheetIntent("Help me draft a blog post")).toBeNull();
  });

  it("sheet templates generate correct columns", () => {
    expect(templateColumns("content_calendar")).toEqual([
      "Date",
      "Platform",
      "Topic",
      "Content Type",
      "Hook",
      "Caption",
      "CTA",
      "Status",
      "URL",
      "Notes",
    ]);
    expect(templateColumns("sales_funnel_tracker")).toContain("Stage");
    expect(templateColumns("lead_follow_up")).toContain("Follow-Up Date");
    expect(templateColumns("property_pricing")).toContain("Rent");
    expect(templateColumns("launch_checklist")).toContain("Task");
  });

  it("content calendar example flow through offer", () => {
    let session = startGoogleSheetIntake(
      "content_calendar",
      "Help me create a content calendar",
    ).session;

    const step1 = resolveGoogleSheetsTurn({
      userText: "Pinterest and Facebook",
      currentTurn: 2,
      session,
      isAffirmation: false,
    });
    expect(step1.outcome).toBe("ask");
    if (step1.outcome !== "ask") return;
    session = step1.session;

    const step2 = resolveGoogleSheetsTurn({
      userText: "10",
      currentTurn: 3,
      session,
      isAffirmation: false,
    });
    expect(step2.outcome).toBe("offer");
    if (step2.outcome !== "offer") return;
    expect(step2.reply).toMatch(/Google Sheet/i);
    expect(step2.pending.columns).toContain("Platform");

    const csv = buildSheetCsv(step2.session);
    const lines = csv.split("\n");
    expect(lines.length).toBe(11);
    expect(lines[0]).toContain("Platform");
    expect(lines[1]).toContain("Pinterest and Facebook");
  });

  it("yes after sheet offer creates pending continuation payload", () => {
    const offered = resolveGoogleSheetsTurn({
      userText: "10",
      currentTurn: 3,
      session: {
        sheetType: "content_calendar",
        phase: "collecting",
        answers: { platforms: "Pinterest and Facebook" },
        questionIndex: 1,
        originalPrompt: "Help me create a content calendar",
      },
      isAffirmation: false,
    });
    expect(offered.outcome).toBe("offer");
    if (offered.outcome !== "offer") return;

    saveFrictionlessPending({
      type: "create_google_sheet",
      target: "google-workspace",
      context: offered.pending.sheetType,
      sheetType: offered.pending.sheetType,
      sheetTitle: offered.pending.title,
      sheetCsv: offered.pending.csv,
      sheetColumns: offered.pending.columns,
      artifactType: offered.pending.artifactType,
      offeredAtTurn: 3,
      offerSummary: "Create Google Sheet",
    });
    saveGoogleSheetIntakeSession(offered.session);

    expect(isFrictionlessAffirmation("yes")).toBe(true);
    const pending = loadFrictionlessPending();
    expect(pending?.type).toBe("create_google_sheet");
    const cont = resolveFrictionlessContinuation("yes", pending!, 4);
    expect(cont?.execute).toBe(true);

    const createTurn = resolveGoogleSheetsTurn({
      userText: "yes",
      currentTurn: 4,
      session: loadGoogleSheetIntakeSession(),
      isAffirmation: true,
    });
    expect(createTurn.outcome).toBe("create");
    if (createTurn.outcome !== "create") return;
    expect(createTurn.pending.title).toMatch(/Content Calendar/i);
    expect(createTurn.pending.csv).toContain("Platform");
  });

  it("frictionless layer detects content calendar intake", () => {
    const decision = resolveFrictionlessAction({
      userText: "Help me create a content calendar",
      currentTurn: 1,
    });
    expect(decision.category).toBe("google_sheet");
    expect(decision.localReply).toMatch(/platform/i);
    expect(decision.googleSheetIntake?.sheetType).toBe("content_calendar");
  });

  it("frictionless does not hijack email requests", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to write an email",
      currentTurn: 1,
    });
    expect(decision.category).not.toBe("google_sheet");
  });

  it("buildGoogleSheetPendingPayload uses template artifact type", () => {
    const payload = buildGoogleSheetPendingPayload({
      sheetType: "sales_funnel_tracker",
      phase: "offered",
      answers: { funnelName: "Workshop funnel" },
      questionIndex: 1,
      originalPrompt: "sales funnel tracker",
    });
    expect(payload.artifactType).toBe(
      getGoogleSheetTemplate("sales_funnel_tracker").artifactType,
    );
    expect(payload.title).toMatch(/Workshop funnel/i);
  });
});

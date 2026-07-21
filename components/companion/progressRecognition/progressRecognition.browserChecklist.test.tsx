/**
 * 101 — Browser certification journeys (jsdom).
 * Win · Accomplishment · Evidence boundary · Business Pulse · Sound · A11y · Return
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BusinessPulsePanel } from "./BusinessPulsePanel";
import { RecognitionReviewPrompt } from "./RecognitionReviewPrompt";
import { CelebrationSoundPicker } from "./CelebrationSoundPicker";
import {
  buildBusinessPulse,
  classifyProgressRecognition,
  evaluateEvidenceEligibility,
  explainHowMovedBusinessForward,
  getRecognitionPreferences,
  listAccomplishmentRecords,
  listCelebrationRecords,
  listWinRecords,
  pickPrimaryReviewCandidate,
  resetProgressRecognitionAdaptersForTests,
  resetRecognitionPreferencesForTests,
  resolveCelebrationSound,
  saveAccomplishmentRecord,
  saveEvidenceRecognitionRecord,
  saveWinRecord,
  setRecognitionPreferences,
} from "@/lib/progressRecognition";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { getPortfolioEntries } from "@/lib/growthPortfolioStore";
import { getEvidenceEntries } from "@/lib/evidenceBankStore";

function click(el: Element | null) {
  expect(el).toBeTruthy();
  act(() => {
    (el as HTMLElement).click();
  });
}

function stubStorage() {
  const store = new Map<string, string>();
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
  vi.stubGlobal("localStorage", api);
  vi.stubGlobal("sessionStorage", api);
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
  Object.defineProperty(window, "sessionStorage", {
    value: api,
    configurable: true,
  });
}

describe("101 Progress Recognition browser certification", () => {
  let container: HTMLDivElement;
  let root: Root;
  const navigated: string[] = [];
  const returned: Array<Record<string, string | undefined>> = [];

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    resetProgressRecognitionAdaptersForTests();
    resetRecognitionPreferencesForTests();
    stubStorage();
    navigated.length = 0;
    returned.length = 0;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
    resetProgressRecognitionAdaptersForTests();
    resetRecognitionPreferencesForTests();
  });

  it("Win Flow: suggest → save → Garden → garden shows win → return to source section", () => {
    const candidates = classifyProgressRecognition({
      sourceType: "section",
      sourceId: "sec-audience",
      title: "Audience and Offer sections",
      workId: "work-workshop-1",
      projectId: "proj-sept",
      isMeaningfulSection: true,
    });
    const candidate = pickPrimaryReviewCandidate(candidates)!;
    expect(candidate.kind).toBe("win");

    act(() => {
      root.render(
        <RecognitionReviewPrompt
          candidate={candidate}
          returnPath={{
            workId: "work-workshop-1",
            sectionId: "sec-audience",
            projectId: "proj-sept",
          }}
          onNavigate={(placeId) => {
            navigated.push(placeId);
          }}
          onReturn={(path) => {
            returned.push(path);
          }}
        />,
      );
    });

    expect(
      container.querySelector("[data-testid='review-prompt-text']")?.textContent,
    ).toMatch(/save this as a win/i);

    click(container.querySelector("[data-testid='review-choice-save_win']"));
    expect(
      container.querySelector("[data-testid='celebration-route-offer']"),
    ).toBeTruthy();

    const wins = listWinRecords();
    expect(wins.some((w) => w.title.includes("Audience"))).toBe(true);
    expect(
      getSavedGrowthWins().some((w) => w.whatHappened.includes("Audience")),
    ).toBe(true);
    expect(getEvidenceEntries().length).toBe(0);

    click(container.querySelector("[data-testid='celebration-choice-go_garden']"));
    expect(navigated).toContain("gardens");
    expect(listCelebrationRecords().some((c) => c.destination === "garden")).toBe(
      true,
    );

    const returnBtn = container.querySelector(
      "[data-testid='recognition-return-source']",
    ) as HTMLButtonElement;
    expect(returnBtn).toBeTruthy();
    expect(returnBtn.getAttribute("data-return-work-id")).toBe("work-workshop-1");
    expect(returnBtn.getAttribute("data-return-section-id")).toBe("sec-audience");
    click(returnBtn);
    expect(returned[0]?.workId).toBe("work-workshop-1");
    expect(returned[0]?.sectionId).toBe("sec-audience");
  });

  it("Accomplishment Flow: suggest → Hall → optional sound → Hall entry → return", () => {
    const candidates = classifyProgressRecognition({
      sourceType: "blueprint",
      sourceId: "bp-workshop",
      title: "Published Workshop Blueprint",
      workId: "work-bp-1",
      blueprintId: "bp-workshop",
      isMajorDeliverable: true,
      isLaunchOrDelivery: true,
      durableBusinessAsset: true,
    });
    const candidate = pickPrimaryReviewCandidate(candidates)!;
    expect(candidate.kind).toBe("accomplishment");

    act(() => {
      root.render(
        <RecognitionReviewPrompt
          candidate={candidate}
          returnPath={{ workId: "work-bp-1", placeId: "create" }}
          onNavigate={(placeId) => {
            navigated.push(placeId);
          }}
          onReturn={(path) => {
            returned.push(path);
          }}
        />,
      );
    });

    click(container.querySelector("[data-testid='review-choice-add_hall']"));
    expect(listAccomplishmentRecords().length).toBeGreaterThanOrEqual(1);
    expect(
      getPortfolioEntries().some((e) =>
        e.title.includes("Published Workshop Blueprint"),
      ),
    ).toBe(true);

    click(container.querySelector("[data-testid='celebration-choice-go_hall']"));
    expect(navigated).toContain("portfolio");
    expect(
      container.querySelector("[data-testid='celebration-sound-picker']"),
    ).toBeTruthy();

    click(container.querySelector("[data-testid='sound-choice-none']"));
    click(container.querySelector("[data-testid='sound-done']"));

    click(container.querySelector("[data-testid='recognition-return-source']"));
    expect(returned[0]?.workId).toBe("work-bp-1");
  });

  it("Evidence Boundary: completion is not Evidence; lesson saves distinctly", () => {
    const completionOnly = evaluateEvidenceEligibility({ completionOnly: true });
    expect(completionOnly.eligible).toBe(false);

    saveAccomplishmentRecord({
      title: "Delivered the October workshop",
      sourceType: "project",
      sourceId: "proj-oct",
      occurredAt: new Date().toISOString(),
    });
    expect(getEvidenceEntries().length).toBe(0);

    const lesson = saveEvidenceRecognitionRecord({
      discovery: "Attendance improved when reminder emails were sent three days before",
      pattern: "Remind three days prior",
      sourceType: "project",
      sourceId: "proj-oct",
    });
    expect("evidenceId" in lesson).toBe(true);
    expect(getEvidenceEntries().length).toBe(1);
    expect(listAccomplishmentRecords().length).toBe(1);
    expect(getEvidenceEntries()[0]?.whatHappened).toMatch(/reminder emails/i);
  });

  it("Business Pulse: progressive disclosure, separate win/acc/evidence, no invented impact", () => {
    saveWinRecord({
      title: "Clarified offer",
      significance: "meaningful",
      sourceType: "decision",
      sourceId: "d-pulse",
      occurredAt: new Date().toISOString(),
    });
    saveAccomplishmentRecord({
      title: "Launched campaign",
      sourceType: "project",
      sourceId: "p-pulse",
      occurredAt: new Date().toISOString(),
    });
    saveEvidenceRecognitionRecord({
      discovery: "Warm subject lines outperformed clever ones",
      sourceType: "project",
      sourceId: "p-pulse",
    });

    const model = buildBusinessPulse();
    expect(model.recentWinCount).toBeGreaterThanOrEqual(1);
    expect(model.recentAccomplishmentCount).toBeGreaterThanOrEqual(1);
    expect(model.recentEvidenceCount).toBeGreaterThanOrEqual(1);

    const unclear = explainHowMovedBusinessForward({
      completedLabel: "Audience section",
    });
    expect(unclear.unclear).toBe(true);

    act(() => {
      root.render(<BusinessPulsePanel model={model} />);
    });
    expect(
      container.querySelector("[data-testid='pulse-primary']"),
    ).toBeTruthy();
    expect(container.querySelector("[data-testid='pulse-detail-moved']")).toBe(
      null,
    );
    click(container.querySelector("[data-testid='pulse-see-moved']"));
    const detail = container.querySelector(
      "[data-testid='pulse-detail-moved']",
    )?.textContent;
    expect(detail).toMatch(/Win:/);
    expect(detail).toMatch(/Accomplishment:/);

    click(container.querySelector("[data-testid='pulse-review']"));
    const review = container.querySelector(
      "[data-testid='pulse-detail-review']",
    )?.textContent;
    expect(review).toMatch(/Evidence:/);
  });

  it("Celebrate-here works without navigation; return path preserved", () => {
    const candidates = classifyProgressRecognition({
      sourceType: "section",
      sourceId: "sec-b",
      title: "Returned after stuck",
      workId: "work-2",
      isMeaningfulSection: true,
      returnedAfterStuck: true,
    });
    const candidate = pickPrimaryReviewCandidate(candidates)!;

    act(() => {
      root.render(
        <RecognitionReviewPrompt
          candidate={candidate}
          returnPath={{ workId: "work-2", sectionId: "sec-b" }}
          onNavigate={(placeId) => {
            navigated.push(placeId);
          }}
          onReturn={(path) => {
            returned.push(path);
          }}
        />,
      );
    });

    click(container.querySelector("[data-testid='review-choice-celebrate']"));
    click(container.querySelector("[data-testid='celebration-choice-here']"));
    expect(
      container.querySelector("[data-testid='celebrate-here-banner']"),
    ).toBeTruthy();
    expect(navigated).toHaveLength(0);
    expect(
      listCelebrationRecords().some((c) => c.destination === "in-place"),
    ).toBe(true);
    click(container.querySelector("[data-testid='recognition-return-source']"));
    expect(returned[0]?.sectionId).toBe("sec-b");
  });

  it("Sound: no auto-play; quiet hours suppress; no-sound choice; preview requires request", () => {
    expect(getRecognitionPreferences().neverAutoPlayCelebrationSounds).toBe(
      true,
    );
    expect(
      resolveCelebrationSound({
        chosenId: "gentle_chime",
        memberRequestedPlay: false,
      }).willPlay,
    ).toBe(false);

    setRecognitionPreferences({ quietHoursEnabled: true });
    expect(
      resolveCelebrationSound({
        chosenId: "gentle_chime",
        memberRequestedPlay: true,
      }).willPlay,
    ).toBe(false);

    resetRecognitionPreferencesForTests();
    act(() => {
      root.render(<CelebrationSoundPicker onClose={() => undefined} />);
    });
    click(container.querySelector("[data-testid='sound-choice-none']"));
    const noneBtn = container.querySelector(
      "[data-testid='sound-choice-none']",
    );
    expect(noneBtn?.getAttribute("aria-pressed")).toBe("true");
    expect(
      container.querySelector("[data-testid='sound-preview']"),
    ).toBeTruthy();
  });

  it("Accessibility: reduced-motion CSS present; keyboard-reachable controls", () => {
    const css = readFileSync(
      join(process.cwd(), "app/companion/progress-recognition.css"),
      "utf8",
    );
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/animation:\s*none/);

    act(() => {
      root.render(
        <BusinessPulsePanel
          model={{
            primaryStatement: "Everything is moving steadily.",
            meaningfulChanges: [],
            workInMotionCount: 0,
            recentWinCount: 0,
            recentAccomplishmentCount: 0,
            recentEvidenceCount: 0,
            nextHelpfulStep: "Continue when ready.",
            disclosure: {
              seeWhatMovedForward: [],
              seeConnections: [],
              reviewWinsAndAccomplishments: [],
            },
          }}
        />,
      );
    });
    const btn = container.querySelector(
      "[data-testid='pulse-see-moved']",
    ) as HTMLButtonElement;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it("Duplicate protection: same source event does not create repeated wins", () => {
    const input = {
      title: "Same completion moment",
      significance: "meaningful" as const,
      sourceType: "section" as const,
      sourceId: "dup-browser-1",
      occurredAt: "2026-07-21T12:00:00.000Z",
    };
    const first = saveWinRecord(input);
    const second = saveWinRecord(input);
    expect("winId" in first).toBe(true);
    expect("duplicateOf" in second).toBe(true);
    expect(listWinRecords().filter((w) => w.sourceId === "dup-browser-1")).toHaveLength(
      1,
    );
  });
});

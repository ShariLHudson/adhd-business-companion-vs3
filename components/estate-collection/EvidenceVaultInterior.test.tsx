/**
 * Evidence Vault home — empty/recent/draft/how-do-i/actions.
 * @vitest-environment jsdom
 */
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEvidenceEntry } from "@/lib/evidenceBankStore";
import { saveEvidenceVaultDraft } from "@/lib/estate/evidenceVaultDraft";
import { EvidenceVaultInterior } from "./EvidenceVaultInterior";

const STORAGE_KEY = "companion-evidence-bank-v1";

describe("EvidenceVaultInterior home", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.clear();
    sessionStorage.clear();
  });

  function renderHome(
    overrides: Partial<ComponentProps<typeof EvidenceVaultInterior>> = {},
  ) {
    const props = {
      journalActive: false,
      onOpenJournal: vi.fn(),
      onAddEvidence: vi.fn(),
      onContinueDraft: vi.fn(),
      onBrowseArchive: vi.fn(),
      onOpenEntry: vi.fn(),
      ...overrides,
    };
    act(() => {
      root.render(<EvidenceVaultInterior {...props} />);
    });
    return props;
  }

  it("shows empty state with one primary CTA", () => {
    renderHome();
    expect(
      container.querySelector('[data-testid="evidence-vault-empty-state"]'),
    ).toBeTruthy();
    expect(container.textContent).toMatch(/Every meaningful journey/);
    expect(
      container.querySelector('[data-testid="evidence-vault-add-first"]')
        ?.textContent,
    ).toMatch(/Add My First Evidence/);
    expect(
      container.querySelector('[data-testid="evidence-vault-primary-actions"]'),
    ).toBeNull();
  });

  it("keeps How Do I? collapsed by default", () => {
    renderHome();
    const details = container.querySelector(
      '[data-testid="evidence-vault-how-do-i"]',
    ) as HTMLDetailsElement | null;
    expect(details).toBeTruthy();
    expect(details?.open).toBe(false);
  });

  it("shows recent evidence for returning members", () => {
    createEvidenceEntry({
      category: "Client Result",
      whatHappened: "Helped a client finish their launch",
      whatImproved: "",
      whatMovedForward: "",
      whatProblemSolved: "",
      whoBenefited: "",
      whyItMattered: "",
      whatThisProves: "",
      attachments: [],
    });
    renderHome();
    expect(
      container.querySelector('[data-testid="evidence-vault-recent"]'),
    ).toBeTruthy();
    expect(container.textContent).toMatch(/Helped a client finish/);
    expect(
      container.querySelector('[data-testid="evidence-vault-add-evidence"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="evidence-vault-browse"]'),
    ).toBeTruthy();
  });

  it("shows Continue Draft only when an unfinished draft exists", () => {
    createEvidenceEntry({
      category: "Personal Growth",
      whatHappened: "Kept a promise to myself",
      whatImproved: "",
      whatMovedForward: "",
      whatProblemSolved: "",
      whoBenefited: "",
      whyItMattered: "",
      whatThisProves: "",
      attachments: [],
    });
    const withoutDraft = renderHome();
    expect(
      container.querySelector('[data-testid="evidence-vault-continue-draft"]'),
    ).toBeNull();

    saveEvidenceVaultDraft({ situation: "Halfway through a discovery" });
    act(() => {
      root.unmount();
    });
    root = createRoot(container);
    act(() => {
      root.render(
        <EvidenceVaultInterior
          journalActive={false}
          onOpenJournal={vi.fn()}
          onAddEvidence={withoutDraft.onAddEvidence}
          onContinueDraft={withoutDraft.onContinueDraft}
          onBrowseArchive={withoutDraft.onBrowseArchive}
        />,
      );
    });
    expect(
      container.querySelector('[data-testid="evidence-vault-continue-draft"]'),
    ).toBeTruthy();
  });

  it("Add Evidence starts the existing capture flow callback", () => {
    createEvidenceEntry({
      category: "Small Win",
      whatHappened: "Sent the email",
      whatImproved: "",
      whatMovedForward: "",
      whatProblemSolved: "",
      whoBenefited: "",
      whyItMattered: "",
      whatThisProves: "",
      attachments: [],
    });
    const props = renderHome();
    act(() => {
      container
        .querySelector('[data-testid="evidence-vault-add-evidence"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(props.onAddEvidence).toHaveBeenCalledTimes(1);
  });

  it("favorites and Surprise Me work from home", () => {
    const entry = createEvidenceEntry({
      category: "Gratitude",
      whatHappened: "A note that restored my courage",
      whatImproved: "",
      whatMovedForward: "",
      whatProblemSolved: "",
      whoBenefited: "",
      whyItMattered: "",
      whatThisProves: "",
      attachments: [],
    });
    renderHome();
    act(() => {
      container
        .querySelector(`[data-testid="evidence-vault-favorite-${entry.id}"]`)
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const favoriteBtn = container.querySelector(
      `[data-testid="evidence-vault-favorite-${entry.id}"]`,
    );
    expect(favoriteBtn?.getAttribute("aria-pressed")).toBe("true");

    act(() => {
      container
        .querySelector('[data-testid="evidence-vault-surprise"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(
      container.querySelector('[data-testid="evidence-vault-surprise-card"]'),
    ).toBeTruthy();
  });

  it("search filters evidence on the home", () => {
    createEvidenceEntry({
      category: "Testimonial",
      whatHappened: "She said the workshop changed everything",
      whatImproved: "",
      whatMovedForward: "",
      whatProblemSolved: "",
      whoBenefited: "",
      whyItMattered: "",
      whatThisProves: "",
      attachments: [],
    });
    createEvidenceEntry({
      category: "Health",
      whatHappened: "Slept through the night",
      whatImproved: "",
      whatMovedForward: "",
      whatProblemSolved: "",
      whoBenefited: "",
      whyItMattered: "",
      whatThisProves: "",
      attachments: [],
    });
    renderHome();
    const input = container.querySelector(
      '[data-testid="evidence-vault-search"]',
    ) as HTMLInputElement;
    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(input, "workshop");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(
      container.querySelector('[data-testid="evidence-vault-search-results"]')
        ?.textContent,
    ).toMatch(/workshop/i);
    expect(
      container.querySelector('[data-testid="evidence-vault-search-results"]')
        ?.textContent,
    ).not.toMatch(/Slept through/i);
  });

  it("does not mutate legacy storage shape when mounting empty", () => {
    localStorage.setItem(STORAGE_KEY, "[]");
    renderHome();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("[]");
  });
});

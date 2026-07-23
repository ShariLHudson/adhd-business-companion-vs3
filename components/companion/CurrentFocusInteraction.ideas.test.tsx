/**
 * @vitest-environment jsdom
 */
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CurrentFocusInteraction } from "./CurrentFocusInteraction";
import type { CanonicalCurrentFocus } from "@/lib/currentFocus";
import { clearSectionIdeasSessionsForTests } from "@/lib/universalWorkEngine/sectionRuntime/sectionIdeas";
import { ensureEventPlanWorkTypeRegistered } from "@/lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType";

let focusSerial = 0;

function makeFocus(sectionId = "agenda"): CanonicalCurrentFocus {
  focusSerial += 1;
  return {
    focusId: `section:${sectionId}`,
    creationId: `ws-ideas-ui-${focusSerial}`,
    title: sectionId === "agenda" ? "Agenda" : "Purpose",
    purpose: sectionId === "agenda" ? "Agenda" : "Purpose",
    prompt:
      sectionId === "agenda"
        ? "How will the day unfold?"
        : "What is this workshop for?",
    responseType: "multiline",
    knownContext: [],
    availableGuidance: ["Give me ideas"],
    completionCriteria: "Continue",
    nextTransition: null,
    contextVersion: 1,
    sectionId,
    introductoryGuidance: null,
    savedContent: "Keep the original purpose text",
  };
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  clearSectionIdeasSessionsForTests();
  ensureEventPlanWorkTypeRegistered();
  window.localStorage.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

async function flushIdeas() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 10));
  });
}
async function openIdeasPanel() {
  const needHand = container.querySelector(
    "[data-testid='current-focus-need-a-hand']",
  ) as HTMLButtonElement;
  act(() => {
    needHand.click();
  });
  const ideasBtn = container.querySelector(
    "[data-testid='current-focus-ideas']",
  ) as HTMLButtonElement;
  expect(ideasBtn).toBeTruthy();
  act(() => {
    ideasBtn.click();
  });
  expect(
    container.querySelector("[data-testid='current-focus-ideas-loading']"),
  ).toBeTruthy();
  await flushIdeas();
  expect(
    container.querySelector("[data-testid='current-focus-ideas-panel']"),
  ).toBeTruthy();
}
describe("CurrentFocusInteraction — Give me ideas", () => {
  it("shows loading then suggestions without overwriting the answer", async () => {
    const onIdeas = vi.fn();
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus()}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onIdeas={onIdeas}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });

    const needHand = container.querySelector(
      "[data-testid='current-focus-need-a-hand']",
    ) as HTMLButtonElement;
    act(() => {
      needHand.click();
    });
    const ideasBtn = container.querySelector(
      "[data-testid='current-focus-ideas']",
    ) as HTMLButtonElement;
    act(() => {
      ideasBtn.click();
    });

    expect(
      container.querySelector("[data-testid='current-focus-ideas-loading']"),
    ).toBeTruthy();
    expect(onIdeas).toHaveBeenCalledTimes(1);

    await flushIdeas();

    expect(
      container.querySelector("[data-testid='current-focus-ideas-panel']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='current-focus-idea-option-0']"),
    ).toBeTruthy();

    const ta = container.querySelector(
      "[data-testid='current-focus-response']",
    ) as HTMLTextAreaElement;
    expect(ta.value).toBe("Keep the original purpose text");
  });

  it("Add to My Answer appends without replacing existing content", async () => {
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus()}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });

    await openIdeasPanel();

    const ta = () =>
      container.querySelector(
        "[data-testid='current-focus-response']",
      ) as HTMLTextAreaElement;
    expect(ta().value).toBe("Keep the original purpose text");

    const addBtn = container.querySelector(
      "[data-testid='current-focus-ideas-add']",
    ) as HTMLButtonElement;
    expect(addBtn).toBeTruthy();
    act(() => {
      addBtn.click();
    });
    expect(ta().value).toContain("Keep the original purpose text");
    expect(ta().value.length).toBeGreaterThan(
      "Keep the original purpose text".length + 10,
    );
  });

  it("duplicate clicks while loading do not spawn parallel requests", async () => {
    const onIdeas = vi.fn();
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus()}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onIdeas={onIdeas}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-need-a-hand']",
        ) as HTMLButtonElement
      ).click();
    });
    const ideasBtn = container.querySelector(
      "[data-testid='current-focus-ideas']",
    ) as HTMLButtonElement;
    act(() => {
      ideasBtn.click();
      ideasBtn.click();
      ideasBtn.click();
    });
    expect(onIdeas).toHaveBeenCalledTimes(1);
    await flushIdeas();
  });

  it("Close dismisses the ideas panel and preserves workspace content", async () => {
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus()}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });
    await openIdeasPanel();
    const closeBtn = container.querySelector(
      "[data-testid='current-focus-ideas-close']",
    ) as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    act(() => {
      closeBtn.click();
    });
    expect(
      container.querySelector("[data-testid='current-focus-ideas-panel']"),
    ).toBeNull();
    const ta = container.querySelector(
      "[data-testid='current-focus-response']",
    ) as HTMLTextAreaElement;
    expect(ta.value).toBe("Keep the original purpose text");
  });

  it("Refresh Ideas changes the suggestion set", async () => {
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus("agenda")}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });
    await openIdeasPanel();
    const first = (
      container.querySelector(
        "[data-testid='current-focus-idea-option-0']",
      ) as HTMLElement
    ).getAttribute("data-idea-id");
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas-retry']",
        ) as HTMLButtonElement
      ).click();
    });
    await flushIdeas();
    const second = (
      container.querySelector(
        "[data-testid='current-focus-idea-option-0']",
      ) as HTMLElement
    ).getAttribute("data-idea-id");
    expect(second).toBeTruthy();
    expect(second).not.toBe(first);
  });

  it("More Ideas appends additional suggestions", async () => {
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus("agenda")}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });
    await openIdeasPanel();
    const before = container.querySelectorAll(
      "[data-testid^='current-focus-idea-option-']",
    ).length;
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas-more']",
        ) as HTMLButtonElement
      ).click();
    });
    await flushIdeas();
    const after = container.querySelectorAll(
      "[data-testid^='current-focus-idea-option-']",
    ).length;
    expect(after).toBeGreaterThan(before);
  });

  it("Expand This Idea shows richer content without auto-inserting", async () => {
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus("agenda")}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });
    await openIdeasPanel();
    const before = (
      container.querySelector(
        "[data-testid='current-focus-response']",
      ) as HTMLTextAreaElement
    ).value;
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas-expand']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector("[data-testid='current-focus-ideas-expanded']"),
    ).toBeTruthy();
    const expanded = container.querySelector(
      "[data-testid='current-focus-idea-expanded']",
    )?.textContent;
    expect(expanded?.length).toBeGreaterThan(40);
    expect(expanded).toMatch(/timing|purpose|facilitat|activity|transition/i);
    expect(
      (
        container.querySelector(
          "[data-testid='current-focus-response']",
        ) as HTMLTextAreaElement
      ).value,
    ).toBe(before);
  });

  it("Add Expanded Idea inserts safely without losing prior content", async () => {
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus("agenda")}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });
    await openIdeasPanel();
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas-expand']",
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas-add-expanded']",
        ) as HTMLButtonElement
      ).click();
    });
    const ta = container.querySelector(
      "[data-testid='current-focus-response']",
    ) as HTMLTextAreaElement;
    expect(ta.value).toContain("Keep the original purpose text");
    expect(ta.value.length).toBeGreaterThan(
      "Keep the original purpose text".length + 20,
    );
  });

  it("Add Original Idea appends the short form from the expanded view", async () => {
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus("agenda")}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });
    await openIdeasPanel();
    const originalSnippet = (
      container.querySelector(
        "[data-testid='current-focus-idea-option-0']",
      ) as HTMLElement
    ).textContent?.replace(/^\d+\.\s*/, "");
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas-expand']",
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas-add-original']",
        ) as HTMLButtonElement
      ).click();
    });
    const ta = container.querySelector(
      "[data-testid='current-focus-response']",
    ) as HTMLTextAreaElement;
    expect(ta.value).toContain("Keep the original purpose text");
    if (originalSnippet) {
      expect(ta.value).toContain(originalSnippet.trim().slice(0, 24));
    }
  });

  it("exposes accessibility states for loading and expanded ideas", async () => {
    act(() => {
      root.render(
        <CurrentFocusInteraction
          focus={makeFocus("agenda")}
          guidance={null}
          failureMessage={null}
          onSubmit={() => {}}
          onUnsure={() => {}}
          workTypeId="event_plan"
        />,
      );
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-need-a-hand']",
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas']",
        ) as HTMLButtonElement
      ).click();
    });
    const loadingPanel = container.querySelector(
      "[data-testid='current-focus-ideas-panel']",
    ) as HTMLElement;
    expect(loadingPanel.getAttribute("aria-busy")).toBe("true");
    await flushIdeas();
    act(() => {
      (
        container.querySelector(
          "[data-testid='current-focus-ideas-expand']",
        ) as HTMLButtonElement
      ).click();
    });
    const expanded = container.querySelector(
      "[data-testid='current-focus-ideas-expanded']",
    );
    expect(expanded?.getAttribute("aria-label")).toMatch(/expanded idea/i);
    expect(
      container.querySelector("[data-testid='current-focus-ideas-intro']")
        ?.getAttribute("role"),
    ).toBe("status");
  });
});

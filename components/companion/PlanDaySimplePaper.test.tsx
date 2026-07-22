/**
 * Plan My Day simple paper layout chrome + How Do I copy.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PlanDayHowDoI,
  PLAN_DAY_HOW_DO_I_COPY,
} from "@/components/companion/PlanDayHowDoI";
import { PlanDayJourneyShell } from "@/components/companion/PlanDayJourneyShell";
import { PlanDaySimpleAdd } from "@/components/companion/PlanDaySimpleAdd";
import { PlanDaySimpleList } from "@/components/companion/PlanDaySimpleList";

describe("Plan My Day simple paper", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  it("keeps How Do I closed with the paper help copy", () => {
    act(() => {
      root.render(<PlanDayHowDoI />);
    });
    expect(
      container.querySelector("[data-testid='plan-day-how-do-i-body']"),
    ).toBeNull();
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-how-do-i-toggle']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector("[data-testid='plan-day-how-do-i-body']")
        ?.textContent,
    ).toContain("Write down anything you want to do today.");
    expect(
      container.querySelector("[data-testid='plan-day-how-do-i-body']")
        ?.textContent,
    ).toContain("Don't worry about organizing it.");
    expect(
      container.querySelector("[data-testid='plan-day-how-do-i-body']")
        ?.textContent,
    ).toContain("You can always change it later.");
    expect(PLAN_DAY_HOW_DO_I_COPY).toContain(
      "Write down anything you want to do today.",
    );  });

  it("orders How Do I, Previous Screen, then Plan My Day title", () => {
    act(() => {
      root.render(
        <PlanDayJourneyShell
          chapter="todays-plan"
          onBack={() => undefined}
          onBackToChat={() => undefined}
          memberOrderLayout
        >
          <div data-testid="plan-day-order-child">child</div>
        </PlanDayJourneyShell>,
      );
    });

    const order = [
      ...container.querySelectorAll(
        "[data-testid='plan-day-how-do-i'], [data-testid='app-back-button'], h1, [data-testid='plan-day-order-child']",
      ),
    ].map((el) => {
      if (el.getAttribute("data-testid") === "plan-day-how-do-i") {
        return "how-do-i";
      }
      if (el.getAttribute("data-testid") === "app-back-button") {
        return "previous";
      }
      if (el.tagName === "H1") return el.textContent?.trim() ?? "";
      return "child";
    });

    expect(order).toEqual(["how-do-i", "previous", "Plan My Day", "child"]);
    expect(
      container.querySelectorAll("[data-testid='app-back-button']"),
    ).toHaveLength(1);
  });

  it("renders one add input without category fields", () => {
    act(() => {
      root.render(<PlanDaySimpleAdd onAdd={() => undefined} />);
    });
    const input = container.querySelector(
      "[data-testid='plan-day-simple-input']",
    ) as HTMLInputElement;
    expect(input?.placeholder).toBe("What would you like to do today?");
    expect(container.textContent).not.toMatch(/Optional details|Add to/i);
    expect(
      container.querySelector("[data-testid='plan-day-simple-add-button']")
        ?.textContent,
    ).toBe("Add");
  });

  it("lists complete control with more-menu edit/delete (no always-visible trash)", () => {
    act(() => {
      root.render(
        <PlanDaySimpleList
          items={[
            {
              id: "1",
              title: "Finish proposal",
              column: "today",
              done: false,
            } as never,
          ]}
          onComplete={() => undefined}
          onEdit={() => undefined}
          onDelete={() => undefined}
        />,
      );
    });
    expect(container.textContent).toContain("Today's List");
    expect(container.textContent).toContain("Finish proposal");
    expect(
      container.querySelector("[data-testid='plan-day-simple-complete-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-more-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-simple-edit-1']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='plan-day-simple-delete-1']"),
    ).toBeNull();
  });
});

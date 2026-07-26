/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspaceStepControls } from "./WorkspaceStepControls";

describe("WorkspaceStepControls", () => {
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

  function baseProps() {
    return {
      onBack: vi.fn(),
      onSkip: vi.fn(),
      onSaveProgress: vi.fn(),
      onSaveAndContinue: vi.fn(),
    };
  }

  it("offers all four affordances", () => {
    act(() => {
      root.render(
        <WorkspaceStepControls {...baseProps()} canSaveProgress />,
      );
    });
    const labels = [...container.querySelectorAll("button")].map(
      (b) => b.textContent,
    );
    expect(labels).toContain("Back");
    expect(labels).toContain("Skip for Now");
    expect(labels).toContain("Save Progress");
    expect(labels).toContain("Save and Continue");
  });

  it("disables Save Progress when there is nothing new to save", () => {
    act(() => {
      root.render(
        <WorkspaceStepControls {...baseProps()} canSaveProgress={false} />,
      );
    });
    const save = container.querySelector(
      '[data-testid="save-progress"]',
    ) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
  });

  it("shows the calm confirmation only when saved and clean", () => {
    act(() => {
      root.render(
        <WorkspaceStepControls
          {...baseProps()}
          canSaveProgress={false}
          savedHint
        />,
      );
    });
    expect(container.textContent).toContain("Progress saved.");

    act(() => {
      root.render(
        <WorkspaceStepControls {...baseProps()} canSaveProgress savedHint />,
      );
    });
    expect(container.textContent).not.toContain("Progress saved.");
  });

  it("wires each control to its handler", () => {
    const props = baseProps();
    act(() => {
      root.render(<WorkspaceStepControls {...props} canSaveProgress />);
    });
    const byLabel = (label: string) =>
      [...container.querySelectorAll("button")].find(
        (b) => b.textContent === label,
      ) as HTMLButtonElement;
    act(() => {
      byLabel("Save and Continue").click();
    });
    expect(props.onSaveAndContinue).toHaveBeenCalledOnce();
    act(() => {
      byLabel("Skip for Now").click();
    });
    expect(props.onSkip).toHaveBeenCalledOnce();
  });
});

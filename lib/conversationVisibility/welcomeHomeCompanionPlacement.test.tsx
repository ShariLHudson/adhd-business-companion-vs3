/**
 * @vitest-environment jsdom
 *
 * Companion On/Off belongs in SH → Conversations — never on the Welcome Home
 * daily opening card.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CompanionVisibilityProvider } from "@/components/companion/CompanionVisibilityContext";
import { WelcomeHomeFrostedChatPanel } from "@/components/companion/WelcomeHomeFrostedChatPanel";
import { ESTATE_MENU_DROPDOWN_ENTRIES } from "@/lib/estateMenu";

function readFrostedSource(): string {
  return readFileSync(
    resolve(
      process.cwd(),
      "components/companion/WelcomeHomeFrostedChatPanel.tsx",
    ),
    "utf8",
  );
}

function readQuietSource(): string {
  return readFileSync(
    resolve(
      process.cwd(),
      "components/companion/CompanionConversationQuietState.tsx",
    ),
    "utf8",
  );
}

function readDailyOpeningSource(): string {
  return readFileSync(
    resolve(
      process.cwd(),
      "components/companion/GlobalDailyCompanionOpening.tsx",
    ),
    "utf8",
  );
}

function readChoiceCardsSource(): string {
  return readFileSync(
    resolve(process.cwd(), "lib/dailyOpening/buildDailyOpeningChoiceCards.ts"),
    "utf8",
  );
}

describe("Welcome Home Companion control placement", () => {
  it("does not mount CompanionConversationControls in the frosted daily panel", () => {
    const source = readFrostedSource();
    expect(source).not.toContain("CompanionConversationControls");
    expect(source).not.toContain("companion-conversation-controls");
  });

  it("SH Conversations menu owns New Chat, New Day, and Companion On/Off", () => {
    const conversations = ESTATE_MENU_DROPDOWN_ENTRIES.find(
      (e) => e.kind === "group" && e.id === "conversations",
    );
    expect(conversations?.kind).toBe("group");
    if (conversations?.kind !== "group") return;
    const labels = conversations.children.map((c) => c.label);
    expect(labels).toContain("New Chat");
    expect(labels).toContain("New Day");
    expect(labels).toContain("Companion: On");
    expect(labels).not.toContain("New Day Chat");
  });

  it("daily opening card still exposes the three approved choices", () => {
    const ui = readDailyOpeningSource();
    const cards = readChoiceCardsSource();
    expect(ui).toContain('data-testid="todays-welcome-card"');
    expect(ui).not.toContain("CompanionConversationControls");
    expect(ui).not.toContain("companion-control-new-chat");
    expect(cards).toMatch(/Continue Where You Left Off|Review Where You Left Off/);
    expect(cards).toMatch(/Plan or Adapt My Day/);
    expect(cards).toMatch(/Help Me Choose/);
    expect(cards).not.toContain("Companion: On");
    expect(cards).not.toContain("New Chat");
  });

  it("quiet-state copy is short and not place-specific", () => {
    const source = readQuietSource();
    expect(source).toContain("Companion conversation is off.");
    expect(source).not.toContain("off in this place");
  });
});

describe("WelcomeHomeFrostedChatPanel Companion Off behavior", () => {
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

  it("keeps the daily opening visible when Companion is Off", () => {
    act(() => {
      root.render(
        <CompanionVisibilityProvider
          value={{
            visibility: "off",
            destinationId: "welcome-home",
            showControls: true,
            onToggle: () => {},
            onTurnOn: () => {},
            onNewChat: () => {},
            onNewDay: () => {},
          }}
        >
          <WelcomeHomeFrostedChatPanel
            showWelcomeLine
            welcomeSlot={
              <div data-testid="todays-welcome-card">
                <p>Shari daily message</p>
                <button type="button">Review Where You Left Off</button>
                <button type="button">Plan or Adapt My Day</button>
                <button type="button">Help Me Choose</button>
              </div>
            }
            showConversation={false}
            thread={<div data-testid="chat-thread">thread</div>}
            footer={<div data-testid="chat-footer">input</div>}
          />
        </CompanionVisibilityProvider>,
      );
    });

    expect(
      container.querySelector('[data-testid="todays-welcome-card"]'),
    ).toBeTruthy();
    expect(container.textContent).toContain("Shari daily message");
    expect(container.textContent).toContain("Review Where You Left Off");
    expect(container.textContent).toContain("Plan or Adapt My Day");
    expect(container.textContent).toContain("Help Me Choose");
    expect(
      container.querySelector('[data-testid="companion-conversation-controls"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="companion-conversation-quiet-state"]'),
    ).toBeNull();
    expect(container.querySelector('[data-testid="chat-footer"]')).toBeNull();
    expect(container.querySelector('[data-testid="chat-thread"]')).toBeNull();
  });

  it("shows quiet state only when Companion is Off and there is no daily opening", () => {
    act(() => {
      root.render(
        <CompanionVisibilityProvider
          value={{
            visibility: "off",
            destinationId: "welcome-home",
            showControls: true,
            onToggle: () => {},
            onTurnOn: () => {},
            onNewChat: () => {},
            onNewDay: () => {},
          }}
        >
          <WelcomeHomeFrostedChatPanel
            showWelcomeLine={false}
            showConversation
            thread={<div data-testid="chat-thread">thread</div>}
            footer={<div data-testid="chat-footer">input</div>}
          />
        </CompanionVisibilityProvider>,
      );
    });

    expect(
      container.querySelector('[data-testid="companion-conversation-quiet-state"]'),
    ).toBeTruthy();
    expect(container.textContent).toContain("Companion conversation is off.");
    expect(container.textContent).not.toContain("off in this place");
    expect(container.querySelector('[data-testid="chat-thread"]')).toBeNull();
  });
});

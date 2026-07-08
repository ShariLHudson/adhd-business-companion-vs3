import { describe, expect, it } from "vitest";

import {
  BANNED_UI_REFERENCE_HINT,
  panelOpenFailureMessage,
  workspaceOpenFailureMessage,
} from "./conversationFirstLanguage";

describe("conversationFirstLanguage", () => {
  it("bans legacy menu and sidebar directions in companion hints", () => {
    expect(BANNED_UI_REFERENCE_HINT).toMatch(/menu/i);
    expect(BANNED_UI_REFERENCE_HINT).toMatch(/sidebar/i);
    expect(BANNED_UI_REFERENCE_HINT).toMatch(/Conversation first/i);
  });

  it("uses conversation-first workspace failure copy", () => {
    const msg = workspaceOpenFailureMessage("Create");
    expect(msg).not.toMatch(/in the menu/i);
    expect(msg).toMatch(/try again/i);
  });

  it("uses conversation-first panel failure copy", () => {
    const msg = panelOpenFailureMessage("Create");
    expect(msg).not.toMatch(/in the menu/i);
    expect(msg).toMatch(/start together/i);
  });
});

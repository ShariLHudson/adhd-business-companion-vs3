import { describe, expect, it } from "vitest";
import { getChamberMemberById } from "./chamberMemberRegistry";
import {
  chamberConversationTitle,
  formatChamberConversationTranscript,
} from "./chamberConversationExport";

describe("chamberConversationExport", () => {
  it("labels assistant lines with the active member name", () => {
    const member = getChamberMemberById("finance");
    expect(member).toBeTruthy();
    if (!member) return;

    const text = formatChamberConversationTranscript(
      [
        { role: "user", text: "I need help with pricing." },
        { role: "assistant", text: "Let's simplify this together." },
      ],
      member,
    );

    expect(text).toContain("You:\nI need help with pricing.");
    expect(text).toContain(`${member.displayName}:\nLet's simplify this together.`);
  });

  it("builds a title from the member and first user message", () => {
    const member = getChamberMemberById("finance");
    expect(member).toBeTruthy();
    if (!member) return;

    expect(
      chamberConversationTitle(member, [
        { role: "user", text: "Cash flow feels overwhelming" },
      ]),
    ).toContain(member.displayName);
  });
});

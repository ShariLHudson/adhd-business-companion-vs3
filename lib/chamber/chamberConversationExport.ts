/**
 * Chamber of Momentum — save/print conversation artifacts.
 */

import type { ChamberMember } from "./chamberMemberRegistry";

export type ChamberConversationLine = {
  role: "user" | "assistant" | "system";
  text: string;
};

export function formatChamberConversationTranscript(
  lines: ChamberConversationLine[],
  member: ChamberMember,
): string {
  const memberName = member.displayName;
  return lines
    .filter((line) => line.role !== "system")
    .map((line) => {
      const speaker = line.role === "user" ? "You" : memberName;
      return `${speaker}:\n${line.text.trim()}`;
    })
    .join("\n\n");
}

export function chamberConversationTitle(
  member: ChamberMember,
  lines: ChamberConversationLine[],
): string {
  const firstUser = lines.find((line) => line.role === "user")?.text.trim();
  if (firstUser) {
    return `${member.displayName} — ${firstUser.slice(0, 48)}`;
  }
  return `Chamber — ${member.displayName}`;
}

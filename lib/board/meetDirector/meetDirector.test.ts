/**
 * Meet This Director — routing, overlay, and perspective isolation.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { getBoardDirectorById } from "@/lib/board/boardDirectorRegistry";
import {
  MEET_DIRECTOR_OPENING,
  craftMeetDirectorReply,
  createInitialMeetConversation,
  isMeetConversationActive,
  meetDirectorCtaLabel,
  meetDirectorOpeningMessage,
  openMeetDirectorConversation,
  returnToDirectorProfile,
  returnToDirectorsGallery,
  routeToDirectorProfile,
} from "@/lib/board/meetDirector";

describe("Meet This Director", () => {
  it("uses Meet Thomas CTA for the Chair", () => {
    const chair = getBoardDirectorById("board-chair");
    expect(chair?.name).toBe("Thomas Ellison");
    expect(meetDirectorCtaLabel(chair!)).toBe("Meet Thomas");
  });

  it("opens with the exact private welcome — not a Board meeting opener", () => {
    const opening = meetDirectorOpeningMessage();
    expect(opening).toBe(MEET_DIRECTOR_OPENING);
    expect(opening).toBe(
      "Welcome. I'm glad you're here. What decision or situation would you like us to examine together?",
    );
    expect(opening.toLowerCase()).not.toContain("chamber");
  });

  it("keeps Meet as an overlay route over the same Director profile", () => {
    const meet = openMeetDirectorConversation("board-chair");
    expect(meet.route).toEqual({ screen: "meet", directorId: "board-chair" });
    expect(meet.conversation?.open).toBe(true);
    expect(meet.conversation?.messages[0]?.content).toBe(
      meetDirectorOpeningMessage(),
    );
    expect(isMeetConversationActive(meet)).toBe(true);

    const back = returnToDirectorProfile(meet);
    expect(back.route).toEqual({
      screen: "profile",
      directorId: "board-chair",
    });
    expect(back.conversation?.open).toBe(false);
    expect(isMeetConversationActive(back)).toBe(false);
  });

  it("returns to gallery without opening a Board discussion", () => {
    const fromProfile = routeToDirectorProfile("board-chair");
    expect(returnToDirectorsGallery()).toEqual({
      route: { screen: "gallery" },
      conversation: null,
    });
    expect(fromProfile.conversation).toBeNull();
  });

  it("Director replies only from their own perspective", () => {
    const chair = getBoardDirectorById("board-chair")!;
    const reply = craftMeetDirectorReply(
      chair,
      "Should we launch a new offer this quarter?",
    );
    expect(reply.toLowerCase()).toMatch(
      /long-term|decision|chair|clarity|recommend/,
    );
    expect(reply.toLowerCase()).not.toMatch(/board consensus|the board agrees/);
    expect(createInitialMeetConversation("board-chair").directorId).toBe(
      "board-chair",
    );
  });

  it("recommends Chamber only for implementation — never routes there", () => {
    const chair = getBoardDirectorById("board-chair")!;
    const reply = craftMeetDirectorReply(
      chair,
      "Help me implement and build the launch plan",
    );
    expect(reply.toLowerCase()).toMatch(/chamber/);
    expect(reply.toLowerCase()).toMatch(/decision/);
  });
});

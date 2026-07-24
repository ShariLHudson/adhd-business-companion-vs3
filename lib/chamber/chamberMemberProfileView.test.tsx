import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ChamberActiveMemberCard } from "@/components/companion/chamber/ChamberActiveMemberCard";
import { ChamberMemberProfileView } from "@/components/companion/chamber/ChamberMemberProfileView";
import { ChamberOfMomentumRoomPanel } from "@/components/companion/chamber/ChamberOfMomentumRoomPanel";
import { getChamberMemberById } from "@/lib/chamber/chamberMemberRegistry";
import {
  shouldShowChamberChat,
  shouldShowChamberGallery,
  shouldShowChamberMemberProfile,
} from "@/lib/chamber/chamberViewMode";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Chamber focused member profile view", () => {
  const member = getChamberMemberById("ai-technology")!;

  it("About This Member button uses white readable text", () => {
    const css = read("app/companion/chamber-member-gallery.css");
    expect(css).toMatch(
      /\.chamber-active-member__about\s*\{[\s\S]*?color:\s*#ffffff/,
    );
    expect(css).toMatch(
      /\.chamber-active-member__about\s*\{[\s\S]*?background:\s*#1a3d5c/,
    );
    const html = renderToStaticMarkup(
      <ChamberActiveMemberCard
        member={member}
        onEndConversation={() => {}}
        onAboutMember={() => {}}
      />,
    );
    expect(html).toContain("About This Member");
    expect(html).toContain("chamber-active-member-about");
    expect(html).toContain("Return to gallery");
  });

  it("view-mode helpers keep gallery, profile, and chat mutually exclusive", () => {
    expect(shouldShowChamberGallery("gallery")).toBe(true);
    expect(shouldShowChamberGallery("member_profile")).toBe(false);
    expect(shouldShowChamberMemberProfile("member_profile")).toBe(true);
    expect(shouldShowChamberChat("member_profile", "ai-technology")).toBe(
      false,
    );
    expect(shouldShowChamberChat("member_chat", "ai-technology")).toBe(true);
    expect(shouldShowChamberChat("member_chat", null)).toBe(false);
  });

  it("profile view shows only the selected member and return/talk actions", () => {
    const html = renderToStaticMarkup(
      <ChamberMemberProfileView
        member={member}
        onReturnToGallery={() => {}}
        onTalkWithMember={() => {}}
      />,
    );
    expect(html).toContain("chamber-member-profile-view");
    expect(html).toContain('data-chamber-view="member_profile"');
    expect(html).toContain("AI &amp; Technology Intelligence");
    expect(html).toContain("How they can help");
    expect(html).toContain("Return to gallery");
    expect(html).toContain("Talk With AI &amp; Technology Intelligence");
    expect(html).not.toContain("chamber-member-gallery-grid");
    expect(html).not.toContain("Twenty-four specialized intelligences");
  });

  it("RoomPanel hides chat chrome unless member_chat mode", () => {
    const panel = read(
      "components/companion/chamber/ChamberOfMomentumRoomPanel.tsx",
    );
    expect(panel).toContain("shouldShowChamberChat");
    expect(panel).toContain('data-chamber-view={viewMode}');
    expect(panel).toContain("EstateRoomChatChrome");
    expect(panel).toMatch(/showChat\s*\?\s*\(/);
  });

  it("EntryPanel opens focused profile and does not stack gallery under it", () => {
    const entry = read(
      "components/companion/chamber/ChamberOfMomentumEntryPanel.tsx",
    );
    expect(entry).toContain("ChamberMemberProfileView");
    expect(entry).toContain("openMemberProfile");
    expect(entry).toContain('viewMode === "member_profile"');
    expect(entry).toContain("onAboutMember");
    expect(entry).toMatch(/showMainGallery\s*=\s*viewMode === "gallery"/);
    expect(entry).not.toContain("ChamberMemberProfileModal");
  });

  it("profile is an in-flow view, not a fixed overlay competing with chat", () => {
    const css = read("app/companion/chamber-member-gallery.css");
    const profileView = read(
      "components/companion/chamber/ChamberMemberProfileView.tsx",
    );
    expect(profileView).not.toContain("position: fixed");
    expect(profileView).not.toContain("aria-modal");
    expect(css).toContain(".chamber-member-profile-view");
    expect(css).toContain("max-height: min(88vh, 52rem)");
    expect(css).toContain("overflow-y: auto");
  });

  it("RoomPanel source keeps a single active content region contract", () => {
    const html = renderToStaticMarkup(
      <ChamberOfMomentumRoomPanel
        onBack={() => {}}
        activeMemberId={null}
        onInviteMember={() => {}}
        onEndMemberConversation={() => {}}
        thread={<div data-testid="thread">thread</div>}
        footer={<div data-testid="footer">footer</div>}
      />,
    );
    expect(html).toContain('data-chamber-view="gallery"');
    expect(html).not.toContain("chamber-room__chat-panel");
  });
});

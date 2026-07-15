/**
 * @vitest-environment node
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ChamberMemberGallery } from "@/components/companion/chamber/ChamberMemberGallery";
import { ChamberActiveMemberCard } from "@/components/companion/chamber/ChamberActiveMemberCard";
import { ChamberMemberProfileModal } from "@/components/companion/chamber/ChamberMemberProfileModal";
import {
  CHAMBER_MEMBER_ASSET_BASE,
  CHAMBER_MEMBER_IDS,
  CHAMBER_MEMBERS,
  getChamberMemberById,
  isChamberMemberId,
  listActiveChamberMembers,
} from "./chamberMemberRegistry";
import {
  activateChamberMember,
  stripChamberMemberActivationMessages,
} from "./chamberMemberActivation";
import { listAllBoardMembers } from "@/lib/boardroom";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const CANON_ASSET_DIR = path.join(PUBLIC_DIR, "momentum-chamber-members");

const LEGACY_PATH_MARKERS = [
  "momentum chamber members/",
  "chamber-of-momentum-member",
  "execution=manager",
  "momemtum chamber members",
] as const;

function publicPathToDisk(publicPath: string): string {
  return path.join(PUBLIC_DIR, publicPath.replace(/^\//, ""));
}

describe("chamberMemberRegistry", () => {
  it("registers exactly 24 unique members", () => {
    expect(CHAMBER_MEMBERS).toHaveLength(24);
    expect(CHAMBER_MEMBER_IDS).toHaveLength(24);
    const ids = CHAMBER_MEMBERS.map((member) => member.id);
    expect(new Set(ids).size).toBe(24);
  });

  it("fails when two members share the same ID", () => {
    const ids = CHAMBER_MEMBERS.map((m) => m.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it("uses browser-safe public image paths", () => {
    for (const member of CHAMBER_MEMBERS) {
      expect(member.cardImagePath.startsWith(`${CHAMBER_MEMBER_ASSET_BASE}/`)).toBe(
        true,
      );
      expect(member.cardImagePath.startsWith("/")).toBe(true);
      expect(member.cardImagePath).not.toContain(" ");
      expect(member.cardImagePath).not.toContain("\\");
      expect(member.cardImagePath.endsWith(".png")).toBe(true);
    }
  });

  it("has no duplicate image paths", () => {
    const paths = CHAMBER_MEMBERS.map((member) => member.cardImagePath);
    expect(new Set(paths).size).toBe(24);
  });

  it("requires every active member image file to exist", () => {
    for (const member of CHAMBER_MEMBERS) {
      const disk = publicPathToDisk(member.cardImagePath);
      expect(existsSync(disk), `${member.id} missing ${member.cardImagePath}`).toBe(
        true,
      );
    }
  });

  it("requires unique portrait file contents (no shared art)", () => {
    const hashes = new Map<string, string>();
    for (const member of CHAMBER_MEMBERS) {
      const bytes = readFileSync(publicPathToDisk(member.cardImagePath));
      const hash = createHash("sha256").update(bytes).digest("hex");
      const prior = hashes.get(hash);
      expect(
        prior,
        `${member.id} shares identical portrait bytes with ${prior ?? "?"}`,
      ).toBeUndefined();
      hashes.set(hash, member.id);
    }
  });

  it("does not use legacy Chamber image path markers", () => {
    for (const member of CHAMBER_MEMBERS) {
      for (const marker of LEGACY_PATH_MARKERS) {
        expect(member.cardImagePath.toLowerCase()).not.toContain(marker);
      }
    }
  });

  it("keeps Board directors out of Chamber display records", () => {
    // String ids may coincide (e.g. "finance") — registries must stay separate.
    const boardNames = new Set(
      listAllBoardMembers().map((m) => m.name.toLowerCase()),
    );
    for (const member of CHAMBER_MEMBERS) {
      expect(boardNames.has(member.displayName.toLowerCase())).toBe(false);
      expect(member.cardImagePath).not.toMatch(/board-of-directors/i);
      expect(member.displayName.toLowerCase()).not.toContain("director");
    }
  });

  it("includes required member fields", () => {
    for (const member of CHAMBER_MEMBERS) {
      expect(member.displayName.length).toBeGreaterThan(0);
      expect(member.specialty.length).toBeGreaterThan(0);
      expect(member.bio.length).toBeGreaterThan(0);
      expect(member.howTheyHelp.length).toBeGreaterThan(0);
      expect(member.activationOpener.length).toBeGreaterThan(0);
      expect(getChamberMemberById(member.id)).toEqual(member);
      expect(isChamberMemberId(member.id)).toBe(true);
    }
  });

  it("listActiveChamberMembers returns the full canonical roster", () => {
    expect(listActiveChamberMembers()).toHaveLength(24);
    expect(listActiveChamberMembers()).toEqual(CHAMBER_MEMBERS);
  });

  it("canonical asset folder includes every roster portrait file", () => {
    const files = readdirSync(CANON_ASSET_DIR).filter((f) => f.endsWith(".png"));
    const expected = new Set(
      CHAMBER_MEMBERS.map((m) => path.basename(m.cardImagePath)),
    );
    for (const file of files) {
      if (expected.has(file)) expected.delete(file);
    }
    expect([...expected]).toEqual([]);
  });

  it("activates a member with invite messages", () => {
    const result = activateChamberMember("momentum");
    expect(result?.member.displayName).toBe("Momentum Intelligence");
    expect(result?.messages.system).toContain("Momentum Intelligence");
    expect(result?.messages.assistant).toContain("Momentum Intelligence");
  });

  it("strips prior chamber join messages when switching members", () => {
    const first = activateChamberMember("momentum");
    const second = activateChamberMember("finance");
    const messages = [
      { role: "user", content: "Hello" },
      { role: "system", content: first!.messages.system },
      { role: "assistant", content: first!.messages.assistant },
    ];
    const stripped = stripChamberMemberActivationMessages(messages);
    expect(stripped).toHaveLength(2);
    expect(stripped[0]?.role).toBe("user");
    expect(second?.messages.system).toContain("Finance");
  });
});

describe("Chamber gallery roster", () => {
  it("renders every active Chamber member exactly once", () => {
    const html = renderToStaticMarkup(
      <ChamberMemberGallery onTalkWithMember={() => {}} />,
    );
    expect(html).toContain('data-member-count="24"');
    expect(html).toContain('data-member-total="24"');
    for (const member of CHAMBER_MEMBERS) {
      const occurrences = (
        html.match(new RegExp(`chamber-member-card-${member.id}`, "g")) ?? []
      ).length;
      expect(occurrences, member.id).toBe(1);
      // next/image may encode the path — assert the canonical filename is present
      expect(html).toContain(path.basename(member.cardImagePath));
    }
    expect(html).not.toContain("Need Another Perspective");
    expect(html).not.toContain("board-of-directors");
  });

  it("does not hide members when an image path is present", () => {
    const html = renderToStaticMarkup(
      <ChamberMemberGallery onTalkWithMember={() => {}} />,
    );
    expect((html.match(/chamber-member-card-/g) ?? []).length).toBe(24);
  });

  it("uses the same canonical portrait in gallery, active card, and profile", () => {
    const member = getChamberMemberById("leadership")!;
    const gallery = renderToStaticMarkup(
      <ChamberMemberGallery onTalkWithMember={() => {}} />,
    );
    const active = renderToStaticMarkup(
      <ChamberActiveMemberCard
        member={member}
        onEndConversation={() => {}}
      />,
    );
    const profile = renderToStaticMarkup(
      <ChamberMemberProfileModal
        member={member}
        open
        onClose={() => {}}
        onInvite={() => {}}
      />,
    );
    const file = path.basename(member.cardImagePath);
    expect(gallery).toContain(file);
    expect(active).toContain(file);
    expect(profile).toContain(file);
    expect(member.cardImagePath).toBe(
      "/momentum-chamber-members/leadership-chamber-member.png",
    );
  });

  it("starts with the full list and no category filter markup", () => {
    const html = renderToStaticMarkup(
      <ChamberMemberGallery onTalkWithMember={() => {}} />,
    );
    expect(html).toMatch(/Scroll to see all 24 members/i);
    expect(html).not.toMatch(/data-category-filter=/);
    expect(html).not.toMatch(/selectedCategory/);
  });
});

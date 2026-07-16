/**
 * Profile destination hardening — Welcome Home cannot stay active over profile destinations.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isProfileDestinationOverlay,
  PROFILE_DESTINATION_OVERLAY_IDS,
} from "@/lib/profile/profileDestination";
import type { EstateMenuShellActionId } from "@/lib/growth/profileEstateRooms";

function readCompanion(): string {
  return readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );
}

function readHost(): string {
  return readFileSync(
    resolve(
      process.cwd(),
      "components/companion/ProfileDestinationHost.tsx",
    ),
    "utf8",
  );
}

function readHostCss(): string {
  return readFileSync(
    resolve(process.cwd(), "app/companion/profile-destination-host.css"),
    "utf8",
  );
}

function readRooms(): string {
  return readFileSync(
    resolve(process.cwd(), "lib/growth/profileEstateRooms.ts"),
    "utf8",
  );
}

describe("profileDestinationHardening", () => {
  const companion = readCompanion();
  const host = readHost();
  const hostCss = readHostCss();
  const rooms = readRooms();

  it("opens My Business Estate from the My Spark Estate menu", () => {
    expect(companion).toContain('openProfileDestinationCore("my-business-estate")');
    expect(companion).toContain('setOverlay("my-business-estate")');
    expect(host).toContain("MyBusinessEstatePanel");
    expect(host).toContain('data-testid="profile-destination-host"');
  });

  it("opens My Profile as a distinct personal destination", () => {
    expect(companion).toContain("profileDestinationForMenuAction");
    expect(companion).toContain('setOverlay("profile-personal")');
    expect(host).toContain("MyProfilePanel");
    expect(host).toContain('canonical === "profile-personal"');
  });

  it("opens People I Help via direct destination (inside My Business Estate hierarchy)", () => {
    expect(companion).toContain('openProfileDestinationCore("people-i-help")');
    expect(companion).toContain('setOverlay("people-i-help")');
    expect(host).toContain("PeopleIHelpPanel");
    expect(host).toContain("MyBusinessEstatePanel");
  });

  it("opens Growth Profile through its intended route", () => {
    expect(companion).toContain('setOverlay("growth-profile")');
    expect(host).toContain("GrowthProfileRoomPanel");
  });

  it("keeps Welcome Home semantically inactive while any profile destination is open", () => {
    expect(companion).toContain("!profileDestinationActive");
    expect(companion).toMatch(
      /const profileDestinationActive\s*=\s*[\s\S]{0,200}?estateProfilePrimary/,
    );
    const overlayDecl = companion.indexOf("const [overlay, setOverlay]");
    const welcomeDecl = companion.indexOf("const welcomeHomePrimary");
    expect(overlayDecl).toBeGreaterThan(-1);
    expect(welcomeDecl).toBeGreaterThan(overlayDecl);
  });

  it("mounts exactly one ProfileDestinationHost and not inline estate-room-main panels", () => {
    const hostMounts = companion.match(/<ProfileDestinationHost/g) ?? [];
    expect(hostMounts).toHaveLength(1);
    expect(companion).not.toMatch(
      /estateProfilePrimary \?\s*\(\s*<main className="estate-room-main"/,
    );
    expect(companion).not.toMatch(
      /peopleIHelpProfilePrimary \?\s*\(\s*<main className="estate-room-main"/,
    );
    expect(companion).not.toMatch(
      /growthProfilePrimary \?\s*\(\s*<main className="estate-room-main"/,
    );
  });

  it("renders the profile host above Welcome Home via body portal z-index", () => {
    expect(host).toContain("createPortal");
    expect(host).toContain("document.body");
    expect(hostCss).toMatch(/z-index:\s*100002/);
    expect(hostCss).toContain("html[data-profile-destination]");
    expect(hostCss).toContain("pointer-events: none");
    // Above Welcome Home (20 / 99999 intro), below Breathe (100005) and Settings (100010)
    expect(hostCss).not.toMatch(/z-index:\s*15\b/);
  });

  it("preserves close/back through onClose={goBack}", () => {
    expect(companion).toMatch(
      /<ProfileDestinationHost[\s\S]{0,400}?onClose=\{goBack\}/,
    );
  });

  it("keeps Settings ModalSheet and BreatheDestinationHost portal behavior", () => {
    expect(companion).toContain("<BreatheDestinationHost");
    expect(companion).toContain("<ModalSheet");
    expect(companion).toContain("portaled={portaledModalSheets}");
    const modalSheet = readFileSync(
      resolve(process.cwd(), "components/companion/ModalSheet.tsx"),
      "utf8",
    );
    expect(modalSheet).toContain("z-[100010]");
    expect(modalSheet).toContain("createPortal");
  });

  it("excludes people-i-help from EstateMenuShellActionId so it cannot fall through the shell switch", () => {
    expect(rooms).toMatch(
      /EstateMenuShellActionId = Exclude<[\s\S]*?"people-i-help"/,
    );
    expect(companion).toContain("profileDestinationForMenuAction(actionId)");
    expect(companion).toContain('openProfileDestinationCore(sparkEstateDestination)');
    expect(companion).toContain('openProfileDestinationCore("people-i-help")');
    // Type-level: people-i-help must not be a shell action id
    type PeopleIHelpIsNever = "people-i-help" extends EstateMenuShellActionId
      ? true
      : false;
    const peopleIHelpFallsThrough: PeopleIHelpIsNever = false;
    expect(peopleIHelpFallsThrough).toBe(false);
  });


  it("recognizes My Spark Estate overlay ids including My Profile", () => {
    expect(PROFILE_DESTINATION_OVERLAY_IDS).toEqual([
      "my-business-estate",
      "people-i-help",
      "profile-personal",
      "growth-profile",
      "profile",
    ]);
    expect(isProfileDestinationOverlay("my-business-estate")).toBe(true);
    expect(isProfileDestinationOverlay("people-i-help")).toBe(true);
    expect(isProfileDestinationOverlay("profile-personal")).toBe(true);
    expect(isProfileDestinationOverlay("growth-profile")).toBe(true);
    expect(isProfileDestinationOverlay("profile")).toBe(true);
    expect(isProfileDestinationOverlay("settings")).toBe(false);
    expect(isProfileDestinationOverlay(null)).toBe(false);
  });
});

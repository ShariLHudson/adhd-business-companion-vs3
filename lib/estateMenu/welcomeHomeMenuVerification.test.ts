/**
 * Welcome Home menu verification — desktop + mobile acceptance.
 * Confirms visible items, hidden broken items, and action wiring contracts.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isProfileEstateMenuAction,
  profileEstateRoomForMenuAction,
} from "@/lib/growth/profileEstateRooms";
import {
  ESTATE_MENU_DROPDOWN_ENTRIES,
  ESTATE_MENU_DROPDOWN_ITEMS,
  type EstateMenuActionId,
} from "./menuConfig";
import {
  SPARK_ESTATE_PROFILE_MENU_CONVERSATION_ITEMS,
  SPARK_ESTATE_PROFILE_MENU_ITEMS,
  verifySparkEstateTopNavigationAndProfileMenu,
} from "@/lib/estate/sparkEstateTopNavigationAndProfileMenu";

const VISIBLE_TOP_LABELS = [
  "Conversations",
  "Settings",
  "Profile",
  "Logout",
] as const;

const VISIBLE_ACTION_IDS: EstateMenuActionId[] = [
  "start-new-conversation",
  "start-new-day-conversation",
  "settings",
  "my-profile",
  "log-out",
];

const HIDDEN_LABELS = ["Personalization", "Account", "Evidence Vault", "Hall of Accomplishments"] as const;
const HIDDEN_ACTION_IDS: EstateMenuActionId[] = [
  "growth-profile",
  "estate-profile",
  "evidence-vault",
  "portfolio",
];

function readCompanionHandlerSource(): string {
  return readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );
}

function readMenuCss(): string {
  return readFileSync(
    resolve(process.cwd(), "app/companion/global-estate-menu.css"),
    "utf8",
  );
}

function readLayoutCss(): string {
  return readFileSync(
    resolve(process.cwd(), "app/companion/companion-layout-layers.css"),
    "utf8",
  );
}

describe("Welcome Home menu — visibility", () => {
  it("shows only Conversations, Settings, Profile, Logout", () => {
    expect(ESTATE_MENU_DROPDOWN_ENTRIES.map((e) => e.label)).toEqual([
      ...VISIBLE_TOP_LABELS,
    ]);
    expect(SPARK_ESTATE_PROFILE_MENU_ITEMS.map((i) => i.label)).toEqual([
      ...VISIBLE_TOP_LABELS,
    ]);
  });

  it("nests New Chat and New Day Chat under Conversations", () => {
    const group = ESTATE_MENU_DROPDOWN_ENTRIES.find(
      (e) => e.kind === "group" && e.id === "conversations",
    );
    expect(group?.kind).toBe("group");
    if (group?.kind !== "group") return;
    expect(group.children.map((c) => c.label)).toEqual([
      "New Chat",
      "New Day Chat",
    ]);
    expect(SPARK_ESTATE_PROFILE_MENU_CONVERSATION_ITEMS.map((i) => i.label)).toEqual(
      ["New Chat", "New Day Chat"],
    );
  });

  it("hides Personalization and Account from the visible menu", () => {
    const labels = ESTATE_MENU_DROPDOWN_ENTRIES.map((e) => e.label);
    for (const label of HIDDEN_LABELS) {
      expect(labels).not.toContain(label);
    }
    const ids = ESTATE_MENU_DROPDOWN_ITEMS.map((i) => i.id);
    for (const id of HIDDEN_ACTION_IDS) {
      expect(ids).not.toContain(id);
    }
  });

  it("exposes exactly the five working clickable actions", () => {
    expect(ESTATE_MENU_DROPDOWN_ITEMS.map((i) => i.id)).toEqual(
      VISIBLE_ACTION_IDS,
    );
  });
});

describe("Welcome Home menu — action wiring", () => {
  const source = readCompanionHandlerSource();

  it("New Chat routes to requestClearTodayContext", () => {
    expect(source).toMatch(
      /case\s+"start-new-conversation"\s*:\s*[\s\S]*?requestClearTodayContext\(\)/,
    );
    expect(source).toMatch(
      /function requestClearTodayContext\(\)\s*\{[\s\S]*?clearTodayContext\(\{\s*preserveRoom\s*\}\)/,
    );
    expect(source).toMatch(
      /function requestClearTodayContext\(\)\s*\{[\s\S]*?NEW_CONVERSATION_GREETING/,
    );
    // No explanation dialog for Conversations → New Chat
    expect(source).not.toMatch(
      /function requestClearTodayContext\(\)\s*\{\s*setFreshStartDialog\("clear-context"\)/,
    );
  });

  it("New Day Chat routes to requestBeginNewDay", () => {
    expect(source).toMatch(
      /case\s+"start-new-day-conversation"\s*:\s*[\s\S]*?requestBeginNewDay\(\)/,
    );
    expect(source).toMatch(
      /function requestBeginNewDay\(\)\s*\{[\s\S]*?beginNewDay\(preserveRoom\)/,
    );
    // No explanation dialog for Conversations → New Day Chat
    expect(source).not.toMatch(
      /function requestBeginNewDay\(\)\s*\{\s*setFreshStartDialog\("begin-new-day"\)/,
    );
  });

  it("Settings opens the settings overlay", () => {
    expect(source).toMatch(
      /case\s+"settings"\s*:\s*[\s\S]*?setOverlay\("settings"\)/,
    );
  });

  it("Profile opens my-estate / profile overlay path", () => {
    expect(isProfileEstateMenuAction("my-profile")).toBe(true);
    expect(profileEstateRoomForMenuAction("my-profile")).toBe("my-estate");
    expect(source).toMatch(/openProfileEstateRoomFromMenu/);
    expect(source).toMatch(
      /if \(roomId === "my-estate"\)[\s\S]*?setOverlay\("profile"\)/,
    );
  });

  it("Logout signs out and routes to login", () => {
    expect(source).toMatch(/case\s+"log-out"\s*:[\s\S]*?handleEstateLogOut\(\)/);
    expect(source).toMatch(
      /const handleEstateLogOut = useCallback\(async \(\) => \{[\s\S]*?signOut\(\)[\s\S]*?router\.push\("\/companion\/login\?signedOut=1"\)/,
    );
  });
});

describe("Welcome Home menu — desktop + mobile layout", () => {
  it("keeps top-nav profile menu aligned", () => {
    const verification = verifySparkEstateTopNavigationAndProfileMenu();
    expect(verification.profileMenuAligned).toBe(true);
    expect(verification.controlCount).toBe(2);
  });

  it("uses safe-area + viewport-bounded panel for floating menu (desktop & mobile)", () => {
    const menuCss = readMenuCss();
    const layoutCss = readLayoutCss();

    expect(menuCss).toMatch(/env\(safe-area-inset-top/);
    expect(menuCss).toMatch(/env\(safe-area-inset-right/);
    expect(menuCss).toMatch(/calc\(100vw - 1\.5rem\)|calc\(100vw - 1\.25rem\)/);
    expect(menuCss).toMatch(/100dvh/);

    expect(layoutCss).toMatch(
      /\[data-companion-menu-layer="true"\]\[data-estate-menu-variant="floating"\]/,
    );
    expect(layoutCss).toMatch(/env\(safe-area-inset-top/);
    expect(layoutCss).toMatch(/max-width:\s*900px/);
  });

  it("provides mobile touch targets for trigger and items", () => {
    const menuCss = readMenuCss();
    expect(menuCss).toMatch(/\.global-estate-menu__trigger[\s\S]*?min-height:\s*2\.75rem/);
    expect(menuCss).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?min-height:\s*2\.75rem/);
    expect(menuCss).toMatch(
      /@media \(max-width:\s*900px\)[\s\S]*?\.global-estate-menu__item--nested/,
    );
  });

  it("renders Conversations as a non-clickable group with nested actions", () => {
    const component = readFileSync(
      resolve(process.cwd(), "components/companion/GlobalEstateMenu.tsx"),
      "utf8",
    );
    expect(component).toMatch(/data-estate-menu-group=\{entry\.id\}/);
    expect(component).toMatch(/global-estate-menu__item--nested/);
    expect(component).toMatch(/role="presentation"/);
    expect(component).not.toMatch(/growth-profile/);
    expect(component).not.toMatch(/estate-profile/);
    expect(component).not.toMatch(/Personalization/);
    expect(component).not.toMatch(/>Account</);
  });
});

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
  "My Spark Estate",
  "Experience Controls",
  "Settings",
  "Sign Out",
] as const;

const VISIBLE_ACTION_IDS: EstateMenuActionId[] = [
  "start-new-conversation",
  "start-new-day-conversation",
  "my-business-estate",
  "people-i-help",
  "my-profile",
  "experience-controls",
  "settings",
  "log-out",
];

const HIDDEN_LABELS = ["Personalization", "Account", "Evidence Vault", "Hall of Accomplishments"] as const;
const HIDDEN_ACTION_IDS: EstateMenuActionId[] = [
  "growth-profile",
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

function readRoomMenuSource(): string {
  return readFileSync(
    resolve(process.cwd(), "components/companion/estate/EstateRoomExperienceMenu.tsx"),
    "utf8",
  );
}

describe("Welcome Home menu — visibility", () => {
  it("shows Conversations, My Spark Estate, Experience Controls, Settings, Sign Out", () => {
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

  it("exposes only working clickable actions (no welcome replay)", () => {
    expect(ESTATE_MENU_DROPDOWN_ITEMS.map((i) => i.id)).toEqual(
      VISIBLE_ACTION_IDS,
    );
    expect(ESTATE_MENU_DROPDOWN_ITEMS.map((i) => i.id)).not.toContain(
      "replay-welcome",
    );
  });
});

describe("Welcome Home menu — action wiring", () => {
  const source = readCompanionHandlerSource();
  const roomMenuSource = readRoomMenuSource();

  it("New Chat routes to requestClearTodayContext", () => {
    expect(source).toMatch(
      /case\s+"start-new-conversation"\s*:\s*[\s\S]*?requestClearTodayContext\(\)/,
    );
    expect(source).toMatch(
      /function requestClearTodayContext\(\)\s*\{[\s\S]*?clearTodayContext\(\{\s*preserveRoom,\s*mode:\s*"new-chat"\s*\}\)/,
    );
    expect(source).toMatch(
      /function requestClearTodayContext\(\)\s*\{[\s\S]*?setMessages\(\[\]\)/,
    );
    expect(source).toMatch(/resetActiveConversation\(/);
    expect(source).not.toMatch(
      /function requestClearTodayContext\(\)\s*\{\s*setFreshStartDialog\("clear-context"\)/,
    );
  });

  it("New Day Chat routes to requestBeginNewDay", () => {
    expect(source).toMatch(
      /case\s+"start-new-day-conversation"\s*:\s*[\s\S]*?requestBeginNewDay\(\)/,
    );
    expect(source).toMatch(
      /function requestBeginNewDay\([\s\S]*?beginNewDay\(entryPoint\)/,
    );
    expect(source).toMatch(/runSharedNewDay\(/);
    expect(source).toMatch(
      /function beginNewDay\([\s\S]*?entryPoint[\s\S]*?runSharedNewDay/,
    );
    expect(source).not.toMatch(
      /function requestBeginNewDay\(\)\s*\{\s*setFreshStartDialog\("begin-new-day"\)/,
    );
  });

  it("Settings New Day uses the shared daily-opening controller", () => {
    expect(source).toMatch(
      /onBeginNewDay=\{requestBeginNewDayFromSettings\}/,
    );
    expect(source).toMatch(
      /function requestBeginNewDayFromSettings\(\)\s*\{[\s\S]*?requestBeginNewDay\("settings-new-day"\)/,
    );
  });

  it("Settings opens the settings overlay", () => {
    expect(source).toMatch(
      /case\s+"settings"\s*:\s*[\s\S]*?setOverlay\("settings"\)/,
    );
  });

  it("does not replay welcome audio after first login", () => {
    expect(source).toMatch(/actionId === "replay-welcome"/);
    expect(source).toMatch(
      /Welcome audio is first-login only — never replay after that/,
    );
    expect(source).not.toMatch(
      /actionId === "replay-welcome"[\s\S]*?requestWelcomeHomeReplay\(\)/,
    );
  });

  it("My Business Estate opens via profile destination resolver", () => {
    expect(source).toMatch(/openProfileDestinationCore\("my-business-estate"\)/);
    expect(source).toMatch(/profileDestinationForMenuAction/);
    expect(source).toMatch(/<ProfileDestinationHost/);
    expect(source).toMatch(/setOverlay\("my-business-estate"\)/);
  });

  it("My Profile opens personal profile destination", () => {
    expect(source).toMatch(/setOverlay\("profile-personal"\)/);
    expect(source).toMatch(/profileDestinationForMenuAction/);
    expect(source).toMatch(/profile-personal-overlay/);
  });

  it("People I Help opens via profile destination resolver", () => {
    expect(source).toMatch(/openProfileDestinationCore\("people-i-help"\)/);
    expect(source).toMatch(/<ProfileDestinationHost/);
    expect(source).toMatch(/setOverlay\("people-i-help"\)/);
  });

  it("Experience Controls uses GlobalOverlayHost", () => {
    expect(source).toMatch(/<GlobalOverlayHost>/);
    expect(source).toMatch(/ExperienceControlsOverlay/);
  });

  it("Welcome Home opens Peaceful Places and Soundscapes as destinations", () => {
    expect(roomMenuSource).toMatch(/estate-open-\$\{id\}/);
    expect(roomMenuSource).toMatch(/"peaceful-places":\s*onOpenPeacefulPlaces/);
    expect(roomMenuSource).toMatch(/soundscapes:\s*onOpenSoundscapes/);
    expect(roomMenuSource).toMatch(/onOpenPeacefulPlaces/);
    expect(roomMenuSource).toMatch(/onOpenSoundscapes/);
    expect(roomMenuSource).not.toMatch(/peacefulPlacesExpanded/);
    expect(roomMenuSource).not.toMatch(/data-testid="estate-room-chat-toggle"/);
    expect(source).toMatch(/ExperienceControlsOverlay/);
    expect(source).toMatch(/SoundscapeSelectionOverlay/);
    expect(source).toMatch(/playExperienceSoundscapeTrack\(track\)/);
  });

  it("Experience Controls open from SH without navigating away", () => {
    expect(source).toMatch(/actionId === "experience-controls"/);
    expect(source).toMatch(/setExperienceControlsOpen\(true\)/);
    expect(source).toMatch(/<ExperienceControlsOverlay/);
    const experienceControlsHandler = source.match(
      /if \(actionId === "experience-controls"\) \{[\s\S]*?\n    \}/,
    )?.[0];
    expect(experienceControlsHandler).toBeTruthy();
    expect(experienceControlsHandler).toContain("setExperienceControlsOpen(true)");
    expect(experienceControlsHandler).not.toContain("setOverlay(");
  });

  it("Logout signs out and routes to login", () => {
    expect(source).toMatch(/case\s+"log-out"\s*:[\s\S]*?handleEstateLogOut\(\)/);
    expect(source).toMatch(
      /const handleEstateLogOut = useCallback\(async \(\) => \{[\s\S]*?signOut\(\)[\s\S]*?router\.push\("\/companion\/login\?signedOut=1"\)/,
    );
  });

  it("Back To Estate always opens Welcome Home lobby", () => {
    expect(source).toContain("onBackToEstate={navigateBackToEstateHome}");
    expect(source).toContain(
      'returnToWelcomeHomeLobby("back to estate")',
    );
    expect(source).toContain('setCurrentRoom("welcome-home")');
    expect(source).toContain("estateSectionNavEpochRef.current += 1");
    expect(source).toContain("skipSectionRestore: true");
    expect(source).toContain('clearRoomBackdropOverride("welcome-home")');
    expect(source).toContain("const welcomeHomePlate = WELCOME_ROOM_ASSET");
    expect(source).toContain("force: true");
    expect(source).toContain(
      "if (isEstateHomeDestination(workspacePanelBackLabel))",
    );
    expect(source).toMatch(
      /const handleCompanionBack = \(\) => \{\s*\/\/[^\n]*\s*navigateBackToEstateHome\(\);\s*\}/,
    );
    expect(roomMenuSource).toMatch(/Wander the Grounds/);
    expect(roomMenuSource).toMatch(/data-testid="estate-open-wander-the-grounds"/);

    // Must not fall back to member overrides, login art, or history restore.
    const lobbyFn = source.match(
      /function returnToWelcomeHomeLobby\(reason: string\) \{[\s\S]*?\n  \}/,
    )?.[0];
    expect(lobbyFn).toBeTruthy();
    expect(lobbyFn).toContain("const welcomeHomePlate = WELCOME_ROOM_ASSET");
    expect(lobbyFn).not.toMatch(
      /resolveEstateRoomBackgroundImage\(\s*["']welcome-home["']/,
    );
    expect(lobbyFn).not.toMatch(/welcome-to-spark-estate-background/i);
    expect(lobbyFn).not.toMatch(/router\.push\(["']\/companion\/login/);
    expect(lobbyFn).not.toContain("navHistoryRef.current.pop()");
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
      /@media \(max-width:\s*900px\)[\s\S]*?\.global-estate-menu__action-row/,
    );
  });

  it("renders Conversations and My Spark Estate as collapsible groups with nested actions", () => {
    const component = readFileSync(
      resolve(process.cwd(), "components/companion/GlobalEstateMenu.tsx"),
      "utf8",
    );
    expect(component).toMatch(/EstateDropdownMenuSection/);
    expect(component).toMatch(/EstateDropdownMenuCategoryRow/);
    expect(component).toMatch(/EstateDropdownMenuActionRow/);
    expect(component).toMatch(/closeAndRun\(child\.id\)/);
    expect(component).toMatch(/onActionRef\.current\(actionId\)/);
    expect(component).toMatch(/toggleGroup\(entry\.id\)/);
    expect(component).toMatch(/showChevron/);
    expect(component).toMatch(/estate-room-experience-menu__panel/);
    expect(component).toMatch(/experience-controls/);
    expect(component).not.toMatch(/growth-profile/);
    expect(component).not.toMatch(/Personalization/);
    expect(component).not.toMatch(/>Account</);
  });
});

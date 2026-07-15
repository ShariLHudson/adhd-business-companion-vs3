/**
 * Return to Estate → Welcome Home routing contract.
 * Source + asset checks (CompanionPageClient is too large to mount in unit tests).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMPANION_LOGIN_BACKGROUND_PATH } from "@/lib/companionLoginPage";
import {
  WELCOME_HOME_BACKGROUND,
  WELCOME_ROOM_ASSET,
} from "@/lib/welcomeRoom/types";

const CPC = path.join(
  process.cwd(),
  "app/companion/CompanionPageClient.tsx",
);
const ROOM_MENU = path.join(
  process.cwd(),
  "components/companion/estate/EstateRoomExperienceMenu.tsx",
);

function lobbyHandlerSource(): string {
  const source = readFileSync(CPC, "utf8");
  const match = source.match(
    /function returnToWelcomeHomeLobby\(reason: string\) \{[\s\S]*?\n  \}/,
  );
  if (!match) {
    throw new Error("returnToWelcomeHomeLobby not found");
  }
  return match[0];
}

describe("Return to Estate → Welcome Home", () => {
  it("Experience Controls wire Return to Estate to navigateBackToEstateHome", () => {
    const menu = readFileSync(ROOM_MENU, "utf8");
    const page = readFileSync(CPC, "utf8");

    expect(menu).toContain('data-testid="estate-return-to-estate"');
    expect(menu).toContain("closeAndRun(onBackToEstate)");
    expect(page).toContain("onBackToEstate={navigateBackToEstateHome}");
    expect(page).toMatch(
      /function navigateBackToEstateHome\(\)\s*\{\s*returnToWelcomeHomeLobby\("back to estate"\);\s*\}/,
    );
  });

  it("lands on Welcome Home with the welcome-home-background.png plate", () => {
    const lobby = lobbyHandlerSource();

    expect(lobby).toContain('setCurrentRoom("welcome-home")');
    expect(lobby).toContain('setActiveSection("home")');
    expect(lobby).toContain('onEstatePlaceArrived({ placeId: "welcome-home"');
    expect(lobby).toContain('clearRoomBackdropOverride("welcome-home")');
    expect(lobby).toContain("const welcomeHomePlate = WELCOME_ROOM_ASSET");
    expect(lobby).toContain("force: true");
    expect(lobby).toContain('toRoomId: "welcome-home"');

    expect(WELCOME_ROOM_ASSET).toBe(WELCOME_HOME_BACKGROUND);
    expect(WELCOME_ROOM_ASSET).toContain(
      "/backgrounds/welcome-home-background.png",
    );
    expect(WELCOME_ROOM_ASSET).toMatch(
      /\/backgrounds\/welcome-home-background\.png\?v=/,
    );
    expect(
      existsSync(
        path.join(
          process.cwd(),
          "public/backgrounds/welcome-home-background.png",
        ),
      ),
    ).toBe(true);
  });

  it("does not send the member to login, prior rooms, or last experience", () => {
    const lobby = lobbyHandlerSource();
    const page = readFileSync(CPC, "utf8");

    expect(lobby).not.toMatch(/router\.push\(["']\/companion\/login/);
    expect(lobby).not.toContain(COMPANION_LOGIN_BACKGROUND_PATH);
    expect(lobby).not.toMatch(/welcome-to-spark-estate-background/i);
    expect(lobby).not.toMatch(
      /resolveEstateRoomBackgroundImage\(\s*["']welcome-home["']/,
    );
    expect(lobby).not.toContain("navHistoryRef.current.pop()");
    expect(lobby).toContain("skipSectionRestore: true");
    expect(lobby).toContain("navHistoryRef.current = createNavigationHistoryStack()");
    expect(lobby).toContain("sectionHistoryRef.current = []");

    // Back To Estate label must not restore history — it routes home.
    expect(page).toContain(
      "if (isEstateHomeDestination(workspacePanelBackLabel))",
    );
    expect(page).toMatch(
      /if \(isEstateHomeDestination\(workspacePanelBackLabel\)\) \{\s*navigateBackToEstateHome\(\);/,
    );
  });
});

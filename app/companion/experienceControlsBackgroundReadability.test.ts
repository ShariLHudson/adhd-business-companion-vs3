import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Experience Controls — background readability modes", () => {
  const css = readFileSync(
    resolve(process.cwd(), "app/companion/experience-controls-overlay.css"),
    "utf8",
  );
  const companionBackground = readFileSync(
    resolve(process.cwd(), "components/companion/CompanionBackground.tsx"),
    "utf8",
  );
  const homesteadChatScene = readFileSync(
    resolve(process.cwd(), "components/companion/HomesteadChatScene.tsx"),
    "utf8",
  );
  const estateRoomFullBleedBackground = readFileSync(
    resolve(
      process.cwd(),
      "components/companion/estate/EstateRoomFullBleedBackground.tsx",
    ),
    "utf8",
  );
  const welcomeHomeFirstLaunch = readFileSync(
    resolve(process.cwd(), "components/companion/WelcomeHomeFirstLaunch.tsx"),
    "utf8",
  );
  const welcomeRoomPanel = readFileSync(
    resolve(process.cwd(), "components/companion/WelcomeRoomPanel.tsx"),
    "utf8",
  );
  const estateSceneTransitionHost = readFileSync(
    resolve(
      process.cwd(),
      "components/companion/estate/EstateSceneTransitionHost.tsx",
    ),
    "utf8",
  );

  it("no longer targets the dead selectors from the original audit", () => {
    expect(css).not.toContain(".companion-root::before");
    expect(css).not.toContain(".estate-scene-layer");
  });

  it("Show has no matching rule — it is a no-op by construction", () => {
    expect(css).not.toMatch(/data-estate-background-mode=["']show["']/);
  });

  it("Soften and Focus both target the shared .spark-readability-scene class", () => {
    expect(css).toMatch(
      /html\[data-estate-background-mode=["']soften["']\]\s+\.spark-readability-scene\s*\{[\s\S]*?filter:/,
    );
    expect(css).toMatch(
      /html\[data-estate-background-mode=["']focus["']\]\s+\.spark-readability-scene\s*\{[\s\S]*?filter:/,
    );
  });

  it("Clear My Mind's sharp photo is explicitly protected from both modes", () => {
    expect(css).toMatch(
      /html\[data-estate-background-mode=["']soften["']\]\s+\.companion-background-clear-my-mind\s+\.spark-readability-scene,\s*\n?\s*html\[data-estate-background-mode=["']focus["']\]\s+\.companion-background-clear-my-mind\s+\.spark-readability-scene\s*\{[\s\S]*?filter:\s*none/,
    );
  });

  it("existing text-size and reduce-motion rules are unchanged", () => {
    expect(css).toMatch(
      /html\[data-estate-text-size=["']large["']\]\s+\.companion-root\s*\{\s*font-size:\s*112\.5%/,
    );
    expect(css).toMatch(
      /html\[data-estate-text-size=["']extra-large["']\]\s+\.companion-root\s*\{\s*font-size:\s*125%/,
    );
    expect(css).toMatch(
      /html\[data-estate-reduce-motion=["']true["']\]\s*\*/,
    );
  });

  it("CompanionBackground's scene photo carries the readability class", () => {
    expect(companionBackground).toMatch(
      /companion-bg-scene spark-readability-scene/,
    );
  });

  it("HomesteadChatScene's living-room plate carries the readability class", () => {
    expect(homesteadChatScene).toMatch(
      /mediaClassName="[^"]*spark-readability-scene/,
    );
  });

  it("EstateRoomFullBleedBackground's plate class covers every render branch (video, crossfade, fallback)", () => {
    const plateClassMatches = estateRoomFullBleedBackground.match(
      /"spark-readability-scene"/g,
    );
    // One in the shared plateClassName array (video + crossfade branches share
    // it), one in the no-src fallback branch's own separate array.
    expect(plateClassMatches?.length).toBe(2);
  });

  it("the first-launch Welcome Home hero photo carries the readability class", () => {
    expect(welcomeHomeFirstLaunch).toMatch(
      /className="welcome-room__photo welcome-home-page__photo spark-readability-scene"/,
    );
  });

  it("the returning-member Welcome Room panel photo carries the readability class", () => {
    expect(welcomeRoomPanel).toMatch(
      /className="welcome-room__photo spark-readability-scene"/,
    );
  });

  it("the persistent estate scene transition host covers every plate variant (outgoing, hold, active, incoming, preparing)", () => {
    const matches = estateSceneTransitionHost.match(
      /"estate-scene-transition-host__plate spark-readability-scene estate-scene-transition-host__plate--/g,
    );
    expect(matches?.length).toBe(5);
  });
});

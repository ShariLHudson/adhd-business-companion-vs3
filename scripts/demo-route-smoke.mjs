/**
 * Manual demo route smoke test — run while dev server is on :3000
 * node scripts/demo-route-smoke.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.COMPANION_URL ?? "http://localhost:3000/companion";

async function openRoomMenu(page) {
  const triggers = [
    'button[aria-label*="room menu"]',
    '[data-testid="estate-room-menu-trigger"]',
    'button[aria-label*="Current Room"]',
    'button[aria-label*="Room menu"]',
    'button[aria-label="Open estate room menu"]',
  ];
  for (const sel of triggers) {
    const el = page.locator(sel).first();
    if ((await el.count()) > 0) {
      await el.click({ timeout: 5000 });
      await page.waitForTimeout(400);
      return;
    }
  }
  throw new Error("Could not find estate room menu trigger");
}

async function clickNavItem(page, labelPart) {
  const toggle = page.locator(
    '[data-testid="estate-room-menu-section-estate-navigation"]',
  );
  if ((await toggle.count()) > 0) {
    if ((await toggle.getAttribute("aria-expanded")) !== "true") {
      await toggle.click();
      await page.waitForTimeout(300);
    }
  }
  await page
    .locator("button")
    .filter({ hasText: new RegExp(labelPart, "i") })
    .first()
    .click({ timeout: 10000 });
  await page.waitForTimeout(2500);
}

async function returnToWelcomeHome(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(2500);
  await page
    .locator(".companion-welcome-home-root")
    .waitFor({ state: "visible", timeout: 30000 })
    .catch(() => {});
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`✓ ${name}`);
    } catch (e) {
      results.push({ name, ok: false, err: String(e?.message ?? e) });
      console.log(`✗ ${name}: ${e?.message ?? e}`);
    }
  }

  await returnToWelcomeHome(page);

  await test("Welcome Home", async () => {
    await page
      .locator(".companion-welcome-home-root")
      .waitFor({ state: "visible", timeout: 20000 });
  });

  await test("Cartographer's Studio — room + center map", async () => {
    await openRoomMenu(page);
    await clickNavItem(page, "Cartographer");
    await page.waitForSelector('[data-testid="cartographers-studio-room"]', {
      timeout: 20000,
    });
    const bgSize = await page
      .locator(".cartographers-immersive__plate")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundSize);
    if (!bgSize.includes("contain")) {
      throw new Error(`background-size is ${bgSize}, expected contain`);
    }
    await page.click('[data-testid="cartographers-center-map"]');
    await page.waitForSelector(".cartographers-discovery-layer", {
      timeout: 12000,
    });
  });

  await returnToWelcomeHome(page);

  await test("Chamber of Momentum — member gallery", async () => {
    await openRoomMenu(page);
    await clickNavItem(page, "Chamber");
    await page.waitForSelector('[data-testid="chamber-of-momentum-room"]', {
      timeout: 20000,
    });
    const count = await page
      .locator('[data-testid^="chamber-member-card-"]')
      .count();
    if (count < 3) {
      throw new Error(`Expected member gallery cards, found ${count}`);
    }
  });

  await returnToWelcomeHome(page);

  await test("Evidence Vault — door entrance", async () => {
    await openRoomMenu(page);
    await clickNavItem(page, "Evidence Vault");
    await page.waitForSelector('[data-testid="evidence-vault-entrance"]', {
      timeout: 20000,
    });
    const chatPanel = page.locator(".evidence-vault-room__chat-panel");
    if ((await chatPanel.count()) > 0 && (await chatPanel.isVisible())) {
      throw new Error("Chat panel visible on vault entry (expected OFF)");
    }
  });

  await returnToWelcomeHome(page);

  await test("Journal Gazebo — not Sunroom", async () => {
    await openRoomMenu(page);
    await clickNavItem(page, "Journal Gazebo");
    await page.waitForSelector(".journal-gazebo", { timeout: 20000 });
    await page
      .locator(".journal-gazebo--scene-ready, .journal-gazebo--welcome-letter")
      .first()
      .waitFor({ state: "attached", timeout: 15000 })
      .catch(() => {});
    if ((await page.locator(".companion-welcome-room-active").count()) > 0) {
      throw new Error("Opened Sunroom/Welcome Room instead of Journal Gazebo");
    }
    const journalUi = page.locator(
      ".jg-sanctuary-desk, .jg-welcome-desk, .journal-gazebo__table-actions, .jg-table-actions, .jg-welcome-letter, .journal-gazebo--welcome-letter, [data-testid='journal-gazebo-sanctuary'], button:has-text('Create'), button:has-text('Journal')",
    );
    if ((await journalUi.count()) === 0) {
      throw new Error("Journal Gazebo UI not found");
    }
    const chatOn = await page.evaluate(() =>
      document.documentElement.getAttribute("data-estate-room-chat-visible"),
    );
    if (chatOn === "true") {
      throw new Error("Chat visible on Journal Gazebo entry (expected OFF)");
    }
  });

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log("\n--- Summary ---");
  console.log(JSON.stringify(results, null, 2));
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

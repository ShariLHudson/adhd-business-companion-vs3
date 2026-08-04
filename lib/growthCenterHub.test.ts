import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  closeAllGrowthHubSections,
  loadGrowthHubOpenPrimary,
  loadGrowthHubOpenVaultSection,
  openGrowthVaultHubSection,
  saveGrowthHubOpenPrimary,
  toggleGrowthHubPrimary,
  toggleGrowthVaultSection,
} from "./growthCenterHub";

describe("growthCenterHub P0.40", () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
    });
    closeAllGrowthHubSections();
  });

  it("opens Growth Vault primary section", () => {
    const next = toggleGrowthHubPrimary(null, "growth-vault");
    expect(next).toBe("growth-vault");
    expect(loadGrowthHubOpenPrimary()).toBe("growth-vault");
  });

  it("opening Growth Vault closes Outcome Goals", () => {
    saveGrowthHubOpenPrimary("outcome-goals");
    const next = toggleGrowthHubPrimary("outcome-goals", "growth-vault");
    expect(next).toBe("growth-vault");
  });

  it("opens My Wins inside Growth Vault", () => {
    openGrowthVaultHubSection("wins-this-week");
    expect(loadGrowthHubOpenPrimary()).toBe("growth-vault");
    expect(loadGrowthHubOpenVaultSection()).toBe("wins-this-week");
  });

  it("toggling open vault section closes it", () => {
    const next = toggleGrowthVaultSection("portfolio", "portfolio");
    expect(next).toBeNull();
  });
});

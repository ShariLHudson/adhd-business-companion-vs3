#!/usr/bin/env node
/**
 * Install git pre-commit hook for companion behavior audit (P0.12).
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GIT_DIR = join(ROOT, ".git");
const HOOKS_DIR = join(GIT_DIR, "hooks");
const HOOK_PATH = join(HOOKS_DIR, "pre-commit");

const HOOK_BODY = `#!/bin/sh
# P0.12 — Companion behavior audit guardrail (auto-installed)
cd "$(git rev-parse --show-toplevel)" || exit 0
node scripts/companion-audit-guardrail.mjs pre-commit
`;

function main() {
  if (process.env.CI === "true" || process.env.CI === "1") {
    return;
  }
  if (!existsSync(GIT_DIR)) {
    console.error("Not a git repository — skipping hook install.");
    process.exit(0);
  }
  mkdirSync(HOOKS_DIR, { recursive: true });

  if (existsSync(HOOK_PATH)) {
    const existing = readFileSync(HOOK_PATH, "utf8");
    if (existing.includes("companion-audit-guardrail.mjs")) {
      console.log("Companion audit pre-commit hook already installed.");
      return;
    }
    const merged = `${existing.trimEnd()}\n\n${HOOK_BODY}`;
    writeFileSync(HOOK_PATH, merged, "utf8");
    console.log("Appended companion audit check to existing pre-commit hook.");
  } else {
    writeFileSync(HOOK_PATH, HOOK_BODY, "utf8");
    console.log("Installed companion audit pre-commit hook.");
  }

  try {
    chmodSync(HOOK_PATH, 0o755);
  } catch {
    /* Windows may ignore chmod */
  }
}

main();

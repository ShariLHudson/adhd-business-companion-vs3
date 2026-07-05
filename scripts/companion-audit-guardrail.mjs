#!/usr/bin/env node
/**
 * P0.12 — Companion audit guardrail (post-build warn, pre-commit enforce, record).
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const STATE_FILE = join(ROOT, ".companion-audit-state.json");
const MARKERS = JSON.parse(
  readFileSync(
    join(ROOT, "lib", "companion-audit-guardrail-markers.json"),
    "utf8",
  ),
);

const WARNING = [
  "⚠️ Companion behavior changed.",
  "Run:",
  "npm run audit:companion",
  "before commit.",
].join("\n");

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function isCompanionBehaviorPath(filePath) {
  const norm = normalizePath(filePath);
  if (!norm || norm.includes("node_modules/")) return false;
  return MARKERS.some((marker) => norm.includes(marker));
}

function filterCompanionPaths(paths) {
  return [...new Set(paths.filter(isCompanionBehaviorPath))].sort();
}

function gitLines(command) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function listTrackedCompanionFiles() {
  return filterCompanionPaths(gitLines("git ls-files"));
}

function computeFingerprint() {
  const hash = createHash("sha256");
  for (const file of listTrackedCompanionFiles()) {
    const result = spawnSync(`git hash-object "${file.replace(/"/g, '\\"')}"`, {
      cwd: ROOT,
      shell: true,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const blob = result.status === 0 ? result.stdout.trim() : "missing";
    hash.update(`${file}:${blob}\n`);
  }
  return hash.digest("hex");
}

function readState() {
  if (!existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function getCurrentGitCommit() {
  const result = spawnSync("git rev-parse HEAD", {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

function getChangedCompanionPaths() {
  const unstaged = gitLines("git diff --name-only HEAD");
  const staged = gitLines("git diff --cached --name-only");
  const untracked = gitLines("git ls-files --others --exclude-standard");
  return filterCompanionPaths([...unstaged, ...staged, ...untracked]);
}

function getStagedCompanionPaths() {
  return filterCompanionPaths(gitLines("git diff --cached --name-only"));
}

function shouldRemind() {
  const state = readState();
  const fingerprint = computeFingerprint();
  const changedPaths = getChangedCompanionPaths();
  const reasons = [];

  if (changedPaths.length > 0) {
    reasons.push(`${changedPaths.length} uncommitted companion behavior file(s)`);
  }
  if (!state) {
    reasons.push("companion audit has not been recorded yet");
  } else if (state.companionFingerprint !== fingerprint) {
    reasons.push("companion behavior fingerprint changed since last audit");
  }

  return { remind: reasons.length > 0, reasons, changedPaths, state, fingerprint };
}

function recordSuccess() {
  writeState({
    lastRunAt: new Date().toISOString(),
    lastPassRate: 100,
    lastGitCommit: getCurrentGitCommit(),
    companionFingerprint: computeFingerprint(),
  });
}

function runCompanionAuditTests() {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  return spawnSync(npm, ["run", "audit:companion"], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

function isCiEnvironment() {
  return Boolean(process.env.VERCEL || process.env.CI);
}

function warnIfNeeded() {
  const { remind, reasons, changedPaths } = shouldRemind();
  if (!remind) return;
  console.warn(`\n${WARNING}\n`);
  if (reasons.length) {
    console.warn(`Reason: ${reasons.join("; ")}`);
  }
  if (changedPaths.length) {
    console.warn("Changed:", changedPaths.slice(0, 8).join(", "));
    if (changedPaths.length > 8) {
      console.warn(`…and ${changedPaths.length - 8} more`);
    }
  }
  console.warn("");
}

const mode = process.argv[2] ?? "check";

if (mode === "record") {
  recordSuccess();
  console.log("Companion audit state recorded.");
  process.exit(0);
}

if (mode === "post-build" || mode === "dev") {
  if (mode === "post-build" && isCiEnvironment()) {
    console.log("Companion behavior audit (CI)…");
    const result = runCompanionAuditTests();
    if ((result.status ?? 1) !== 0) {
      console.error("\n❌ Companion audit failed on CI.\n");
      process.exit(result.status ?? 1);
    }
    console.log("✓ Companion behavior audit passed.");
    process.exit(0);
  }
  warnIfNeeded();
  process.exit(0);
}

if (mode === "pre-commit") {
  const staged = getStagedCompanionPaths();
  if (staged.length === 0) process.exit(0);
  console.log(
    `Companion behavior files staged (${staged.length}) — running audit…`,
  );
  const result = runCompanionAuditTests();
  if ((result.status ?? 1) !== 0) {
    console.error("\n❌ Companion audit failed. Fix failures before commit.\n");
    process.exit(result.status ?? 1);
  }
  recordSuccess();
  process.exit(0);
}

if (mode === "check") {
  const { remind, state, fingerprint } = shouldRemind();
  console.log(
    JSON.stringify(
      { remind, command: "npm run audit:companion", state, fingerprint },
      null,
      2,
    ),
  );
  process.exit(remind ? 1 : 0);
}

console.error(`Unknown mode: ${mode}`);
process.exit(2);

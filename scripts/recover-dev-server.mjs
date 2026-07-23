/**
 * Recover a hung localhost:3000 (stale Webpack / Failed to fetch).
 * Usage: npm run dev:recover
 */
import { spawn, execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const isWin = process.platform === "win32";

function log(msg) {
  console.log(`[dev:recover] ${msg}`);
}

function killPort3000() {
  try {
    if (isWin) {
      const out = execSync('netstat -ano | findstr ":3000"', {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (!/LISTENING/i.test(line)) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid) && pid !== "0") pids.add(pid);
      }
      for (const pid of pids) {
        log(`Stopping PID ${pid} on :3000`);
        try {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
        } catch {
          /* already gone */
        }
      }
      if (!pids.size) log("No listener on :3000");
    } else {
      try {
        execSync("lsof -ti:3000 | xargs -r kill -9", { stdio: "ignore" });
        log("Cleared :3000");
      } catch {
        log("No listener on :3000");
      }
    }
  } catch {
    log("No listener on :3000");
  }
}

function clearNextCache() {
  const cacheDir = path.join(root, ".next", "cache");
  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true });
    log("Cleared .next/cache");
  } else {
    log("No .next/cache to clear");
  }
}

killPort3000();
clearNextCache();

log("Starting next with 8GB heap…");
const child = spawn(
  process.execPath,
  [
    "--max-old-space-size=8192",
    path.join(root, "node_modules", "next", "dist", "bin", "next"),
    "dev",
    "-p",
    "3000",
    "--webpack",
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, "--max-old-space-size=8192"]
        .filter(Boolean)
        .join(" "),
    },
    shell: false,
  },
);

child.on("exit", (code) => process.exit(code ?? 0));

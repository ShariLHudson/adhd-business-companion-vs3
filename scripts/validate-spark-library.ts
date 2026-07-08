/**
 * Validate all Spark library JSON files.
 * Run: npm run spark-library:validate
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { SparkContentRecord } from "../lib/sparkNote/contentDatabase/types";
import { validateSparkRecords } from "../lib/sparkNote/contentDatabase/validateRecord";
import { analyzeSparkLibraryBalance } from "../lib/sparkNote/contentDatabase/libraryBalance";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libraryRoot = path.join(__dirname, "..", "spark-library");

function loadRecords(): SparkContentRecord[] {
  const manifestPath = path.join(libraryRoot, "manifest.json");
  const raw = readFileSync(manifestPath, "utf8");
  return JSON.parse(raw) as SparkContentRecord[];
}

function countByStatus(records: SparkContentRecord[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const record of records) {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
  }
  return counts;
}

function main(): void {
  const records = loadRecords();
  const { errors, warnings } = validateSparkRecords(records);
  const statusCounts = countByStatus(records);
  const balance = analyzeSparkLibraryBalance(records);

  console.log(`\nSpark library validation — ${records.length} records\n`);
  console.log("Status:", statusCounts);
  console.log("\nBalance (active Sparks vs protocol targets):");
  for (const row of balance) {
    const actual = `${(row.actualShare * 100).toFixed(0)}%`;
    const target = `${(row.targetShare * 100).toFixed(0)}%`;
    console.log(
      `  ${row.label.padEnd(22)} ${String(row.count).padStart(2)}  actual ${actual.padStart(4)}  target ${target}`,
    );
  }

  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings.slice(0, 12)) {
      console.log(`  [${w.field}] ${w.message}`);
    }
    if (warnings.length > 12) {
      console.log(`  … and ${warnings.length - 12} more`);
    }
  }

  if (errors.length) {
    console.error(`\nErrors (${errors.length}):`);
    for (const e of errors) {
      console.error(`  [${e.field}] ${e.message}`);
    }
    process.exit(1);
  }

  console.log("\nValidation passed.");
}

main();

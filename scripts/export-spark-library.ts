/**
 * Export `catalogSeed` entries to `spark-library/` JSON files + manifest.
 * Run: npm run spark-library:export
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SEED_SPARK_NOTE_CATALOG } from "../lib/sparkNote/catalogSeed";
import { libraryFolderForCategory } from "../lib/sparkNote/contentDatabase/folders";
import { catalogEntryToRecord } from "../lib/sparkNote/contentDatabase/mapRecord";
import type { SparkContentRecord } from "../lib/sparkNote/contentDatabase/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const libraryRoot = path.join(root, "spark-library");

function writeRecord(folder: string, record: SparkContentRecord): void {
  const dir = path.join(libraryRoot, folder);
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${record.spark_id}.json`);
  writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

function collectExistingRecords(): SparkContentRecord[] {
  const records: SparkContentRecord[] = [];
  if (!readFileSync) return records;

  const entries = readdirSync(libraryRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(libraryRoot, entry.name);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      const raw = readFileSync(path.join(dir, file), "utf8");
      records.push(JSON.parse(raw) as SparkContentRecord);
    }
  }
  return records;
}

function main(): void {
  mkdirSync(libraryRoot, { recursive: true });

  const fromSeed = SEED_SPARK_NOTE_CATALOG.map(catalogEntryToRecord);
  const byId = new Map<string, SparkContentRecord>();

  for (const record of collectExistingRecords()) {
    byId.set(record.spark_id, record);
  }
  for (const record of fromSeed) {
    byId.set(record.spark_id, record);
  }

  const all = [...byId.values()].sort((a, b) => a.spark_id.localeCompare(b.spark_id));

  for (const record of all) {
    const folder = libraryFolderForCategory(
      record.runtime_category ?? "invention",
    );
    writeRecord(folder, record);
  }

  writeFileSync(
    path.join(libraryRoot, "manifest.json"),
    `${JSON.stringify(all, null, 2)}\n`,
    "utf8",
  );

  console.log(`Exported ${all.length} Sparks to spark-library/`);
}

main();

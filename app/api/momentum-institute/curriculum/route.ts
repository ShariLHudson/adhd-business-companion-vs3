import { NextResponse } from "next/server";

import { bootstrapCurriculumFromDisk } from "@/lib/momentumInstitute/curriculum/server/loader";
import {
  computeCurriculumRegistryStats,
  getCurriculumRegistry,
} from "@/lib/momentumInstitute/curriculum/registry";

export const runtime = "nodejs";

/** Load authored curriculum from disk into the in-memory registry. */
export async function POST() {
  const loaded = bootstrapCurriculumFromDisk();
  const stats = computeCurriculumRegistryStats(getCurriculumRegistry());
  return NextResponse.json({ loaded, stats });
}

export async function GET() {
  const stats = computeCurriculumRegistryStats(getCurriculumRegistry());
  return NextResponse.json({ stats, registry: getCurriculumRegistry() });
}

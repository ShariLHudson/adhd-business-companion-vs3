import { NextRequest, NextResponse } from "next/server";

import { ecosystemCountsToProductSignals } from "@/lib/ecosystem/ecosystemDashboardSignals";
import {
  generateLiveContentOpportunities,
  toPostCraftLiveExport,
} from "@/lib/ecosystem/liveContentOpportunityGenerator";
import { loadEcosystemSignalCounts } from "@/lib/ecosystem/serverSignalStore";
import { isGhlDashboardAuthorized } from "@/lib/ghl/auth";

/** PostCraft-ready export from live ecosystem signals. */
export async function GET(request: NextRequest) {
  if (!(await isGhlDashboardAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const counts = await loadEcosystemSignalCounts();
  const productSignals = ecosystemCountsToProductSignals(counts);
  const opportunities = generateLiveContentOpportunities({
    counts,
    productSignals,
  });

  return NextResponse.json(toPostCraftLiveExport(opportunities));
}

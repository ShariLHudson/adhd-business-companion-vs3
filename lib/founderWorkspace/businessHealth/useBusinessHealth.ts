"use client";

import { useEffect, useState } from "react";

import { eventStore } from "@/lib/ecosystem/eventStore";
import { buildProductIntelligenceReport } from "@/lib/founderWorkspace/productIntelligence/productIntelligenceEngine";

import { loadBusinessMetricsSnapshot } from "./businessSnapshot";
import { buildBusinessHealthReport } from "./businessHealthEngine";
import type { BusinessHealthReport } from "./types";

const DEFAULT_FOUNDER_ID = "founder-001";

function computeReport(founderId: string): BusinessHealthReport {
  const events = eventStore.query({});
  const productReport = buildProductIntelligenceReport(events, founderId);
  return buildBusinessHealthReport({
    events,
    productReport,
    businessSnapshot: loadBusinessMetricsSnapshot(),
  });
}

export function useBusinessHealth(
  founderId: string = DEFAULT_FOUNDER_ID,
): BusinessHealthReport {
  const [report, setReport] = useState(() => computeReport(founderId));

  useEffect(() => {
    setReport(computeReport(founderId));
    return eventStore.subscribe(() => {
      setReport(computeReport(founderId));
    });
  }, [founderId]);

  return report;
}

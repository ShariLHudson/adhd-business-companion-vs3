"use client";

import { useEffect, useState } from "react";

import { eventStore } from "@/lib/ecosystem/eventStore";

import { buildProductIntelligenceReport } from "./productIntelligenceEngine";
import type { ProductIntelligenceReport } from "./types";

const DEFAULT_FOUNDER_ID = "founder-001";

function computeReport(founderId: string): ProductIntelligenceReport {
  const events = eventStore.query({ founderId });
  return buildProductIntelligenceReport(events, founderId);
}

export function useProductIntelligence(
  founderId: string = DEFAULT_FOUNDER_ID,
): ProductIntelligenceReport {
  const [report, setReport] = useState(() => computeReport(founderId));

  useEffect(() => {
    setReport(computeReport(founderId));
    return eventStore.subscribe(() => {
      setReport(computeReport(founderId));
    });
  }, [founderId]);

  return report;
}

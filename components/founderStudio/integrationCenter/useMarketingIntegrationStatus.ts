"use client";

import { useEffect, useState } from "react";

import {
  parseMarketingIntegrationStatus,
  type MarketingIntegrationLiveStatus,
} from "@/lib/executiveIntegration";

const DEFAULT_STATUS: MarketingIntegrationLiveStatus = {
  postcraft: "not-connected",
  gohighlevel: "not-connected",
};

export function useMarketingIntegrationStatus(): MarketingIntegrationLiveStatus {
  const [status, setStatus] = useState<MarketingIntegrationLiveStatus>(DEFAULT_STATUS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/ecosystem/dashboard/status");
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled) {
          setStatus(parseMarketingIntegrationStatus(payload));
        }
      } catch {
        if (!cancelled) {
          setStatus(DEFAULT_STATUS);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

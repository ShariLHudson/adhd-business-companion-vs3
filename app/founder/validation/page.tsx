"use client";

import { FounderValidationMode } from "@/components/founder/FounderValidationMode";

/**
 * Founder Validation Mode — certification journeys only.
 * Protected by founder-admin cookie (proxy). Not shown to members.
 */
export default function FounderValidationPage() {
  return <FounderValidationMode />;
}

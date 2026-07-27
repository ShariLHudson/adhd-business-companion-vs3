"use client";

import { useEffect, useRef } from "react";

/**
 * Migration safety net for the retired BusinessProfilePanel.
 *
 * The legacy `business-profile` navigation token is preserved (many entry
 * points still reference it), but there is now a single Business Profile
 * experience — the Business Estate. If anything still routes to the
 * `business-profile` section, this fires once on mount to redirect into the
 * estate instead of showing a blank room. The primary redirect happens at the
 * navigation choke point; this guarantees no dead end regardless of caller.
 */
export function BusinessProfileLegacyRedirect({
  onRedirect,
}: {
  onRedirect: () => void;
}) {
  const ref = useRef(onRedirect);
  ref.current = onRedirect;
  useEffect(() => {
    ref.current();
  }, []);
  return null;
}

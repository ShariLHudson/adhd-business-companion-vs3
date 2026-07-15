"use client";

import { useEffect } from "react";

/**
 * Deep-link / restore shim for legacy section=time-block.
 * Never renders Momentum Appointments UI — redirects to Plan My Day → Calendar.
 */
export function LegacyMomentumAppointmentRedirect({
  onRedirect,
}: {
  onRedirect: () => void;
}) {
  useEffect(() => {
    onRedirect();
    // Mount-only: host openers are not stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- legacy deep-link once
  }, []);

  return (
    <div
      className="flex min-h-[12rem] items-center justify-center px-6 py-10"
      data-testid="legacy-momentum-appointment-redirect"
      aria-live="polite"
    >
      <p className="text-center text-base text-[#4b463f]">
        Opening your calendar…
      </p>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import { HospitalityExperiencePrototype } from "@/components/companion/hospitality/HospitalityExperiencePrototype";
import "./hospitality-prototype.css";

const ALLOWED =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_HOSPITALITY_PROTOTYPE === "true";

/** Companion Hospitality™ — emotional validation prototype. */
export default function HospitalityPrototypePage() {
  if (!ALLOWED) {
    return (
      <main className="hospitality-experience hospitality-experience--loading">
        Hospitality prototype is available in development, or set
        NEXT_PUBLIC_HOSPITALITY_PROTOTYPE=true.
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="hospitality-experience hospitality-experience--loading">
          Preparing the living room…
        </main>
      }
    >
      <HospitalityExperiencePrototype />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { JournalGazeboExperience } from "@/components/journal-gazebo/JournalGazeboExperience";
import {
  resetJournalGazeboFirstVisit,
  resetJournalGazeboPrototype,
} from "@/lib/journalGazebo/prototype";
import { useLayoutEffect, useState } from "react";
import "./journal-gazebo-prototype.css";

function JournalGazeboPrototypeInner() {
  const searchParams = useSearchParams();
  const forceFirst = searchParams.get("first") === "1";
  const returnVisit = searchParams.get("return") === "1";
  const [sessionKey, setSessionKey] = useState(0);

  useLayoutEffect(() => {
    if (!returnVisit) {
      resetJournalGazeboFirstVisit();
    }
    if (forceFirst) {
      resetJournalGazeboPrototype(true);
    }
    setSessionKey((key) => key + 1);
  }, [forceFirst, returnVisit]);

  return (
    <div className="journal-gazebo-prototype-page">
      <JournalGazeboExperience
        key={sessionKey}
        prototypeMode
        assumeFirstVisit={!returnVisit}
        onBack={() => {
          window.location.href = "/companion";
        }}
        backLabel="Companion"
      />
    </div>
  );
}

/**
 * Journal Gazebo™ — living prototype.
 * Route: /companion/journal-gazebo-prototype
 * Default: first-visit welcome (session reset on load).
 * ?return=1 — return visit (journal on desk, no envelope).
 * ?first=1 — full reset including saved journals.
 */
export default function JournalGazeboPrototypePage() {
  return (
    <Suspense
      fallback={
        <div className="journal-gazebo-prototype-page journal-gazebo-prototype-page--loading">
          <p>Preparing the Journal Gazebo…</p>
        </div>
      }
    >
      <JournalGazeboPrototypeInner />
    </Suspense>
  );
}

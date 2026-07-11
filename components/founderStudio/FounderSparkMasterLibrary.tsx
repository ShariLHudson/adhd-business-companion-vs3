"use client";

import { useMemo } from "react";

import { getMasterLibraryBootstrap } from "@/lib/founder/masterLibraryCenter";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { MasterLibraryCategoryPanel } from "./masterLibrary/MasterLibraryCategoryPanel";

export function FounderSparkMasterLibrary() {
  const library = useMemo(() => getMasterLibraryBootstrap(), []);

  return (
    <div className="founder-master-lib">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Spark Master Library"
        title="Permanent Knowledge Index"
        question="Where does everything important belong?"
        purpose="The master catalog of Spark knowledge — unlimited growth, one calm index. Every constitution protected. Every blueprint indexed."
      />

      <section className="founder-master-lib__hero" aria-labelledby="master-lib-hero">
        <p className="founder-master-lib__lead" id="master-lib-hero">
          {library.summary}
        </p>
        <p className="founder-master-lib__stats">
          {library.categories.filter((c) => c.items.length > 0).length} active categories ·{" "}
          {library.totalItems} entries indexed
        </p>
      </section>

      <div className="founder-master-lib__categories">
        {library.categories.map((category, index) => (
          <MasterLibraryCategoryPanel
            key={category.id}
            category={category}
            defaultOpen={index < 3}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

/**
 * Lazy gate so CompanionPageClient can keep
 * `import { ProjectHomesPrototypePanel } from "@/components/companion/projectHomes"`
 * without pulling the panel (and Create graph) into the main client chunk.
 */
export const ProjectHomesPrototypePanel = dynamic(
  () =>
    import("./ProjectHomesPrototypePanel").then(
      (m) => m.ProjectHomesPrototypePanel,
    ),
  { ssr: false },
);

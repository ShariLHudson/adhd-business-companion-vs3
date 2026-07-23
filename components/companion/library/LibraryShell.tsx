"use client";

import type { ReactNode } from "react";
import "@/app/companion/library-collection.css";

type Props = {
  children: ReactNode;
  testId?: string;
  "aria-label"?: string;
};

export function LibraryShell({
  children,
  testId = "library-shell",
  "aria-label": ariaLabel = "Library",
}: Props) {
  return (
    <section
      className="spark-library-shell"
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

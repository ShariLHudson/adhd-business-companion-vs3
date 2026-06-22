"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Renders the sidebar on document.body so no in-app overlay can cover it. */
export function CompanionSidebarPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const shell = (
    <div className="companion-sidebar-portal pointer-events-auto fixed inset-y-0 left-0 z-[9999] flex">
      {children}
    </div>
  );

  if (!mounted) return shell;

  return createPortal(shell, document.body);
}

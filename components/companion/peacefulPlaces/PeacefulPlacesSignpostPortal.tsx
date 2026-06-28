"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
};

/** Renders pathway signposts above the companion shell so clicks always land. */
export function PeacefulPlacesSignpostPortal({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="peaceful-places-signpost-portal" data-peaceful-places-signpost-portal="1">
      {children}
    </div>,
    document.body,
  );
}

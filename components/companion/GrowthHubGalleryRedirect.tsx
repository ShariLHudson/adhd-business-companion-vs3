"use client";

import { useEffect } from "react";

/** Legacy `growth` workspace routes — open the Asset Library hub. */
export function GrowthHubGalleryRedirect({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return null;
}

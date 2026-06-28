"use client";

import { useEffect } from "react";

/** Legacy `growth` workspace routes — send guests into The Gallery hallway. */
export function GrowthHubGalleryRedirect({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return null;
}

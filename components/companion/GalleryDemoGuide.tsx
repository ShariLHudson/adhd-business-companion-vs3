"use client";

import { useEffect, useState } from "react";
import {
  dismissGalleryDemoGuide,
  GALLERY_DEMO_GUIDE_STEPS,
  isGalleryDemoGuideDismissed,
} from "@/lib/gallery/galleryDemoGuide";
import { GALLERY_DEMO_DISCLAIMER } from "@/lib/gallery/galleryDemoMode";

type Props = {
  /** When false, guide stays hidden even if not dismissed. */
  open: boolean;
  onDismiss: () => void;
};

export function GalleryDemoGuide({ open, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setVisible(!isGalleryDemoGuideDismissed());
  }, [open]);

  if (!visible) return null;

  function handleDismiss() {
    dismissGalleryDemoGuide();
    setVisible(false);
    onDismiss();
  }

  return (
    <aside
      className="gallery__demo-guide"
      aria-label="How the Gallery demo works"
      data-testid="gallery-demo-guide"
    >
      <p className="gallery__demo-guide-kicker">{GALLERY_DEMO_DISCLAIMER}</p>
      <h2 className="gallery__demo-guide-title">How this stroll works</h2>
      <ol className="gallery__demo-guide-steps">
        {GALLERY_DEMO_GUIDE_STEPS.map((step) => (
          <li key={step.title}>
            <span className="gallery__demo-guide-step-title">{step.title}</span>
            <span className="gallery__demo-guide-step-body">{step.body}</span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="gallery__demo-guide-dismiss"
        onClick={handleDismiss}
      >
        Got it — let me walk
      </button>
    </aside>
  );
}

"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDismissibleWindow } from "@/lib/windowDismiss";

export type ModalSheetTheme = "default" | "estate-dark";

/**
 * ADHD-friendly modal sheet from the right.
 * Settings uses theme="estate-dark" for the brown estate sheet.
 */
export function ModalSheet({
  open,
  onClose,
  title,
  children,
  /** Portal above Welcome Home / full-bleed estate layers (body + fixed). */
  portaled = false,
  /** Match Estate menus — dark brown sheet for Settings. */
  theme = "default",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  portaled?: boolean;
  theme?: ModalSheetTheme;
}) {
  const [entered, setEntered] = useState(open);
  const [portalReady, setPortalReady] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * Escape, outside click, and Close all take the shared guarded path
   * (dismiss stack + upload / active-operation / unsaved-work policy).
   */
  const { requestClose } = useDismissibleWindow({
    open,
    onClose,
    outsideClickRef: panelRef,
  });

  useLayoutEffect(() => {
    if (!portaled) return;
    setPortalReady(true);
  }, [portaled]);

  useLayoutEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    setEntered(true);
  }, [open]);

  if (!open) return null;

  const shellClass = portaled
    ? "modal-sheet-portal pointer-events-none fixed inset-0 z-[100010] flex justify-end overflow-hidden"
    : "pointer-events-none absolute inset-0 z-50 flex justify-end overflow-hidden";

  const dark = theme === "estate-dark";

  const sheet = (
    <div
      className={shellClass}
      data-companion-modal-layer={portaled ? "true" : undefined}
      data-testid="modal-sheet"
      data-modal-theme={theme}
    >
      {entered ? (
        // Scrim only — dismissal is owned by the shared outside-click policy.
        // The header Close button remains the accessible close affordance.
        <div
          aria-hidden="true"
          className="pointer-events-auto absolute inset-0 bg-black/30 transition-opacity duration-300"
          data-testid="modal-sheet-backdrop"
        />
      ) : null}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "pointer-events-auto relative z-10 flex h-full w-full max-w-md flex-col shadow-2xl transition-transform duration-300 ease-out",
          dark ? "modal-sheet--estate-dark" : "modal-sheet--default bg-[#faf7f2]",
          entered ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div
          className={[
            "flex shrink-0 items-center justify-between gap-3 px-5 py-3",
            dark ? "modal-sheet__header--dark" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span
            className={
              dark
                ? "text-sm font-semibold text-[rgba(255,236,200,0.82)]"
                : "text-sm font-semibold text-[#6b635a]"
            }
          >
            {title}
          </span>
          <button
            type="button"
            onClick={() => requestClose()}
            aria-label="Close"
            className={
              dark
                ? "flex h-9 w-9 items-center justify-center rounded-full text-xl text-[rgba(255,236,200,0.85)] hover:bg-white/10"
                : "flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#6b635a] hover:bg-[#1e4f4f]/10"
            }
            data-testid="modal-sheet-close"
          >
            ✕
          </button>
        </div>
        <div
          className={[
            "modal-sheet__body min-h-0 flex-1 overflow-y-auto",
            dark ? "modal-sheet__body--dark" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );

  if (portaled && portalReady) {
    return createPortal(sheet, document.body);
  }

  return sheet;
}

"use client";

import { useDismissibleWindow } from "@/lib/windowDismiss";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Explicit-decision dialog — outside click and Escape do not dismiss.
 * Member must choose Confirm or Cancel.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useDismissibleWindow({
    open,
    onClose: onCancel,
    requiresExplicitDecision: true,
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      data-testid="confirm-dialog"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-[#1f1c19]"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">{message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              destructive
                ? "bg-[#a85c4a] hover:bg-[#8f4d3d]"
                : "bg-[#1e4f4f] hover:bg-[#163a3a]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Browser print capability — never silently hide Print.
 */

export type PrintSupport = {
  supported: boolean;
  reasonUnavailable: string | null;
};

export function detectPrintSupport(
  win: Pick<Window, "print" | "open"> | null | undefined = typeof window !==
  "undefined"
    ? window
    : undefined,
): PrintSupport {
  if (!win) {
    return {
      supported: false,
      reasonUnavailable: "Printing isn’t available in this environment.",
    };
  }
  if (typeof win.print !== "function" && typeof win.open !== "function") {
    return {
      supported: false,
      reasonUnavailable:
        "This browser can’t open the print dialog. You can download a PDF instead.",
    };
  }
  return { supported: true, reasonUnavailable: null };
}

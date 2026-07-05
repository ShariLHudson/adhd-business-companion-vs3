/** Browser fullscreen for Enjoy the Estate — scene fills the viewport. */

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
};

export function isEstateBrowserFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.fullscreenElement);
}

export async function requestEstateBrowserFullscreen(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as FullscreenElement;
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return true;
    }
  } catch {
    /* member declined or browser blocked */
  }
  return false;
}

export async function exitEstateBrowserFullscreen(): Promise<void> {
  if (typeof document === "undefined") return;
  const doc = document as FullscreenDocument;
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
      return;
    }
    if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  } catch {
    /* member declined */
  }
}

export async function toggleEstateBrowserFullscreen(): Promise<boolean> {
  if (isEstateBrowserFullscreen()) {
    await exitEstateBrowserFullscreen();
    return false;
  }
  return requestEstateBrowserFullscreen();
}

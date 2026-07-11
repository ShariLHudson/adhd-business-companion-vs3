const COMPANION_CHUNK_RELOAD_KEY = "companion-chunk-reload-v1";

/** Webpack / Next dev rejects dynamic imports with an Event when a chunk script fails. */
export function isCompanionWebpackChunkFailure(err: unknown): boolean {
  if (err instanceof Error) {
    const message = err.message ?? "";
    return (
      err.name === "ChunkLoadError" ||
      message.includes("Loading chunk") ||
      message.includes("Failed to fetch dynamically imported module")
    );
  }

  if (
    err &&
    typeof err === "object" &&
    "type" in err &&
    (err as Event).type === "error"
  ) {
    return true;
  }

  return false;
}

/** One automatic hard refresh per tab session when a stale companion chunk is detected. */
export function reloadOnceForStaleCompanionChunk(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(COMPANION_CHUNK_RELOAD_KEY) === "1") {
      return false;
    }
    sessionStorage.setItem(COMPANION_CHUNK_RELOAD_KEY, "1");
  } catch {
    /* sessionStorage unavailable — still attempt reload */
  }

  window.location.reload();
  return true;
}

export function clearCompanionChunkReloadGuard(): void {
  try {
    sessionStorage.removeItem(COMPANION_CHUNK_RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

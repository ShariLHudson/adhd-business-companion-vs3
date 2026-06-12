/** Dev-only tracing for workspace open/sync flicker. */

const ENABLED =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development";

export function dbgWorkspace(event: string, detail?: unknown): void {
  if (!ENABLED) return;
  if (detail !== undefined) {
    console.debug(`[workspace] ${event}`, detail);
  } else {
    console.debug(`[workspace] ${event}`);
  }
}

/**
 * executeCaptureIntent™ — capture execution layer only.
 * No chat, navigation, or audio side effects.
 */

import type { CaptureIntent, CaptureWriteResult } from "./types";
import { saveCaptureEntry } from "./saveCaptureEntry";

/** Write-only capture — silent success; never routes or chats. */
export function executeCaptureWrite(
  intent: Extract<CaptureIntent, { kind: "write" }>,
): CaptureWriteResult {
  const result = saveCaptureEntry(intent.captureType, intent.content);
  if (result.ok) {
    return {
      action: "saved",
      recordId: result.recordId,
      captureType: result.captureType,
    };
  }
  return { action: "queued" };
}

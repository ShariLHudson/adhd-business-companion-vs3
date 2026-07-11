/**
 * Capture System — write-only storage for Journal, Portfolio, Evidence Vault.
 * Not conversation. Not navigation. Not sound.
 */

export type CaptureType = "journal" | "portfolio" | "evidence-vault";

export type CaptureIntent =
  | { kind: "none" }
  | { kind: "write"; captureType: CaptureType; content: string; userText: string }
  | { kind: "view"; captureType: CaptureType; userText: string };

export type SaveCaptureResult =
  | { ok: true; recordId: string; captureType: CaptureType }
  | { ok: false; queued: boolean };

export type CaptureWriteResult =
  | { action: "saved"; recordId: string; captureType: CaptureType }
  | { action: "queued" };

/**
 * Canva connection — Settings → Connections / Digital Workspace Preferences.
 * Stores the member's preferred Canva destination URL (homepage or workspace).
 * No OAuth in V1 — URL destination is the connection.
 */

const STORAGE_KEY = "companion-canva-connection-v1";

export type CanvaConnectionRecord = {
  connected: boolean;
  /** Preferred Canva homepage or workspace URL */
  destinationUrl: string | null;
  connectedAt?: string;
  updatedAt?: string;
  lastVerifiedAt?: string | null;
  provider: "canva";
};

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

function emptyRecord(): CanvaConnectionRecord {
  return {
    connected: false,
    destinationUrl: null,
    provider: "canva",
    lastVerifiedAt: null,
  };
}

/** Accept https Canva hosts only — never open arbitrary URLs. */
export function normalizeCanvaDestinationUrl(
  raw: string,
): { ok: true; url: string } | { ok: false; reason: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, reason: "Add a Canva link to continue." };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, reason: "That doesn’t look like a valid web address." };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "Canva links need to start with https." };
  }
  const host = parsed.hostname.toLowerCase();
  const allowed =
    host === "canva.com" ||
    host.endsWith(".canva.com") ||
    host === "www.canva.com";
  if (!allowed) {
    return {
      ok: false,
      reason: "Use a link from canva.com so Spark opens the right place.",
    };
  }
  return { ok: true, url: parsed.toString() };
}

export function readCanvaConnection(): CanvaConnectionRecord {
  if (!hasStorage()) return emptyRecord();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyRecord();
    const parsed = JSON.parse(raw) as Partial<CanvaConnectionRecord>;
    const url =
      typeof parsed.destinationUrl === "string" && parsed.destinationUrl.trim()
        ? parsed.destinationUrl.trim()
        : null;
    const connected = Boolean(parsed.connected) && Boolean(url);
    return {
      connected,
      destinationUrl: connected ? url : url,
      connectedAt: parsed.connectedAt,
      updatedAt: parsed.updatedAt,
      lastVerifiedAt: parsed.lastVerifiedAt ?? null,
      provider: "canva",
    };
  } catch {
    return emptyRecord();
  }
}

export function isCanvaConnected(): boolean {
  const record = readCanvaConnection();
  return record.connected && Boolean(record.destinationUrl);
}

export function connectCanvaLocal(
  destinationUrl: string,
): { ok: true; record: CanvaConnectionRecord } | { ok: false; reason: string } {
  const normalized = normalizeCanvaDestinationUrl(destinationUrl);
  if (!normalized.ok) return normalized;
  const now = new Date().toISOString();
  const record: CanvaConnectionRecord = {
    connected: true,
    destinationUrl: normalized.url,
    connectedAt: now,
    updatedAt: now,
    lastVerifiedAt: now,
    provider: "canva",
  };
  persist(record);
  return { ok: true, record };
}

export function updateCanvaDestinationUrl(
  destinationUrl: string,
): { ok: true; record: CanvaConnectionRecord } | { ok: false; reason: string } {
  const existing = readCanvaConnection();
  const normalized = normalizeCanvaDestinationUrl(destinationUrl);
  if (!normalized.ok) return normalized;
  const now = new Date().toISOString();
  const record: CanvaConnectionRecord = {
    ...existing,
    connected: true,
    destinationUrl: normalized.url,
    connectedAt: existing.connectedAt ?? now,
    updatedAt: now,
    lastVerifiedAt: now,
    provider: "canva",
  };
  persist(record);
  return { ok: true, record };
}

export function verifyCanvaConnection():
  | { ok: true; record: CanvaConnectionRecord }
  | { ok: false; reason: string } {
  const existing = readCanvaConnection();
  if (!existing.destinationUrl) {
    return { ok: false, reason: "Canva hasn’t been connected yet." };
  }
  const normalized = normalizeCanvaDestinationUrl(existing.destinationUrl);
  if (!normalized.ok) {
    return normalized;
  }
  const now = new Date().toISOString();
  const record: CanvaConnectionRecord = {
    ...existing,
    connected: true,
    destinationUrl: normalized.url,
    updatedAt: now,
    lastVerifiedAt: now,
    provider: "canva",
  };
  persist(record);
  return { ok: true, record };
}

export function disconnectCanvaLocal(): CanvaConnectionRecord {
  const record = emptyRecord();
  persist(record);
  return record;
}

function persist(record: CanvaConnectionRecord): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event("companion-canva-connection-updated"));
  } catch {
    /* ignore */
  }
}

export function resetCanvaConnectionForTests(): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

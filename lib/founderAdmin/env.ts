/**
 * Resolve founder admin password from server env.
 */

const CANDIDATE_KEYS = [
  "FOUNDER_ADMIN_PASSWORD",
  "FOUNDER_PASSWORD",
  "ADMIN_PASSWORD",
] as const;

export function resolveFounderAdminPassword(): string {
  for (const name of CANDIDATE_KEYS) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

export function isFounderAdminConfigured(): boolean {
  return Boolean(resolveFounderAdminPassword());
}

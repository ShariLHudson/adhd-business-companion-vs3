/** OAuth return paths — founder workspace + companion only (no open redirects). */
export function safeGoogleOAuthReturnPath(raw: string | null | undefined): string {
  if (!raw) return "/companion";
  try {
    const path = decodeURIComponent(raw);
    if (
      path.startsWith("/founder") ||
      path.startsWith("/companion")
    ) {
      return path;
    }
  } catch {
    /* invalid encoding */
  }
  return "/companion";
}

/** Production site — used when NEXT_PUBLIC_APP_URL is missing or mis-pasted. */
export const COMPANION_APP_URL_DEFAULT =
  "https://ecosystem.visualsparkstudios.com";

export function appUrlLooksValid(value: string): boolean {
  const v = value.trim();
  if (!v.startsWith("http://") && !v.startsWith("https://")) return false;
  if (v.startsWith("sb_")) return false;
  if (v.includes("NEXT_PUBLIC_")) return false;
  return true;
}

/** Public site URL for auth redirects and links (no trailing slash). */
export function getAppSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv && appUrlLooksValid(fromEnv)) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  if (process.env.NODE_ENV === "production") {
    return COMPANION_APP_URL_DEFAULT;
  }

  return "http://localhost:3000";
}

export const APP_DISPLAY_NAME = "ADHD Ecosystem";
export const APP_BRAND_LINE = `Spark Studio · ${APP_DISPLAY_NAME}`;

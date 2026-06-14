/** Public site URL for auth redirects and links (no trailing slash). */
export function getAppSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const APP_DISPLAY_NAME = "ADHD Ecosystem";
export const APP_BRAND_LINE = `Spark Studio · ${APP_DISPLAY_NAME}`;

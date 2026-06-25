import { ASSETS } from "@/lib/companionUi";

/** Approved gallery drops — descriptive filenames, any common image type. */
export const SHARI_GALLERY_SUBDIR = "images/shari/shari-images";

export const SHARI_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

/** Legacy numbered JPG slots in public/images/shari/. */
export const SHARI_OPTIONAL_PHOTOS = Array.from(
  { length: 8 },
  (_, index) => `/images/shari/shari-${index + 1}.jpg`,
);

export function isShariImageFilename(name: string): boolean {
  const lower = name.toLowerCase();
  return SHARI_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Build a public URL from a path relative to /public (encodes filename only). */
export function publicUrlFromPublicRelative(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0) return ASSETS.profile;
  const encoded = parts.map((part, index) =>
    index === parts.length - 1 ? encodeURIComponent(part) : part,
  );
  return `/${encoded.join("/")}`;
}

export function sortShariPhotoUrls(urls: string[]): string[] {
  const unique = [...new Set(urls)];
  return unique.sort((a, b) => {
    if (a === ASSETS.profile) return -1;
    if (b === ASSETS.profile) return 1;
    return a.localeCompare(b);
  });
}

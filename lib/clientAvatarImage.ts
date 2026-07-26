/**
 * Client Avatar profile-image ingestion — modeled on the existing
 * projectAssets / assetLibrary ingest patterns (MIME allowlist + size cap +
 * FileReader/data URL), plus client-side downscale + center-crop so a
 * multi-megabyte phone photo never lands in the avatar JSON / localStorage.
 *
 * No Supabase Storage, no new upload service: the processed image is a small
 * square WebP data URL suitable for inline persistence with the avatar.
 *
 * The pure parts (validation, crop geometry) are unit-tested; the browser part
 * (`processAvatarImage`) uses Image + canvas, which auto-applies EXIF
 * orientation (CSS `image-orientation: from-image` is the modern default), so
 * the stored image is orientation-safe.
 */

export const AVATAR_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Reject absurd originals early (before decode). Processing shrinks the rest. */
export const AVATAR_MAX_SOURCE_BYTES = 15 * 1024 * 1024; // 15 MB
/** Target square edge for the stored avatar image. */
export const AVATAR_OUTPUT_DIMENSION = 512;
/** Stored format + quality — WebP keeps the data URL small. */
export const AVATAR_OUTPUT_MIME = "image/webp";
export const AVATAR_OUTPUT_QUALITY = 0.82;

export type AvatarImageValidation =
  | { ok: true }
  | { ok: false; error: string };

/** Pure: validate a picked file's type and size before any decode. */
export function validateAvatarImageFile(file: {
  type: string;
  size: number;
}): AvatarImageValidation {
  if (!(AVATAR_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      error: "That file type isn't supported. Please use a JPEG, PNG, or WebP image.",
    };
  }
  if (file.size > AVATAR_MAX_SOURCE_BYTES) {
    return {
      ok: false,
      error: "That image is too large. Please choose one under 15 MB.",
    };
  }
  return { ok: true };
}

export type AvatarCrop = {
  /** Source crop rect (largest centered square). */
  sx: number;
  sy: number;
  side: number;
  /** Output square edge (never upscales beyond the source square). */
  target: number;
};

/**
 * Pure: center-crop cover geometry for a square avatar. Crops the largest
 * centered square from the source (so nothing is stretched/distorted) and
 * targets `max` — but never upscales a smaller image.
 */
export function computeAvatarCrop(
  srcW: number,
  srcH: number,
  max: number = AVATAR_OUTPUT_DIMENSION,
): AvatarCrop {
  const side = Math.max(1, Math.min(srcW, srcH));
  const sx = Math.max(0, (srcW - side) / 2);
  const sy = Math.max(0, (srcH - side) / 2);
  const target = Math.min(max, side);
  return { sx, sy, side, target };
}

/**
 * Browser: validate → decode → center-crop → downscale → WebP data URL.
 * Rejects with a user-facing message on unsupported/oversized/undecodable
 * input. The result is a small square image safe to persist inline.
 */
export function processAvatarImage(file: File): Promise<string> {
  const check = validateAvatarImageFile(file);
  if (!check.ok) return Promise.reject(new Error(check.error));

  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const { sx, sy, side, target } = computeAvatarCrop(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
        );
        const canvas = document.createElement("canvas");
        canvas.width = target;
        canvas.height = target;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no-canvas");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);
        const dataUrl = canvas.toDataURL(
          AVATAR_OUTPUT_MIME,
          AVATAR_OUTPUT_QUALITY,
        );
        resolve(dataUrl);
      } catch {
        reject(
          new Error("We couldn't process that image. Please try another one."),
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error("We couldn't read that image. Please try another one."),
      );
    };
    img.src = url;
  });
}

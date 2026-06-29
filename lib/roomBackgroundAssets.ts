/**
 * Room background URLs — WebP preferred, PNG fallback for older browsers.
 */

const PNG_EXT = /\.png(\?.*)?$/i;

export function webpBackgroundUrl(pngOrAnyUrl: string): string {
  return pngOrAnyUrl.replace(PNG_EXT, ".webp$1");
}

/** CSS image-set — WebP when supported, PNG otherwise. */
export function roomBackgroundImageCss(imageUrl: string): string {
  if (!PNG_EXT.test(imageUrl)) {
    return `url('${imageUrl}')`;
  }
  const webp = webpBackgroundUrl(imageUrl);
  return `image-set(url('${webp}') type('image/webp'), url('${imageUrl}') type('image/png'))`;
}

export function roomBackgroundImageStyle(imageUrl: string): {
  backgroundImage: string;
} {
  return { backgroundImage: roomBackgroundImageCss(imageUrl) };
}

/** Prefer WebP for preload when a paired file exists. */
export function preferredBackgroundPreloadUrl(imageUrl: string): string {
  return PNG_EXT.test(imageUrl) ? webpBackgroundUrl(imageUrl) : imageUrl;
}

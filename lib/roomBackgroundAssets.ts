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

/** Inline card previews — PNG directly so room art always appears before WebP exists. */
export function roomBackgroundDirectCss(imageUrl: string): string {
  return `url('${imageUrl}')`;
}

/** Prefer WebP for preload when a paired file exists. */
export function preferredBackgroundPreloadUrl(imageUrl: string): string {
  return PNG_EXT.test(imageUrl) ? webpBackgroundUrl(imageUrl) : imageUrl;
}

/** Ordered PNG/WebP variants — try the canonical path first, then the paired format. */
export function backgroundUrlVariants(imageUrl: string): readonly string[] {
  const variants: string[] = [imageUrl];
  if (PNG_EXT.test(imageUrl)) {
    const webp = webpBackgroundUrl(imageUrl);
    if (!variants.includes(webp)) variants.push(webp);
  } else if (/\.webp(\?.*)?$/i.test(imageUrl)) {
    const png = imageUrl.replace(/\.webp(\?.*)?$/i, ".png$1");
    if (!variants.includes(png)) variants.push(png);
  }
  return variants;
}

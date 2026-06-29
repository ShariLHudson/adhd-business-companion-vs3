"use client";

import type { CompanionObjectSize } from "@/components/companion/CompanionObjectVisual";
import {
  signatureIconDef,
  type SignatureIconId,
} from "@/lib/signatureIcons";
import { SignatureIconGlyph } from "@/components/companion/signatureIconGlyphs";

export type SignatureIconProps = {
  iconId: SignatureIconId;
  size?: CompanionObjectSize;
  className?: string;
  label?: string;
  animate?: boolean;
};

const SIZE_PX: Record<CompanionObjectSize, number> = {
  xs: 18,
  sm: 24,
  md: 28,
  lg: 36,
  card: 48,
  hero: 64,
};

/**
 * Signature illustrated icon — warm line art for navigation and menus.
 */
export function SignatureIcon({
  iconId,
  size = "sm",
  className,
  label,
  animate = true,
}: SignatureIconProps) {
  const def = signatureIconDef(iconId);
  const px = SIZE_PX[size];
  const motion = animate && def?.animation !== "none";

  return (
    <span
      className={[
        "signature-icon",
        motion ? `signature-icon--${def?.animation}` : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-signature-icon={iconId}
      role="img"
      aria-label={label ?? def?.label ?? iconId}
      style={{ width: px, height: px }}
    >
      <SignatureIconGlyph iconId={iconId} className="signature-icon__svg" />
    </span>
  );
}

"use client";

import { companionObjectById, companionObjectRoom } from "@/lib/companionObjects";
import {
  resolveSignatureVisualSpec,
  signatureObjectById,
  type SignatureObjectForm,
} from "@/lib/signatureCompanionObjects";

export type CompanionObjectSize = "xs" | "sm" | "md" | "lg" | "card" | "hero";

export type CompanionObjectVisualProps = {
  objectId: string;
  /** Signature Companion Object id — resolves form, size, and catalog link. */
  signatureId?: string;
  /** Level 1 navigation · Level 2 feature · Level 3 environmental (scene placement). */
  form?: SignatureObjectForm;
  size?: CompanionObjectSize;
  /** Mini-scene card crop vs compact icon square. */
  variant?: "mini-scene" | "icon";
  className?: string;
  /** Overrides registry signature object for screen readers. */
  label?: string;
  /** Subtle life — steam, flicker, breeze. Respects reduced motion. */
  animate?: boolean;
};

const SIZE_CLASS: Record<CompanionObjectSize, string> = {
  xs: "companion-object-visual--xs",
  sm: "companion-object-visual--sm",
  md: "companion-object-visual--md",
  lg: "companion-object-visual--lg",
  card: "companion-object-visual--card",
  hero: "companion-object-visual--hero",
};

/**
 * Renders a Signature Object mini-scene or icon placeholder.
 * CSS homestead scenes until PNG/SVG art lands in the Object Library.
 */
export function CompanionObjectVisual({
  objectId,
  signatureId,
  form,
  size = "sm",
  variant = "mini-scene",
  className,
  label,
  animate,
}: CompanionObjectVisualProps) {
  const signature = signatureId ? signatureObjectById(signatureId) : undefined;
  const spec = signature ? resolveSignatureVisualSpec(signature, form ?? "navigation") : null;
  const resolvedObjectId =
    spec?.featureObjectId ?? spec?.catalogObjectId ?? objectId;
  const resolvedSize = spec?.size ?? size;
  const resolvedVariant = spec?.variant ?? variant;
  const entry = companionObjectById(resolvedObjectId);
  const motion =
    animate ??
    spec?.animate ??
    (resolvedVariant === "mini-scene" && entry?.assetStatus === "placeholder");

  return (
    <span
      className={[
        "companion-object-visual",
        SIZE_CLASS[resolvedSize],
        resolvedVariant === "icon" ? "companion-object-visual--icon" : "",
        motion ? "companion-object-visual--alive" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-companion-object={resolvedObjectId}
      data-signature-object={signature?.id}
      data-signature-form={spec?.form}
      data-catalog-object={spec?.catalogObjectId ?? signature?.catalogObjectId}
      data-companion-room={companionObjectRoom(resolvedObjectId)}
      role="img"
      aria-label={label ?? signature?.name ?? entry?.objectName ?? entry?.label ?? resolvedObjectId}
    />
  );
}

export function CompanionObjectLabel({
  objectId,
  label,
  size = "xs",
  className,
}: {
  objectId: string;
  label: string;
  size?: CompanionObjectSize;
  className?: string;
}) {
  return (
    <span
      className={["inline-flex items-center gap-2", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <CompanionObjectVisual objectId={objectId} size={size} variant="icon" />
      <span>{label}</span>
    </span>
  );
}

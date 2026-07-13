/**
 * Plan My Day owner scoping — keep day items associated with the signed-in member.
 * Falls back to the legacy device key when signed out.
 */

let currentOwnerUserId: string | null = null;

export function setPlanDayOwnerUserId(userId: string | null): void {
  currentOwnerUserId = userId?.trim() || null;
}

export function getPlanDayOwnerUserId(): string | null {
  return currentOwnerUserId;
}

export function planDayItemsStoreKey(): string {
  const owner = getPlanDayOwnerUserId();
  return owner
    ? `companion-plan-my-day-items-v1:${owner}`
    : "companion-plan-my-day-items-v1";
}

export function planDayDeferredStoreKey(): string {
  const owner = getPlanDayOwnerUserId();
  return owner
    ? `companion-plan-my-day-deferred-v1:${owner}`
    : "companion-plan-my-day-deferred-v1";
}

/** Drop items that clearly belong to another account. */
export function filterPlanItemsForOwner<T extends { ownerUserId?: string }>(
  items: T[],
): T[] {
  const owner = getPlanDayOwnerUserId();
  if (!owner) return items;
  return items.filter(
    (item) => !item.ownerUserId || item.ownerUserId === owner,
  );
}

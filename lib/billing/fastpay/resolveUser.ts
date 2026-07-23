/**
 * Associate a verified FastPay event with a Spark Estate companion user.
 */

import { getFounderSupabaseAdmin } from "@/lib/supabase/founderServer";
import { normalizeCompanionEmail } from "@/lib/companionAuthProvision";
import type { NormalizedFastPayEvent } from "./types";

export type ResolvedBillingUser =
  | { ok: true; userId: string; email: string | null }
  | { ok: false; reason: string };

async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = getFounderSupabaseAdmin();
  if (!admin) return null;
  const normalized = normalizeCompanionEmail(email);
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data.users.length) return null;
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalized,
    );
    if (match) return match.id;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

/**
 * Prefer explicit spark user id from metadata; else match companion auth email.
 * Injectable finder supports unit tests without Supabase.
 */
export async function resolveBillingUser(
  event: NormalizedFastPayEvent,
  deps?: {
    findUserIdByEmail?: (email: string) => Promise<string | null>;
  },
): Promise<ResolvedBillingUser> {
  if (event.sparkUserId?.trim()) {
    return {
      ok: true,
      userId: event.sparkUserId.trim(),
      email: event.customerEmail,
    };
  }

  if (!event.customerEmail) {
    return { ok: false, reason: "Missing spark_user_id and customer email." };
  }

  const finder = deps?.findUserIdByEmail ?? findUserIdByEmail;
  const userId = await finder(event.customerEmail);
  if (!userId) {
    return {
      ok: false,
      reason: "No Spark Estate user matched the payment email.",
    };
  }

  return {
    ok: true,
    userId,
    email: normalizeCompanionEmail(event.customerEmail),
  };
}

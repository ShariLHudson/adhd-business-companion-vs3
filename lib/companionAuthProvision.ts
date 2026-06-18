import type { User } from "@supabase/supabase-js";

import { getFounderSupabaseAdmin } from "@/lib/supabase/founderServer";

export type ProvisionCompanionUserInput = {
  email: string;
  password: string;
  name?: string;
};

export type ProvisionCompanionUserResult =
  | {
      ok: true;
      user: User;
      created: boolean;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

export function normalizeCompanionEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type CompanionAuthAccountLookup =
  | { status: "no_admin" }
  | { status: "not_found" }
  | { status: "exists"; emailConfirmed: boolean };

/** Server-only: whether this email already has a Supabase auth user. */
export async function lookupCompanionAuthAccount(
  email: string,
): Promise<CompanionAuthAccountLookup> {
  const admin = getFounderSupabaseAdmin();
  if (!admin) return { status: "no_admin" };
  const existing = await findCompanionUserByEmail(
    admin,
    normalizeCompanionEmail(email),
  );
  if (!existing) return { status: "not_found" };
  return {
    status: "exists",
    emailConfirmed: Boolean(existing.email_confirmed_at),
  };
}

export function isInvalidLoginCredentialsError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  );
}

async function findCompanionUserByEmail(
  admin: NonNullable<ReturnType<typeof getFounderSupabaseAdmin>>,
  email: string,
): Promise<User | null> {
  const normalized = normalizeCompanionEmail(email);
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data.users.length) return null;
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalized,
    );
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

/** Create or confirm a companion user without email confirmation (server-only). */
export async function provisionCompanionUser(
  input: ProvisionCompanionUserInput,
): Promise<ProvisionCompanionUserResult> {
  const admin = getFounderSupabaseAdmin();
  if (!admin) {
    return {
      ok: false,
      error:
        "Server auth provisioning is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your environment.",
      status: 503,
    };
  }

  const email = normalizeCompanionEmail(input.email);
  const password = input.password;
  const name = input.name?.trim();

  if (!email || !password) {
    return { ok: false, error: "Email and password are required.", status: 400 };
  }
  if (password.length < 6) {
    return {
      ok: false,
      error: "Password must be at least 6 characters.",
      status: 400,
    };
  }

  const existing = await findCompanionUserByEmail(admin, email);

  if (existing) {
    const { data: updated, error: updateError } =
      await admin.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
        password,
        ...(name
          ? { user_metadata: { ...existing.user_metadata, name } }
          : {}),
      });
    if (updateError) {
      return { ok: false, error: updateError.message, status: 400 };
    }
    return {
      ok: true,
      user: updated.user,
      created: false,
    };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { name } : undefined,
  });

  if (error || !data.user) {
    const duplicate =
      error?.message.toLowerCase().includes("already") ||
      error?.message.toLowerCase().includes("registered");
    if (duplicate) {
      const retryUser = await findCompanionUserByEmail(admin, email);
      if (retryUser) {
        const { data: updated, error: updateError } =
          await admin.auth.admin.updateUserById(retryUser.id, {
            email_confirm: true,
            password,
            ...(name
              ? { user_metadata: { ...retryUser.user_metadata, name } }
              : {}),
          });
        if (!updateError && updated.user) {
          return { ok: true, user: updated.user, created: false };
        }
      }
    }
    return {
      ok: false,
      error: error?.message ?? "Could not create user.",
      status: 400,
    };
  }

  return { ok: true, user: data.user, created: true };
}

export function companionProvisionSecret(): string {
  return (
    process.env.COMPANION_PROVISION_SECRET?.trim() ||
    process.env.ECOSYSTEM_DASHBOARD_TOKEN?.trim() ||
    process.env.GHL_DASHBOARD_TOKEN?.trim() ||
    process.env.FOUNDER_ADMIN_PASSWORD?.trim() ||
    ""
  );
}

export function verifyCompanionProvisionToken(
  token: string | null | undefined,
): boolean {
  if (!token) return false;
  const expected = companionProvisionSecret();
  if (!expected) return false;
  if (token.length !== expected.length) return false;
  let out = 0;
  for (let i = 0; i < token.length; i++) {
    out |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return out === 0;
}

/** Confirm an existing account so sign-in works without a confirmation email. */
export async function confirmCompanionUserEmail(
  email: string,
): Promise<boolean> {
  const admin = getFounderSupabaseAdmin();
  if (!admin) return false;
  const existing = await findCompanionUserByEmail(admin, email);
  if (!existing) return false;
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    email_confirm: true,
  });
  return !error;
}

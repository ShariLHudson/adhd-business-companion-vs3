"use client";

import { seedCompanionSupabaseInlineConfig } from "@/lib/supabase/companionClient";

type Props = {
  url: string;
  anonKey: string;
};

/**
 * Seeds Supabase auth config on the client without inline &lt;script&gt; tags
 * (Next.js rejects script children in React component trees).
 */
export function CompanionAuthInlineBootstrap({ url, anonKey }: Props) {
  seedCompanionSupabaseInlineConfig(url, anonKey);
  return null;
}

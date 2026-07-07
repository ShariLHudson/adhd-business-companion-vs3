/**
 * Discovery CMS — Supabase migration schema (future).
 */

export const DISCOVERY_CMS_TABLE = "discovery_library";

export type SupabaseDiscoveryCmsRow = {
  id: string;
  status: string;
  priority: string;
  category: string;
  title: string;
  subtitle: string | null;
  discovery_text: string;
  why_it_matters: string | null;
  food_for_thought: string | null;
  image: string | null;
  primary_button: string | null;
  destination_route: string | null;
  destination_type: string | null;
  save_allowed: boolean;
  related_room: string | null;
  related_feature: string | null;
  related_tool: string | null;
  target_registry: string;
  target_id: string;
  trigger_rules: unknown;
  tags: string[];
  keywords: string[];
  version: number;
  created_at: string;
  last_updated: string;
  author: string;
  editorial: unknown;
  future: unknown;
};

export type DiscoveryCmsStorageAdapter = {
  list(): Promise<SupabaseDiscoveryCmsRow[]>;
  getById(id: string): Promise<SupabaseDiscoveryCmsRow | null>;
  upsert(row: SupabaseDiscoveryCmsRow): Promise<void>;
};

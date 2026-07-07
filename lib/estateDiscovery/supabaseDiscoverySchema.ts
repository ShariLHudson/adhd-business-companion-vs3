/**
 * Supabase schema notes for future Discovery Library + History sync.
 * V1 reads JSON and persists member history in localStorage.
 */

export const DISCOVERY_LIBRARY_TABLE = "discovery_library";
export const DISCOVERY_HISTORY_TABLE = "discovery_history";
export const ROOM_PLACEMENT_TABLE = "room_placement_library";

export type SupabaseDiscoveryLibraryRow = {
  id: string;
  status: string;
  payload: Record<string, unknown>;
  updated_at: string;
};

export type SupabaseDiscoveryHistoryRow = {
  user_id: string;
  discovery_id: string;
  status: string;
  shown_at: string | null;
  opened_at: string | null;
  saved_at: string | null;
  completed_at: string | null;
  ignored_at: string | null;
  destination_visited_at: string | null;
  room_where_shown: string | null;
  placement_location: string | null;
  destination_route: string | null;
  updated_at: string;
};

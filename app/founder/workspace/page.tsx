import { redirect } from "next/navigation";

import { FOUNDER_ADMIN_WORKSPACE_PATH } from "@/lib/founderAdmin";

/** Legacy URL — redirects to the main founder workspace. */
export default function FounderWorkspaceRedirectPage() {
  redirect(FOUNDER_ADMIN_WORKSPACE_PATH);
}

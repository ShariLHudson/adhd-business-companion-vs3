import { redirect } from "next/navigation";

import { companionAuthConfigured } from "@/lib/supabase/companionClient";

export default function Home() {
  if (companionAuthConfigured()) {
    redirect("/companion/login");
  }
  redirect("/companion");
}

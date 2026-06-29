import { redirect } from "next/navigation";

import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";

export default function Home() {
  redirect(isCompanionAuthBypassed() ? "/companion" : "/companion/login");
}

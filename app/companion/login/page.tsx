import { redirect } from "next/navigation";

import { CompanionSignInExperience } from "@/components/companion/CompanionSignInExperience";
import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";

/** Companion-first sign-in — warm, calm, relationship before workflow. */
export default function CompanionLoginPage() {
  if (isCompanionAuthBypassed()) {
    redirect("/companion");
  }

  return <CompanionSignInExperience />;
}

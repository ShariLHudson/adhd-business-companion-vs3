import { redirect } from "next/navigation";

import { CompanionSignInExperience } from "@/components/companion/CompanionSignInExperience";
import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";

/** Companion-first sign-in — warm, calm, relationship before workflow. */
export default async function CompanionLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ signedOut?: string }>;
}) {
  const params = await searchParams;
  const signedOut = params.signedOut === "1";

  if (isCompanionAuthBypassed() && !signedOut) {
    redirect("/companion");
  }

  return <CompanionSignInExperience />;
}

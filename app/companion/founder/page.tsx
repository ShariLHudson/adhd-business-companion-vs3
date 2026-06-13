import { redirect } from "next/navigation";

/** Founder workspace lives at /founder — not under /companion. */
export default function CompanionFounderRedirect() {
  redirect("/founder/login");
}

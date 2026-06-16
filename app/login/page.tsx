import { redirect } from "next/navigation";

/** Shorter entry URL — same sign-in page as /companion/login. */
export default function LoginAliasPage() {
  redirect("/companion/login");
}

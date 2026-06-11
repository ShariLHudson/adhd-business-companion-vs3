import { redirect } from "next/navigation";

export default function Home() {
  // The companion app lives at /companion. Send the home route there so
  // localhost:3000 opens straight into the app instead of the starter page.
  redirect("/companion");
}

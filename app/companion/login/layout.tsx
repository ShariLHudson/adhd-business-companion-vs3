import type { Metadata } from "next";

import { APP_DISPLAY_NAME } from "@/lib/appSite";

export const metadata: Metadata = {
  title: `${APP_DISPLAY_NAME} · Sign in`,
  description: `Sign in to your ${APP_DISPLAY_NAME}`,
};

export default function CompanionLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

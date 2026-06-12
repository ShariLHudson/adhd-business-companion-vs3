import type { ReactNode } from "react";

export default function BusinessEcosystemDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen antialiased text-[#2d2926]">{children}</div>
  );
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ADHD Business Ecosystem Dashboard",
  robots: "noindex, nofollow",
};

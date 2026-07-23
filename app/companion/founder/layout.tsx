import { CompanionAuthGate } from "@/components/companion/CompanionAuthGate";
import { FounderAccessGate } from "@/components/founderStudio/FounderAccessGate";
import { FounderShell } from "@/components/founderStudio/FounderShell";

import "./founder-studio.css";
import "./fire-executive-brief-reading.css";

export const metadata = {
  title: "Founder Studio",
  robots: { index: false, follow: false },
};

/** Isolated from member companion shell — private founder workspace only. */
export default function FounderStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CompanionAuthGate>
      <FounderAccessGate>
        <FounderShell>{children}</FounderShell>
      </FounderAccessGate>
    </CompanionAuthGate>
  );
}

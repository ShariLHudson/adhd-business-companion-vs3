import { CompanionAuthProvider } from "@/components/companion/CompanionAuthProvider";
import { CompanionLanguageProvider } from "@/components/companion/CompanionLanguageProvider";

import "./companion.css";

export const dynamic = "force-dynamic";

export default function CompanionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CompanionAuthProvider>
      <CompanionLanguageProvider>{children}</CompanionLanguageProvider>
    </CompanionAuthProvider>
  );
}

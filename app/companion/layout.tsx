import { CompanionAuthProvider } from "@/components/companion/CompanionAuthProvider";
import { CompanionLanguageProvider } from "@/components/companion/CompanionLanguageProvider";

import "./companion.css";

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

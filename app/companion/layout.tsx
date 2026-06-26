import { CompanionAuthProvider } from "@/components/companion/CompanionAuthProvider";
import { CompanionLanguageProvider } from "@/components/companion/CompanionLanguageProvider";
import { CompanionPhotoProvider } from "@/lib/companionPhotoProvider";
import { LiveEcosystemInit } from "@/components/companion/LiveEcosystemInit";
import "./companion.css";
import "./companion-object.css";
import "./plan-day-experience.css";

export const dynamic = "force-dynamic";

export default function CompanionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CompanionAuthProvider>
      <CompanionLanguageProvider>
        <CompanionPhotoProvider>
          <LiveEcosystemInit />
          {children}
        </CompanionPhotoProvider>
      </CompanionLanguageProvider>
    </CompanionAuthProvider>
  );
}

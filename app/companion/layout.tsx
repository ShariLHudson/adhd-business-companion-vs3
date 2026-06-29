import { CompanionAuthProvider } from "@/components/companion/CompanionAuthProvider";
import { CompanionLanguageProvider } from "@/components/companion/CompanionLanguageProvider";
import { CompanionPhotoProvider } from "@/lib/companionPhotoProvider";
import { LiveEcosystemInit } from "@/components/companion/LiveEcosystemInit";
import { RoomBackgroundWarmup } from "@/components/companion/RoomBackgroundWarmup";
import { HomesteadSceneProvider } from "@/lib/homesteadScene";
import { resolveCompanionSupabaseEnv } from "@/lib/supabase/resolveCompanionSupabaseEnv";
import { isBrowserSafeSupabaseKey } from "@/lib/supabase/supabaseKeyRoles";
import "./cinematic-background.css";
import "./companion.css";
import "./companion-login-transition.css";
import "./gallery.css";
import "./companion-object.css";
import "./signature-icons.css";
import "./homestead-scene-shared.css";
import "./homestead-signpost-sidebar.css";
import "./homestead-room-motion.css";
import "./peaceful-places-refined.css";
import "./peaceful-places-garden-banners.css";
import "./peaceful-places-garden-dropdown.css";
import "./focus-my-brain-sanctuary.css";
import "./companion-floating-card.css";
import "./companion-desk.css";
import "./companion-chat.css";
import "./plan-day-experience.css";

export const dynamic = "force-dynamic";

function companionAuthBootstrapScript(): string | null {
  const { url, key } = resolveCompanionSupabaseEnv();
  if (!url || !key || !isBrowserSafeSupabaseKey(key)) return null;
  if (!url.includes(".supabase.co")) return null;
  const payload = JSON.stringify({ url: url.replace(/\/$/, ""), key });
  return `window.__COMPANION_SUPABASE__=${payload};`;
}

export default function CompanionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authBootstrap = companionAuthBootstrapScript();

  return (
    <HomesteadSceneProvider>
      {authBootstrap ? (
        <script
          id="companion-auth-bootstrap"
          dangerouslySetInnerHTML={{ __html: authBootstrap }}
        />
      ) : null}
      <CompanionAuthProvider>
        <CompanionLanguageProvider>
          <CompanionPhotoProvider>
            <LiveEcosystemInit />
            <RoomBackgroundWarmup />
            {children}
          </CompanionPhotoProvider>
        </CompanionLanguageProvider>
      </CompanionAuthProvider>
    </HomesteadSceneProvider>
  );
}

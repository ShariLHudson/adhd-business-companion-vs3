import { CompanionAuthProvider } from "@/components/companion/CompanionAuthProvider";
import { CompanionLanguageProvider } from "@/components/companion/CompanionLanguageProvider";
import { CompanionPhotoProvider } from "@/lib/companionPhotoProvider";
import { LiveEcosystemInit } from "@/components/companion/LiveEcosystemInit";
import { RoomBackgroundWarmup } from "@/components/companion/RoomBackgroundWarmup";
import { EstateSceneTransitionHost } from "@/components/companion/estate/EstateSceneTransitionHost";
import { HomesteadSceneProvider } from "@/lib/homesteadScene";
import { resolveCompanionSupabaseEnv } from "@/lib/supabase/resolveCompanionSupabaseEnv";
import { isBrowserSafeSupabaseKey } from "@/lib/supabase/supabaseKeyRoles";
import "./cinematic-background.css";
import "./estate-light-flicker.css";
import "./destination-gallery-crystals.css";
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
import "./peaceful-places-garden-cards.css";
import "./focus-my-brain-sanctuary.css";
import "./companion-floating-card.css";
import "./companion-desk.css";
import "./companion-chat.css";
import "./spark-thinking-flame.css";
import "./shari-presence-flame.css";
import "./plan-day-experience.css";
import "./reminders-rhythms-scroll.css";
import "./growth-story-hub.css";
import "./welcome-home-first-launch.css";
import "./global-daily-companion-opening.css";
import "./momentum-builder-room.css";
import "./momentum-institute-drawer-wall.css";
import "./stables-room.css";
import "./cartographers-studio.css";
import "./estate-immersive.css";
import "./estate-room-fullbleed.css";
import "./estate-scene-transition.css";
import "./estate-arrival.css";
import "./ocean-conservatory-aquarium.css";
import "./estate-room-frosted-chat.css";
import "./estate-audio-settings.css";
import "./estate-room-invitation.css";
import "./estate-room-template.css";
import "./estate-room-experience-menu.css";
import "./experience-controls-overlay.css";
import "./estate-top-right-chrome.css";
import "./just-be-here.css";
import "./breathe-destination.css";
import "./estate-presence.css";
import "./global-estate-menu.css";
import "./spark-estate-guide.css";
import "./spark-note.css";
import "./companion-chat-surface.css";
import "./companion-layout-layers.css";
import "./universal-blueprint-interface.css";
import "./blueprint-experience.css";

export const dynamic = "force-dynamic";

function companionInlineAuthConfig(): { url: string; anonKey: string } | null {
  const { url, key } = resolveCompanionSupabaseEnv();
  if (!url || !key || !isBrowserSafeSupabaseKey(key)) return null;
  if (!url.includes(".supabase.co")) return null;
  return { url: url.replace(/\/$/, ""), anonKey: key };
}

export default function CompanionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const inlineAuth = companionInlineAuthConfig();

  return (
    <HomesteadSceneProvider>
      {inlineAuth ? (
        <script
          id="companion-auth-bootstrap"
          dangerouslySetInnerHTML={{
            __html: `window.__COMPANION_SUPABASE__=${JSON.stringify({
              url: inlineAuth.url,
              key: inlineAuth.anonKey,
            })};`,
          }}
        />
      ) : null}
      <CompanionAuthProvider inlineSupabase={inlineAuth}>
        <CompanionLanguageProvider>
          <CompanionPhotoProvider>
            <LiveEcosystemInit />
            <RoomBackgroundWarmup />
            <EstateSceneTransitionHost />
            {children}
          </CompanionPhotoProvider>
        </CompanionLanguageProvider>
      </CompanionAuthProvider>
    </HomesteadSceneProvider>
  );
}

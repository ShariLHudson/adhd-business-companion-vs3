"use client";

import type { RefObject } from "react";

import { CompanionCommunicationAnchor } from "@/components/companion/CompanionCommunicationAnchor";
import { ArtifactActionBar } from "@/components/companion/ArtifactActionBar";
import { CreateBuilderActionBar } from "@/components/companion/CreateBuilderActionBar";
import { EstateWorkspaceOfferCard } from "@/components/companion/EstateWorkspaceOfferCard";
import { PendingActionBar } from "@/components/companion/PendingActionBar";
import type { ArtifactExportAction } from "@/lib/artifactType";
import { getVoiceStatus } from "@/lib/companionStore";
import type {
  CreateBuilderAction,
  CreateBuilderSession,
} from "@/lib/createBuilderChat";
import { createBuilderActionsForPhase } from "@/lib/createBuilderChat";
import {
  pendingActionLabel,
  pendingActionLine,
  pendingActionObjectId,
  type PendingAction,
} from "@/lib/pendingAction";

type Props = {
  homeCalm: boolean;
  homeChatPlaceholder?: string;
  conversationMode: boolean;
  input: string;
  isLoading: boolean;
  isListening: boolean;
  speechSupported: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleListening: () => void;
  onSend: (overrideText?: string) => void;
  pendingAction: PendingAction | null;
  suppressInterventionCards: boolean;
  onRunArtifactExport: (action: ArtifactExportAction) => void;
  onClearPendingOffers: () => void;
  onDismissOfferKeepTalking: () => void;
  onExecutePendingAction: (action: PendingAction) => void;
  onShowEstateMap?: () => void;
  splitCreateBuilder: boolean;
  createBuilderSession: CreateBuilderSession | null;
  onCreateBuilderAction: (action: CreateBuilderAction) => void;
  voiceOutput: boolean;
  voiceBlocked: boolean;
  onToggleVoiceOutput: () => void;
  onVoiceBlockedReset: () => void;
  ttsAudioRef: RefObject<HTMLAudioElement | null>;
  /** Welcome Home — no footer gradient slab; softer voice hint copy. */
  welcomeHome?: boolean;
  /** Extra classes (e.g. quieter input under Today's Welcome Card). */
  className?: string;
};

/** Home chat on static homestead — floating input footer, not Companion Desk. */
export function HomeChatInputFooter({
  homeCalm,
  homeChatPlaceholder,
  conversationMode,
  input,
  isLoading,
  isListening,
  speechSupported,
  inputRef,
  onInputChange,
  onKeyDown,
  onToggleListening,
  onSend,
  pendingAction,
  suppressInterventionCards,
  onRunArtifactExport,
  onClearPendingOffers,
  onDismissOfferKeepTalking,
  onExecutePendingAction,
  onShowEstateMap,
  splitCreateBuilder,
  createBuilderSession,
  onCreateBuilderAction,
  voiceOutput,
  voiceBlocked,
  onToggleVoiceOutput,
  onVoiceBlockedReset,
  ttsAudioRef,
  welcomeHome = false,
  className,
}: Props) {
  return (
    <footer
      className={`companion-home-input-footer input-footer companion-fade-in shrink-0 ${
        welcomeHome ? "" : "px-4 pb-4 pt-2 sm:px-6"
      }${className ? ` ${className}` : ""}`}
    >
      {welcomeHome &&
      pendingAction?.kind === "workspace" &&
      !isLoading &&
      !homeCalm ? (
        <EstateWorkspaceOfferCard
          offer={pendingAction.offer}
          onAccept={() => onExecutePendingAction(pendingAction)}
          onStayHere={() => {
            onClearPendingOffers();
            onDismissOfferKeepTalking();
          }}
          onShowMap={() => {
            onClearPendingOffers();
            onShowEstateMap?.();
          }}
        />
      ) : pendingAction && !suppressInterventionCards && !isLoading && !homeCalm ? (
        pendingAction.kind === "artifact-export" ? (
          <ArtifactActionBar
            artifactType={pendingAction.offer.artifactType}
            line={pendingAction.offer.line}
            actions={pendingAction.offer.actions}
            onAction={onRunArtifactExport}
            onDismiss={() => {
              onClearPendingOffers();
              onDismissOfferKeepTalking();
            }}
          />
        ) : (
          <PendingActionBar
            objectId={pendingActionObjectId(pendingAction)}
            label={pendingActionLabel(pendingAction)}
            line={pendingActionLine(pendingAction)}
            onOpen={() => onExecutePendingAction(pendingAction)}
            onDismiss={() => {
              onClearPendingOffers();
              onDismissOfferKeepTalking();
            }}
          />
        )
      ) : null}
      {splitCreateBuilder &&
      createBuilderActionsForPhase(createBuilderSession)?.length ? (
        <CreateBuilderActionBar
          actions={createBuilderActionsForPhase(createBuilderSession)!}
          onAction={onCreateBuilderAction}
          disabled={isLoading}
        />
      ) : null}
      <CompanionCommunicationAnchor
        variant="living-room"
        mode="full"
        input={input}
        isLoading={isLoading}
        isListening={isListening}
        speechSupported={speechSupported}
        inputRef={inputRef}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        onToggleListening={onToggleListening}
        onSend={onSend}
        conversationMode={conversationMode}
        placeholder={homeCalm ? homeChatPlaceholder : undefined}
      />
      {!homeCalm ? (
        <div className="mt-2 flex flex-col items-center gap-1">
          <div className="flex items-center justify-center gap-3">
            {(() => {
              const vs = getVoiceStatus();
              if (!vs.hasVoice) {
                return (
                  <span
                    title="Enable voice conversations in Settings"
                    className={`companion-chat-voice-hint text-xs ${
                      welcomeHome
                        ? "text-[#6b635a]"
                        : "rounded-full bg-white/70 px-3 py-1"
                    }`}
                  >
                    <span aria-hidden="true">✦ </span>
                    Voice conversations available in Settings
                  </span>
                );
              }
              return (
                <button
                  type="button"
                  onClick={() => {
                    if (voiceOutput) ttsAudioRef.current?.pause();
                    onVoiceBlockedReset();
                    onToggleVoiceOutput();
                  }}
                  title="Shari reads her replies aloud"
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    voiceOutput
                      ? "bg-[#1e4f4f] text-white"
                      : "bg-white/70 text-[#6b635a] hover:bg-white"
                  }`}
                >
                  {voiceOutput ? "🔊 Voice on" : "🔈 Voice off"} ·{" "}
                  {Math.ceil(vs.leftMin)}m left
                </button>
              );
            })()}
          </div>
          {voiceBlocked ? (
            <p className="text-xs font-semibold text-[#a85c4a]">
              You&apos;re out of voice minutes this month — upgrade for more.
            </p>
          ) : null}
        </div>
      ) : null}
    </footer>
  );
}

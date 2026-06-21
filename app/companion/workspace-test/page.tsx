"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChatInputBar } from "@/components/companion/ChatInputBar";
import { SimpleChat } from "@/components/companion/SimpleChat";
import { WorkspaceLayout } from "@/components/companion/WorkspaceLayout";
import {
  ContentGeneratorPanel,
  type GenSeed,
} from "@/components/companion/ContentGeneratorPanel";
import { ProjectsPanel } from "@/components/companion/ProjectsPanel";
import type { AppSection } from "@/lib/companionUi";
import {
  detectDoingIntent,
  supportsWorkspace,
  workspaceTitle,
  type WorkspaceOffer,
} from "@/lib/workspaceMode";
import "../companion.css";

type Message = { role: "user" | "assistant"; content: string };

export default function WorkspaceTestPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Workspace Mode test — chat stays on the left, your work opens on the right. Try typing “help me write a post” or use the buttons below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [workspaceSection, setWorkspaceSection] = useState<AppSection | null>(
    null,
  );
  const [workspaceOffer, setWorkspaceOffer] = useState<WorkspaceOffer | null>(
    null,
  );
  const [genSeed, setGenSeed] = useState<GenSeed>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function openWorkspace(section: AppSection) {
    if (!supportsWorkspace(section)) return;
    setWorkspaceSection(section);
    setWorkspaceOffer(null);
  }

  function closeWorkspace() {
    setWorkspaceSection(null);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Workspace closed — we're back to chat only. I'm still here.",
      },
    ]);
  }

  function acceptOffer(offer: WorkspaceOffer) {
    if (offer.section === "content-generator") setGenSeed(null);
    openWorkspace(offer.section);
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const offer = detectDoingIntent(trimmed);
    const assistantContent = offer
      ? offer.line
      : "Got it — I'm listening. Use the test buttons or describe something you want to build.";

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: assistantContent },
    ]);
    setWorkspaceOffer(offer);
    setInput("");
  }

  function renderWorkspace() {
    if (!workspaceSection) return null;
    switch (workspaceSection) {
      case "content-generator":
        return (
          <ContentGeneratorPanel
            seed={genSeed}
            onOpen={() => {}}
            onWin={() => {}}
          />
        );
      case "projects":
        return <ProjectsPanel onOpen={() => {}} />;
      default:
        return (
          <p className="p-6 text-base text-[#6b635a]">
            Panel for <strong>{workspaceTitle(workspaceSection)}</strong> not
            wired in this test route yet.
          </p>
        );
    }
  }

  const chat = (
    <div className="flex h-full min-h-0 flex-col bg-[#f4efe7]/80">
      <header className="shrink-0 border-b border-[#1e4f4f]/10 bg-white/70 px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#1e4f4f]">
            Workspace Mode — isolated test
          </p>
          <Link
            href="/companion"
            className="text-sm font-medium text-[#6b635a] underline hover:text-[#1e4f4f]"
          >
            ← Main app
          </Link>
        </div>
        <p className="mt-1 text-xs text-[#9a8f82]">
          Chat left · work right · mobile tabs · no changes to /companion
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <SimpleChat
          messages={messages}
          stateHint={null}
          showHint={false}
          hideEmptyState
          isLoading={false}
        />
        {workspaceOffer && !workspaceSection && (
          <div className="mx-auto mt-3 w-full max-w-xl">
            <button
              type="button"
              onClick={() => acceptOffer(workspaceOffer)}
              className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163a3a]"
            >
              {workspaceOffer.buttonLabel} →
            </button>
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-[#1e4f4f]/10 px-4 py-3">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setGenSeed(null);
                openWorkspace("content-generator");
              }}
              className="rounded-full border border-[#1e4f4f]/30 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-white"
            >
              Open Create &amp; Keep Chatting
            </button>
            <button
              type="button"
              onClick={() => openWorkspace("projects")}
              className="rounded-full border border-[#1e4f4f]/30 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-white"
            >
              Open Project &amp; Keep Chatting
            </button>
          </div>
          <ChatInputBar
            input={input}
            isLoading={false}
            isListening={false}
            speechSupported={false}
            inputRef={inputRef}
            onInputChange={setInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onToggleListening={() => {}}
            onSend={handleSend}
          />
        </div>
      </footer>
    </div>
  );

  return (
    <div className="h-dvh bg-[#f4efe7] text-[#2d2926]">
      <WorkspaceLayout
        chat={chat}
        workspace={workspaceSection ? renderWorkspace() : null}
        workspaceTitle={
          workspaceSection ? workspaceTitle(workspaceSection) : "Create"
        }
        onClose={closeWorkspace}
      />
    </div>
  );
}

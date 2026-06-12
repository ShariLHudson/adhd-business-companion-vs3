"use client";

import { INPUT_PLACEHOLDER } from "@/lib/companionUi";

type ChatInputBarProps = {
  input: string;
  isLoading: boolean;
  isListening: boolean;
  speechSupported: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleListening: () => void;
  onSend: () => void;
};

export function ChatInputBar({
  input,
  isLoading,
  isListening,
  speechSupported,
  inputRef,
  onInputChange,
  onKeyDown,
  onToggleListening,
  onSend,
}: ChatInputBarProps) {
  return (
    <div className="input-glass flex items-end gap-2 rounded-[2rem] p-2 sm:gap-3 sm:p-2.5">
      <button
        type="button"
        onClick={onToggleListening}
        disabled={!speechSupported || isLoading}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        aria-pressed={isListening}
        title={
          speechSupported ? "Voice input" : "Voice not supported in this browser"
        }
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
          isListening
            ? "mic-active bg-[#1e4f4f] text-white shadow-lg"
            : "bg-[#f5f0e8] text-[#1e4f4f] hover:bg-[#eef5f5]"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
        </svg>
      </button>

      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={INPUT_PLACEHOLDER}
        rows={1}
        disabled={isLoading}
        className="max-h-32 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-3 text-lg leading-relaxed text-[#1f1c19] placeholder:text-[#6b635a] focus:outline-none disabled:opacity-50"
      />

      <button
        type="button"
        onClick={onSend}
        disabled={!input.trim() || isLoading}
        className="send-soft flex h-12 shrink-0 items-center justify-center rounded-full px-6 text-base font-medium text-white transition-all disabled:cursor-not-allowed disabled:bg-[#9aaba8] disabled:shadow-none"
      >
        Send
      </button>
    </div>
  );
}

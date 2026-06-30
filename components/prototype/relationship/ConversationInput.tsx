"use client";

type ConversationInputProps = {
  visible: boolean;
  placeholder: string;
  onSend: (text: string) => void;
};

export function ConversationInput({
  visible,
  placeholder,
  onSend,
}: ConversationInputProps) {
  if (!visible) return null;

  return (
    <form
      className="rel-input"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const field = form.elements.namedItem("message") as HTMLInputElement;
        const value = field.value.trim();
        if (!value) return;
        onSend(value);
        field.value = "";
      }}
    >
      <input
        type="text"
        name="message"
        className="rel-input__field"
        placeholder={placeholder}
        aria-label="Your response"
      />
      <button type="submit" className="rel-input__send" aria-label="Send">
        →
      </button>
    </form>
  );
}

import type { FlameMorningMessage } from "@/lib/founder/flame/types";

type FlameMorningMessageProps = {
  message: FlameMorningMessage;
};

export function FlameMorningMessage({ message }: FlameMorningMessageProps) {
  return (
    <section className="founder-flame-morning" aria-labelledby="flame-morning-heading">
      <p className="founder-flame-morning__eyebrow" id="flame-morning-heading">
        FLAME
      </p>
      <p className="founder-flame-morning__text">{message.text}</p>
    </section>
  );
}

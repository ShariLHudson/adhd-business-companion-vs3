import Link from "next/link";

import type { ExecutiveConciergeMessage } from "@/lib/founder/concierge/types";

type ConciergeCardProps = {
  message: ExecutiveConciergeMessage;
};

export function ConciergeCard({ message }: ConciergeCardProps) {
  return (
    <section className="founder-concierge-card" aria-labelledby="concierge-card-heading">
      <p className="founder-concierge-card__eyebrow" id="concierge-card-heading">
        Executive Concierge
      </p>
      <p className="founder-concierge-card__message">{message.text}</p>
      {message.href && message.hrefLabel ? (
        <Link href={message.href} className="founder-concierge-card__action">
          {message.hrefLabel}
        </Link>
      ) : null}
    </section>
  );
}

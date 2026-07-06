import Link from "next/link";

type RoomHeaderProps = {
  backHref: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  question?: string;
  purpose?: string;
};

export function RoomHeader({
  backHref,
  backLabel = "← Back to Founder Studio",
  eyebrow = "Founder Studio™",
  title,
  question,
  purpose,
}: RoomHeaderProps) {
  return (
    <header className="founder-room-page__hero">
      <Link href={backHref} className="founder-room-page__back">
        {backLabel}
      </Link>
      <p className="founder-room-page__eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {question ? (
        <p className="founder-room-page__question">{question}</p>
      ) : null}
      {purpose ? (
        <p className="founder-room-page__purpose">{purpose}</p>
      ) : null}
    </header>
  );
}

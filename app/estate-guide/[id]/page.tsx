import Link from "next/link";
import { notFound } from "next/navigation";
import { EstateGuideRoomPage } from "@/components/estate-guide";
import {
  getEstateGuideSpread,
  listEstateGuideSpreadIds,
} from "@/data/estateGuideSpreads";
import "../estate-guide-preview.css";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return listEstateGuideSpreadIds().map((id) => ({ id }));
}

export default async function EstateGuideSpreadPage({ params }: Props) {
  const { id } = await params;
  const spread = getEstateGuideSpread(id);
  if (!spread) notFound();

  return (
    <main className="eg-guide-preview">
      <header className="eg-guide-preview__toolbar">
        <div>
          <p className="eg-guide-preview__eyebrow">Spark Estate Guide</p>
          <p className="eg-guide-preview__title">{spread.title}</p>
        </div>
        <Link href="/companion" className="eg-guide-preview__back">
          Back to Companion
        </Link>
      </header>
      <div className="eg-guide-preview__pages">
        <EstateGuideRoomPage spread={spread} pageKind="photo" />
        <EstateGuideRoomPage spread={spread} pageKind="text" />
      </div>
    </main>
  );
}

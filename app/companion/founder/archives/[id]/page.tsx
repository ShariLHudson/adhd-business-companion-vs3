import { notFound } from "next/navigation";

import { FireExecutivePortfolioView } from "@/components/founderStudio/fire/FireExecutivePortfolioView";
import { getExecutiveArchive } from "@/lib/founder/briefs/firePortfolio";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";
import Link from "next/link";

type FounderArchiveRouteProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [
    { id: "fire-2026-07-04" },
    { id: "fire-2026-07-03" },
  ];
}

export default async function FounderArchiveRoute({
  params,
}: FounderArchiveRouteProps) {
  const { id } = await params;
  const portfolio = getExecutiveArchive(id);

  if (!portfolio) {
    notFound();
  }

  return (
    <div className="founder-archive-detail">
      <Link href={`${FOUNDER_STUDIO_BASE}/knowledge-library`} className="founder-room-page__back">
        ← Back to Executive Archives
      </Link>
      <FireExecutivePortfolioView portfolio={portfolio} variant="archive" />
    </div>
  );
}

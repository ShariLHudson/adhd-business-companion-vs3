import { BusinessEcosystemDashboard } from "@/components/ecosystem/BusinessEcosystemDashboard";

type PageProps = {
  searchParams: Promise<{ access?: string }>;
};

export default async function BusinessEcosystemDashboardPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  return <BusinessEcosystemDashboard accessToken={params.access} />;
}

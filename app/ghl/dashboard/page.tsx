import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ access?: string }>;
};

/** Legacy path — ADHD Business Ecosystem Dashboard lives at /ecosystem/dashboard */
export default async function LegacyGhlDashboardRedirect({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const query = params.access
    ? `?access=${encodeURIComponent(params.access)}`
    : "";
  redirect(`/ecosystem/dashboard${query}`);
}

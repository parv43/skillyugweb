import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SponsorRedirectPage({ params }: PageProps) {
  const { token } = await params;
  redirect(`/onboarding?token=${encodeURIComponent(token)}`);
}
export const runtime = "nodejs";

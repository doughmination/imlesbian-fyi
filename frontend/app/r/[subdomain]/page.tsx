import type { Metadata } from "next";
import { getSubdomainTarget } from "@/lib/subdomains";
import { RedirectCard } from "@/app/components/RedirectCard";
import { NotClaimed } from "@/app/components/NotClaimed";

type Params = Promise<{ subdomain: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { subdomain } = await params;
  return {
    title: `${subdomain}.imlesbian.fyi`,
  };
}

export default async function SubdomainRedirectPage({
  params,
}: {
  params: Params;
}) {
  const { subdomain } = await params;
  const target = await getSubdomainTarget(subdomain);

  if (!target || !target.active) {
    return <NotClaimed subdomain={subdomain} />;
  }

  return (
    <RedirectCard
      label={`${target.ownerDisplayName}.imlesbian.fyi`}
      destinationUrl={target.destinationUrl}
    />
  );
}

import { getCustomDomainTarget } from "@/lib/subdomains";
import { RedirectCard } from "@/app/components/RedirectCard";
import { NotClaimed } from "@/app/components/NotClaimed";

export default async function CustomDomainRedirectPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const target = await getCustomDomainTarget(domain);

  if (!target || !target.active) {
    return <NotClaimed subdomain={domain} isCustomDomain />;
  }

  return (
    <RedirectCard
      label={target.ownerDisplayName}
      destinationUrl={target.destinationUrl}
    />
  );
}

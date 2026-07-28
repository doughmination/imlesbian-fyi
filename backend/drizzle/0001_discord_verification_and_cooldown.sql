ALTER TABLE "users" ADD COLUMN "subdomain_claim_cooldown_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subdomains" ADD COLUMN "discord_verification_hash" text;

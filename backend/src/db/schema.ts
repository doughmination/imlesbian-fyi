import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  discordId: text("discord_id").notNull().unique(),
  discordUsername: text("discord_username").notNull(),
  discordAvatar: text("discord_avatar"),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subdomains = pgTable("subdomains", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // the claimed subdomain, e.g. "doughmination"
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  destinationUrl: text("destination_url").notNull(),
  active: boolean("active").notNull().default(true),
  visitCount: integer("visit_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const domainVerificationMethod = pgEnum("domain_verification_method", [
  "dns_txt",
  "https_file",
]);

export const customDomains = pgTable("custom_domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  domain: text("domain").notNull().unique(), // e.g. "links.example.com"
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  destinationUrl: text("destination_url").notNull(),
  verified: boolean("verified").notNull().default(false),
  verificationMethod: domainVerificationMethod("verification_method")
    .notNull()
    .default("dns_txt"),
  verificationToken: text("verification_token").notNull(),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const abuseReportStatus = pgEnum("abuse_report_status", [
  "open",
  "investigating",
  "resolved",
  "dismissed",
]);

export const abuseReports = pgTable("abuse_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportedSubdomain: text("reported_subdomain"), // nullable: could be a custom domain instead
  reportedCustomDomain: text("reported_custom_domain"),
  reason: text("reason").notNull(),
  evidence: text("evidence"),
  reporterContact: text("reporter_contact"),
  githubIssueId: integer("github_issue_id"),
  githubIssueUrl: text("github_issue_url"),
  status: abuseReportStatus("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(), // e.g. "subdomain.claim", "subdomain.delete"
  targetType: text("target_type"), // e.g. "subdomain", "custom_domain"
  targetId: text("target_id"),
  metadata: text("metadata"), // JSON-stringified extra context
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- relations (for query ergonomics, not required by the DB itself) ---

export const usersRelations = relations(users, ({ many }) => ({
  subdomains: many(subdomains),
  customDomains: many(customDomains),
}));

export const subdomainsRelations = relations(subdomains, ({ one }) => ({
  owner: one(users, {
    fields: [subdomains.ownerId],
    references: [users.id],
  }),
}));

export const customDomainsRelations = relations(customDomains, ({ one }) => ({
  owner: one(users, {
    fields: [customDomains.ownerId],
    references: [users.id],
  }),
}));

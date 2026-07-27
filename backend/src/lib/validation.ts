import { z } from "zod";

// Keep this in sync with RESERVED_SUBDOMAINS in the frontend's proxy.ts
export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "docs",
  "admin",
  "static",
  "cdn",
  "mail",
]);

export const subdomainNameSchema = z
  .string()
  .min(2, "Must be at least 2 characters")
  .max(63, "Must be 63 characters or fewer") // DNS label limit
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    "Only lowercase letters, numbers, and hyphens — can't start or end with a hyphen"
  )
  .refine((val) => !RESERVED_SUBDOMAINS.has(val), {
    message: "This subdomain is reserved",
  });

export const destinationUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (val) => {
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL must use http or https" }
  )
  .refine(
    (val) => {
      // Block obviously self-referential redirects (someone pointing a
      // subdomain at the platform itself) which could be used to build
      // confusing open-redirect chains.
      try {
        const url = new URL(val);
        return !url.hostname.endsWith("imlesbian.fyi");
      } catch {
        return false;
      }
    },
    { message: "Destination can't point back at imlesbian.fyi" }
  );

export const claimSubdomainSchema = z.object({
  name: subdomainNameSchema,
  destinationUrl: destinationUrlSchema,
});

export const updateSubdomainSchema = z.object({
  destinationUrl: destinationUrlSchema.optional(),
  active: z.boolean().optional(),
});

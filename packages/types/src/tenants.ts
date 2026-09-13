import { z } from "zod";

export const TenantStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]);
export type TenantStatus = z.infer<typeof TenantStatusEnum>;

export const TenantSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  status: TenantStatusEnum.default("ACTIVE"),
  settings: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const CreateTenantInputSchema = TenantSchema.omit({
  createdAt: true,
  updatedAt: true,
}).partial({
  status: true,
  settings: true,
});

export type CreateTenantInput = z.infer<typeof CreateTenantInputSchema>;

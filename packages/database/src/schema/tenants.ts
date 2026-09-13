import { jsonb, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const tenantStatusEnum = pgEnum("tenant_status", [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
]);

export const tenants = pgTable("tenants", {
  id: varchar("id", { length: 64 }).primaryKey(), // Default 'DIRECT_B2C'
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  status: tenantStatusEnum("status").default("ACTIVE").notNull(),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type TenantRecord = typeof tenants.$inferSelect;
export type NewTenantRecord = typeof tenants.$inferInsert;

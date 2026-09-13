import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const userRoleEnum = pgEnum("user_role", [
  "STUDENT",
  "SUPER_ADMIN",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 64 })
    .references(() => tenants.id, { onDelete: "cascade" })
    .default("DIRECT_B2C")
    .notNull(),
  role: userRoleEnum("role").default("STUDENT").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;

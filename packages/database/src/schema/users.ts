import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const userRoleEnum = pgEnum("user_role", [
  "STUDENT",
  "SUPER_ADMIN",
]);

export const targetUnitEnum = pgEnum("target_unit", [
  "ENGINEERING",
  "DU_KA",
  "MEDICAL",
  "GST",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 64 })
    .references(() => tenants.id, { onDelete: "cascade" })
    .default("DIRECT_B2C")
    .notNull(),
  role: userRoleEnum("role").default("STUDENT").notNull(),
  targetUnit: targetUnitEnum("target_unit").default("ENGINEERING").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  googleId: varchar("google_id", { length: 255 }).unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;

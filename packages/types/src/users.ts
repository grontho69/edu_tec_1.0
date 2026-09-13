import { z } from "zod";

export const UserRoleEnum = z.enum(["STUDENT", "SUPER_ADMIN"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const TargetUnitEnum = z.enum([
  "ENGINEERING",
  "DU_KA",
  "MEDICAL",
  "GST",
]);
export type TargetUnit = z.infer<typeof TargetUnitEnum>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().min(1).max(64).default("DIRECT_B2C"),
  role: UserRoleEnum.default("STUDENT"),
  targetUnit: TargetUnitEnum.default("ENGINEERING"),
  email: z.string().email(),
  googleId: z.string().nullable().optional(),
  fullName: z.string().min(1).max(255),
  avatarUrl: z.string().url().nullable().optional(),
  phone: z.string().max(32).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  tenantId: true,
  role: true,
  targetUnit: true,
  googleId: true,
  avatarUrl: true,
  phone: true,
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const UpdateUserInputSchema = CreateUserInputSchema.partial();
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

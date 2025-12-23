import { z, ZodType } from "zod";
import { SignupFormSchemaType } from "./types";

export const signupFormSchema = z
  .object({
    firstName: z.string({ error: "First name is required" }).min(1).regex(/^[a-z]+$/, { error: "First name must contain only letters" }),

    lastName: z.string({ error: "Last name is required" }).min(1).regex(/^[a-z]+$/, { error: "Last name must contain only letters" }),

    email: z.email({ error: "Please enter a valid email address" }),

    password: z
      .string({ error: "Password is required" })
      .min(8, { error: "At least 8 characters" })
      .regex(/[A-Z]/, { error: "One uppercase letter required" })
      .regex(/[0-9]/, { error: "One number required" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, { error: "One special character required" }),

    confirmPassword: z.string({ error: "Please confirm your password" }).min(1),

    terms: z.literal(true, {
      message: "You must accept the terms and conditions",
    }),

    newsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  }) satisfies ZodType<SignupFormSchemaType>;

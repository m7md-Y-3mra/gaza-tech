import { z, ZodType } from "zod";
import { LoginFormSchemaType } from "./types";

export const loginFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
}) satisfies ZodType<LoginFormSchemaType>;


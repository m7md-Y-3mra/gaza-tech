import { z, ZodType } from "zod";
import { OtpFormSchemaType } from "./types";

export const otpFormSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "Please enter all 6 digits" })
    .max(6, { message: "OTP must be 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only numbers" }),
}) satisfies ZodType<OtpFormSchemaType>;

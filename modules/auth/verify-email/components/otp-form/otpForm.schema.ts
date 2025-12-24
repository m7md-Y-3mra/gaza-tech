import { z, ZodType } from "zod";
import { OtpFormSchemaType, ResendOtpSchemaType, VerifyOtpSchemaType } from "./types";

export const verifyOtpSchema = z.object({
  email: z.email(),
  otp: z
    .string()
    .min(6, { message: "Please enter all 6 digits" })
    .max(6, { message: "OTP must be 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only numbers" }),
}) satisfies ZodType<VerifyOtpSchemaType>;


export const otpFormSchema = verifyOtpSchema.pick({
  otp: true,
}) satisfies ZodType<OtpFormSchemaType>;


export const resendOtpSchema = verifyOtpSchema.pick({
  email: true,
}) satisfies ZodType<ResendOtpSchemaType>; 

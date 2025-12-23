export type OtpFormProps = {
  email: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onResendSuccess?: () => void;
}

export type OtpFormSchemaType = {
  otp: string;
}

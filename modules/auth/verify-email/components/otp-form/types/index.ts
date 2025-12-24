export type OtpFormProps = {
  email: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onResendSuccess?: () => void;
};

export type OtpFormSchemaType = {
  otp: string;
};

export type VerifyOtpSchemaType = {
  email: string;
  otp: string;
};

export type ResendOtpSchemaType = {
  email: string;
}

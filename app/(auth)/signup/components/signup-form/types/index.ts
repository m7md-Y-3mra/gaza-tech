export type SignupFormSchemaType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: true;
  newsletter?: boolean | undefined;
}

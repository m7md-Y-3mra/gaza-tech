export type PasswordStrengthProps = {
  password: string;
};

export type PasswordRequirement = {
  id: string;
  label: string;
  regex: RegExp;
};

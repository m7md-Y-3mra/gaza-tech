import { PasswordRequirement } from './types';

export const passwordRequirements: PasswordRequirement[] = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'number', label: 'One number', regex: /[0-9]/ },
  {
    id: 'special',
    label: 'One special character',
    regex: /[!@#$%^&*(),.?":{}|<>]/,
  },
];

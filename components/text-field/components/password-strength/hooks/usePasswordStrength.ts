'use client';
import { useMemo } from 'react';
import { passwordRequirements } from '../passwordStrength.constant';

export const usePasswordStrength = (password: string) => {
  return useMemo(() => {
    const reqs = passwordRequirements.map((req) => ({
      id: req.id,
      label: req.label,
      met: req.regex.test(password),
    }));

    const metRequirements = reqs.filter((req) => req.met).length;
    const strength = Math.min(
      (metRequirements / passwordRequirements.length) * 100,
      100
    );

    let strengthLabel = '';
    let strengthColor = '';

    if (strength <= 25) {
      strengthLabel = 'Weak';
      strengthColor = 'bg-red-500 text-red-500';
    } else if (strength <= 50) {
      strengthLabel = 'Fair';
      strengthColor = 'bg-orange-500 text-orange-500';
    } else if (strength <= 75) {
      strengthLabel = 'Good';
      strengthColor = 'bg-yellow-500 text-yellow-500';
    } else {
      strengthLabel = 'Strong';
      strengthColor = 'bg-green-500 text-green-500';
    }

    return { strength, strengthLabel, strengthColor, requirements: reqs };
  }, [password]);
};

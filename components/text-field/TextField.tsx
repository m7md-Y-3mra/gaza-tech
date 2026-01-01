'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import PasswordStrength from './components/password-strength';

type TextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'name'
> & {
  name: string;
  label?: string;
  Icon?: React.ComponentType<{ className: string }>;
  isSuccess?: boolean;
  successMessage?: string;
  showStrength?: boolean;
};

const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  Icon,
  type = 'text',
  isSuccess,
  successMessage,
  showStrength,
  ...rest
}) => {
  const {
    register,
    formState: { errors, touchedFields, isSubmitted },
    watch,
  } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const error = errors[name];
  const touched = touchedFields[name];
  const hasError = (isSubmitted || touched) && !!error;
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const value = watch(name) || '';

  const getBorderClass = () => {
    if (hasError) return 'border-destructive focus-visible:ring-destructive';
    if (isSuccess) return 'border-green-500 focus-visible:ring-green-500';
    return 'focus-visible:ring-primary';
  };

  return (
    <div>
      {label && (
        <Label htmlFor={name} className="mb-2 block text-sm font-semibold">
          {label}
        </Label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon className="text-muted-foreground h-4 w-4" />
          </div>
        )}
        <Input
          id={name}
          type={inputType}
          aria-invalid={hasError || undefined}
          className={`${Icon ? 'pl-12' : ''} ${
            isPassword ? 'pr-12' : ''
          } h-12 border-2 ${getBorderClass()}`}
          {...register(name)}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4"
          >
            {showPassword ? (
              <EyeOff className="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors" />
            ) : (
              <Eye className="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors" />
            )}
          </button>
        )}
      </div>
      {isPassword && showStrength && <PasswordStrength password={value} />}
      {hasError && (!showStrength || !Boolean(value)) && (
        <p className="text-destructive mt-1.5 flex items-center gap-1 text-sm">
          <AlertCircle className="h-3.5 w-3.5" />
          {error?.message as string}
        </p>
      )}
      {isSuccess && successMessage && (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-green-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {successMessage}
        </p>
      )}
    </div>
  );
};

export default TextField;

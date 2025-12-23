"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useField } from "formik";
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import PasswordStrength from "./components/password-strength";

type TextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name"
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
  type = "text",
  isSuccess,
  successMessage,
  showStrength,
  ...rest
}) => {
  const [field, meta] = useField<string>(name);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = meta.touched && !!meta.error;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const getBorderClass = () => {
    if (hasError) return "border-destructive focus-visible:ring-destructive";
    if (isSuccess) return "border-green-500 focus-visible:ring-green-500";
    return "focus-visible:ring-primary";
  };

  return (
    <div>
      {label && (
        <Label htmlFor={name} className="text-sm font-semibold mb-2 block">
          {label}
        </Label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <Input
          id={name}
          type={inputType}
          aria-invalid={hasError || undefined}
          className={`${Icon ? "pl-12" : ""} ${
            isPassword ? "pr-12" : ""
          } h-12 border-2 ${getBorderClass()}`}
          {...field}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>
        )}
      </div>
      {isPassword && showStrength && (
        <PasswordStrength password={field.value} />
      )}
      {hasError && (!showStrength || !Boolean(field.value)) && (
        <p className="text-destructive text-sm mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {meta.error}
        </p>
      )}
      {isSuccess && successMessage && (
        <p className="text-green-600 text-sm mt-1.5 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {successMessage}
        </p>
      )}
    </div>
  );
};

export default TextField;

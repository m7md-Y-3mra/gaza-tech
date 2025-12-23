"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext, Controller } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

type CheckboxFieldProps = {
  name: string;
  children: ReactNode;
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({ name, children }) => {
  const {
    control,
    formState: { errors, isSubmitted, touchedFields },
  } = useFormContext();
  const error = errors[name];
  const hasError = (isSubmitted || touchedFields[name]) && !!error;

  return (
    <div>
      <div className="flex items-start space-x-3">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Checkbox
              id={name}
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              className="mt-0.5 border-2"
            />
          )}
        />
        <label
          htmlFor={name}
          className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
        >
          {children}
        </label>
      </div>
      {hasError && (
        <p className="text-destructive text-sm mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error?.message as string}
        </p>
      )}
    </div>
  );
};

export default CheckboxField;

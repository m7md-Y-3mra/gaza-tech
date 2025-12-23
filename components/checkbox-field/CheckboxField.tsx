"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { useField } from "formik";
import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

type CheckboxFieldProps = {
  name: string;
  children: ReactNode;
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({ name, children }) => {
  const [field, meta, helpers] = useField<boolean>(name);
  const hasError = meta.touched && !!meta.error;

  return (
    <div>
      <div className="flex items-start space-x-3">
        <Checkbox
          id={name}
          checked={field.value === true}
          onCheckedChange={(checked) => helpers.setValue(checked === true)}
          className="mt-0.5 border-2"
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
          {meta.error}
        </p>
      )}
    </div>
  );
};

export default CheckboxField;

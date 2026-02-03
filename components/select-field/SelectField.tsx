'use client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext, Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { SelectFieldProps } from './types';

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  placeholder = 'Select an option',
  options,
  Icon,
  isSuccess,
  successMessage,
  disabled = false,
}) => {
  const {
    control,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const error = errors[name];
  const touched = touchedFields[name];
  const hasError = (isSubmitted || touched) && !!error;

  const getBorderClass = () => {
    if (hasError) return 'border-destructive focus:ring-destructive';
    if (isSuccess) return 'border-green-500 focus:ring-green-500';
    return 'focus:ring-primary';
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
          <div className="pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center ps-4">
            <Icon className="text-muted-foreground h-4 w-4" />
          </div>
        )}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
            >
              <SelectTrigger
                id={name}
                className={`${Icon ? 'ps-12' : ''} h-12 border-2 ${getBorderClass()}`}
                aria-invalid={hasError || undefined}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {hasError && (
        <div className="text-destructive mt-2 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error?.message as string}</span>
        </div>
      )}

      {isSuccess && successMessage && !hasError && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default SelectField;

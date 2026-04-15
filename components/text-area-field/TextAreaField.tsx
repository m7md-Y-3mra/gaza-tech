'use client';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFormContext, get } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

type TextAreaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
  label?: string;
  maxLength?: number;
};

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  name,
  label,
  maxLength,
  ...rest
}) => {
  const {
    register,
    formState: { errors, touchedFields, isSubmitted },
    watch,
  } = useFormContext();

  const error = get(errors, name);
  const touched = get(touchedFields, name);
  const hasError = (isSubmitted || touched) && !!error;

  const value = watch(name) || '';
  const currentLength = value.length;

  const getBorderClass = () => {
    if (hasError) return 'border-destructive focus-visible:ring-destructive';
    return 'focus-visible:ring-primary border-2';
  };

  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor={name} className="block text-sm font-semibold">
            {label}
          </Label>
          {maxLength && (
            <span
              className={`text-xs ${currentLength > maxLength ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <Textarea
          id={name}
          aria-invalid={hasError || undefined}
          className={`min-h-[120px] resize-y ${getBorderClass()}`}
          {...register(name)}
          {...rest}
        />
      </div>
      {hasError && (
        <p className="text-destructive mt-1.5 flex items-center gap-1 text-sm">
          <AlertCircle className="h-3.5 w-3.5" />
          {error?.message as string}
        </p>
      )}
    </div>
  );
};

export default TextAreaField;

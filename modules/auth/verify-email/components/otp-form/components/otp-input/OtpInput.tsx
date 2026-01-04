import { FC } from 'react';
import { OtpInputProps } from './types';
import { useOtpInput } from './hooks/useOtpInput';
import { cn } from '@/lib/utils';

const OtpInput: FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  length = 6,
}) => {
  const {
    digits,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleFocus,
  } = useOtpInput({ value, onChange, onComplete, length });

  return (
    <div className="flex justify-between gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={cn(
            'bg-background text-foreground h-16 w-14 rounded-xl border-2 text-center text-2xl font-bold',
            'focus:border-primary focus:ring-primary/20 focus:ring-4 focus:outline-none',
            'transition-all duration-200',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : digit
                ? 'border-primary bg-primary/10'
                : 'border-border'
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;

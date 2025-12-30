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
            'h-16 w-14 rounded-xl border-2 text-center text-2xl font-bold',
            'focus:border-primary focus:ring-4 focus:ring-green-100 focus:outline-none',
            'transition-all duration-200',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : digit
                ? 'border-primary bg-green-50'
                : 'border-gray-300'
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;

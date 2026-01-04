import { FC } from 'react';
import { CountdownTimerProps } from './types';
import { useCountDownTimer } from './hooks/useCountDownTimer';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const CountDownTimer: FC<CountdownTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  onExpire,
}) => {
  const {
    radius,
    circumference,
    strokeDashoffset,
    timeDisplay,
    isExpired,
    isWarning,
    isLow,
    getColor,
  } = useCountDownTimer({
    remainingSeconds,
    totalSeconds,
    onExpire,
  });
  return (
    <div className="bg-success border-success-foreground/20 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-background flex h-10 w-10 items-center justify-center rounded-lg shadow-sm">
            <Clock className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Code expires in
            </p>
            <p
              className={cn(
                'text-lg font-bold',
                isExpired || isWarning
                  ? 'text-red-500'
                  : isLow
                    ? 'text-amber-500'
                    : 'text-primary'
              )}
            >
              {isExpired ? 'Expired' : timeDisplay}
            </p>
          </div>
        </div>
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90 transform">
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-circle-track"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={getColor()}
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CountDownTimer;

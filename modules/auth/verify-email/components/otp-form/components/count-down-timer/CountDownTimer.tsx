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
    <div className="bg-success rounded-xl p-4 border border-success-foreground/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Code expires in</p>
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

import { FC } from "react";
import { CountdownTimerProps } from "./types";
import { useCountDownTimer } from "./hooks/useCountDownTimer";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Code expires in</p>
            <p
              className={cn(
                "text-lg font-bold",
                isExpired || isWarning
                  ? "text-red-500"
                  : isLow
                  ? "text-amber-500"
                  : "text-primary"
              )}
            >
              {isExpired ? "Expired" : timeDisplay}
            </p>
          </div>
        </div>
        <div className="relative w-16 h-16">
          <svg className="transform -rotate-90 w-16 h-16">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#E5E7EB"
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

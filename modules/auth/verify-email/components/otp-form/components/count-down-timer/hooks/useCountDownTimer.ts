'use client';
import { useEffect } from 'react';
import { CountdownTimerProps } from '../types';

export const useCountDownTimer = ({
  remainingSeconds,
  totalSeconds,
  onExpire,
}: CountdownTimerProps) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = remainingSeconds / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isExpired = remainingSeconds <= 0;
  const isWarning = remainingSeconds <= 60 && remainingSeconds > 0;
  const isLow = remainingSeconds <= 300 && remainingSeconds > 60;

  useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  const getColor = () => {
    if (isExpired || isWarning) return '#EF4444'; // red
    if (isLow) return '#F59E0B'; // yellow/amber
    return '#10B981'; // green (primary)
  };

  return {
    radius,
    circumference,
    strokeDashoffset,
    timeDisplay,
    isExpired,
    isWarning,
    isLow,
    getColor,
  };
};

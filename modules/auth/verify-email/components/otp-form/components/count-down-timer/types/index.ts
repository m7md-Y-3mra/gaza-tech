export type CountdownTimerProps = {
  totalSeconds: number;
  remainingSeconds: number;
  onExpire?: () => void;
};

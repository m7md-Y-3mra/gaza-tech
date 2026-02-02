import { formatDistanceToNow } from 'date-fns';
import { UseLocationInfoProps } from '../types';

export const useLocationInfo = ({ createdAt }: UseLocationInfoProps) => {
  const getRelativeTime = () => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  return {
    relativeTime: getRelativeTime(),
  };
};

import { REPORT_REASONS } from '../../types';

export const REASON_OPTIONS = REPORT_REASONS.map((reason) => ({
  value: reason,
  labelKey: `reasons.${reason}`,
}));

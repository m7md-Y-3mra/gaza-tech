import type { SpecificationItemProps } from './types';
import { getSpecIcon } from './constants';

const SpecificationItem = ({
  label,
  value,
  isCustom,
}: SpecificationItemProps) => {
  const Icon = getSpecIcon(label, isCustom);

  return (
    <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
      <Icon className="text-primary mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default SpecificationItem;

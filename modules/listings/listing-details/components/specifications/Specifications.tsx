import type { SpecificationsProps } from './types';
import SpecificationItem from './components/specification-item';
import { FC } from 'react';

const Specifications: FC<SpecificationsProps> = ({ specifications }) => {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      {/* Section Title */}
      <h2 className="text-xl font-semibold">Technical Specifications</h2>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {specifications.map((spec, index) => (
          <SpecificationItem
            key={index}
            label={spec.label}
            value={spec.value}
            isCustom={spec.isCustom}
          />
        ))}
      </div>
    </div>
  );
};

export default Specifications;

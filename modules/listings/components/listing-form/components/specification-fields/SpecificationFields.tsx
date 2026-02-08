'use client';
import TextField from '@/components/text-field';
import { Label } from '@/components/ui/label';
import { specifications as specificationLabels } from '@/modules/listings/types';
import type { SpecificationFieldsProps } from './types';
import { specificationPlaceholders } from './constant';

/**
 * Specification fields component
 * Renders all specification inputs for listing form
 */
const SpecificationFields: React.FC<SpecificationFieldsProps> = ({
  disabled = false,
}) => {
  return (
    <div>
      <Label className="mb-4 block text-sm font-semibold">
        Product Specifications
      </Label>
      <p className="text-muted-foreground mb-4 text-sm">
        Fill in the relevant specifications for your product. These help buyers
        make informed decisions.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(specificationLabels).map(([key, value]) => (
          <TextField
            key={value}
            name={`specifications.${value}`}
            label={specificationLabels[key as keyof typeof specificationLabels]}
            placeholder={
              specificationPlaceholders[key as keyof typeof specificationLabels]
            }
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default SpecificationFields;

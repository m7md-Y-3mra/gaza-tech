'use client';
import TextField from '@/components/text-field';
import { Label } from '@/components/ui/label';
import { specifications as specificationLabels } from '@/modules/listings/types';
import type { SpecificationFieldsProps } from './types';
import { specificationPlaceholders } from './constant';
import { useFieldArray, useFormContext } from 'react-hook-form';

/**
 * Specification fields component
 * Renders all specification inputs for listing form
 * Uses useFieldArray to maintain the array shape {label, value, isCustom}[]
 */
const SpecificationFields: React.FC<SpecificationFieldsProps> = ({
  disabled = false,
}) => {
  const { control } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: 'specifications',
  });

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
        {fields.map((field, index) => {
          const specKey = (field as unknown as { label: string }).label;
          const displayLabel =
            specificationLabels[specKey as keyof typeof specificationLabels] ??
            specKey;

          return (
            <TextField
              key={field.id}
              name={`specifications.${index}.value`}
              label={displayLabel}
              placeholder={
                specificationPlaceholders[
                  specKey as keyof typeof specificationPlaceholders
                ] ?? ''
              }
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SpecificationFields;

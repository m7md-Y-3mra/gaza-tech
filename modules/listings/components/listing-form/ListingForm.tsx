'use client';
import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import TextField from '@/components/text-field';
import SelectField from '@/components/select-field';
import ImageUpload from '../image-upload';
import SpecificationFields from '../specification-fields';
import LivePreview from '../live-preview';
import { useListingForm } from './hooks/useListingForm';
import type { ListingFormProps } from './types';
import { currencyOptions, productConditionOptions } from './constant';

/**
 * Reusable listing form component
 * Supports both create and update modes
 */
const ListingForm: React.FC<ListingFormProps> = (props) => {
  const { mode, categories, locations, onSuccess, onCancel } = props;
  const listingId = mode === 'update' ? props.listingId : undefined;
  const { form, isSubmitting, submitError, onSubmit } = useListingForm(
    mode,
    listingId,
    onSuccess
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Form Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information Section */}
            <div className="border-border bg-card rounded-lg border-2 p-6">
              <h2 className="mb-4 text-xl font-bold">Basic Information</h2>
              <div className="space-y-4">
                <TextField
                  name="title"
                  label="Title"
                  placeholder="e.g., MacBook Pro 16-inch M2 Pro"
                  disabled={isSubmitting}
                />

                <TextField
                  name="description"
                  label="Description"
                  placeholder="Describe your product in detail..."
                  disabled={isSubmitting}
                  type="textarea"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-border bg-card rounded-lg border-2 p-6">
              <h2 className="mb-4 text-xl font-bold">Pricing</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  name="price"
                  label="Price"
                  placeholder="0"
                  type="number"
                  disabled={isSubmitting}
                />

                <SelectField
                  name="currency"
                  label="Currency"
                  options={currencyOptions}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Category & Location Section */}
            <div className="border-border bg-card rounded-lg border-2 p-6">
              <h2 className="mb-4 text-xl font-bold">Category & Location</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  name="category_id"
                  label="Category"
                  placeholder="Select a category"
                  options={categories}
                  disabled={isSubmitting}
                />

                <SelectField
                  name="location_id"
                  label="Location"
                  placeholder="Select a location"
                  options={locations}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Condition Section */}
            <div className="border-border bg-card rounded-lg border-2 p-6">
              <h2 className="mb-4 text-xl font-bold">Condition</h2>
              <SelectField
                name="product_condition"
                label="Product Condition"
                options={productConditionOptions}
                disabled={isSubmitting}
              />
            </div>

            {/* Images Section */}
            <div className="border-border bg-card rounded-lg border-2 p-6">
              <h2 className="mb-4 text-xl font-bold">Images</h2>
              <ImageUpload
                name="images"
                maxImages={5}
                maxSizeMB={5}
                disabled={isSubmitting}
              />
            </div>

            {/* Specifications Section */}
            <div className="border-border bg-card rounded-lg border-2 p-6">
              <h2 className="mb-4 text-xl font-bold">Specifications</h2>
              <SpecificationFields disabled={isSubmitting} />
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="border-destructive bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border-2 p-4">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{submitError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                    ? 'Create Listing'
                    : 'Update Listing'}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  size="lg"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-1">
            <LivePreview categories={categories} locations={locations} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ListingForm;

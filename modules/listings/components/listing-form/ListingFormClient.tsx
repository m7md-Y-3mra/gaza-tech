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
import type { ListingFormClientProps } from './types';
import { currencyOptions, productConditionOptions } from './constant';
import LoadingSubmittingSpinner from '@/components/loading-submitting-spinner';
import CategorySelectField from './components/category-select-field';

/**
 * Reusable listing form component
 * Supports both create and update modes
 */
const ListingFormClient: React.FC<ListingFormClientProps> = (props) => {
  const { mode, groupedCategories, locations } = props;
  const listingId = mode === 'update' ? props.listingId : undefined;
  const { form, isSubmitting, submitError, onSubmit, handleCancel, isPending } =
    useListingForm(mode, listingId);

  console.log(form.getValues());
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Form Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Images Section - FIRST */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  Product Images
                </h2>
                <p className="text-muted-foreground">
                  Upload up to 5 high-quality images. First image will be the
                  cover.
                </p>
              </div>

              <ImageUpload name="images" disabled={isSubmitting} />

              {/* Tips Box */}
              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-lightbulb mt-0.5 text-lg text-blue-600"></i>
                  <div>
                    <h4 className="mb-1 font-semibold text-blue-900">
                      Tips for Great Product Photos
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Use natural lighting or well-lit environments</li>
                      <li>• Show product from multiple angles</li>
                      <li>• Include close-ups of important details</li>
                      <li>• Use clean, uncluttered backgrounds</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  Basic Information
                </h2>
                <p className="text-muted-foreground">
                  Provide essential details about your product
                </p>
              </div>
              <div className="space-y-6">
                <TextField
                  name="title"
                  label="Product Title"
                  placeholder="e.g., Gaming Laptop ASUS ROG Strix G15 - RTX 3060"
                  disabled={isSubmitting}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <CategorySelectField
                    name="category_id"
                    label="Category"
                    placeholder="Select a category"
                    groupedCategories={groupedCategories}
                    disabled={isSubmitting}
                  />

                  <SelectField
                    name="product_condition"
                    label="Condition"
                    options={productConditionOptions}
                    disabled={isSubmitting}
                  />
                </div>

                <TextField
                  name="description"
                  label="Description"
                  placeholder="Describe your product in detail. Include brand, model, specifications, condition details, what's included, reason for selling, etc."
                  disabled={isSubmitting}
                  type="textarea"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  Pricing
                </h2>
                <p className="text-muted-foreground">
                  Set your price in ILS or USD
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  name="price"
                  label="Price"
                  placeholder="0"
                  type="number"
                  valueAsNumber
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

            {/* Location Section */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  Location
                </h2>
                <p className="text-muted-foreground">
                  Where is the item located?
                </p>
              </div>
              <SelectField
                name="location_id"
                label="City/Area"
                placeholder="Select your location"
                options={locations}
                disabled={isSubmitting}
              />
            </div>

            {/* Specifications Section */}
            <div className="border-border bg-card rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  Technical Specifications
                </h2>
                <p className="text-muted-foreground">
                  Add detailed specs to help buyers make informed decisions
                </p>
              </div>
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
                disabled={isSubmitting || isPending}
                className="flex-1"
                size="lg"
              >
                {(isSubmitting || isPending) && <LoadingSubmittingSpinner />}
                {isPending
                  ? 'Redirecting...'
                  : isSubmitting
                    ? mode === 'create'
                      ? 'Creating...'
                      : 'Updating...'
                    : mode === 'create'
                      ? 'Create Listing'
                      : 'Update Listing'}
              </Button>

              {handleCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting || isPending}
                  size="lg"
                  className="hover:text-white"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-1">
            <LivePreview
              groupedCategories={groupedCategories}
              locations={locations}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ListingFormClient;

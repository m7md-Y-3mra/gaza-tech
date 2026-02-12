import { DEFAULT_CURRENCY, DEFAULT_PRODUCT_CONDITION } from '../../constant';
import {
  Currency,
  ProductCondition,
  SpecificationEnum,
  specifications,
} from '../../types';
import { ListingFormInitialData } from './types';

// export const productConditionOptions = Object.entries(ProductCondition).map(
//     ([key, value]) => ({
//         value: key,
//         label: value,
//     })
// );

// Build locale-aware options
export const getProductConditionOptions = (t: (msg: string) => string) =>
  Object.keys(ProductCondition).map((key) => ({
    value: key,
    label: t(`condition.${key}`),
  }));

export const currencyOptions = Object.entries(Currency).map(([key, value]) => ({
  value: key,
  label: value,
}));

// Build default specifications array from predefined keys
const defaultSpecifications = Object.keys(specifications).map((key) => ({
  label: key as SpecificationEnum,
  value: '',
  isCustom: false as const,
}));

// Determine form default values based on mode
export const getDefaultValues = (initialData?: ListingFormInitialData) => {
  const defaultValues = initialData
    ? {
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        currency: initialData.currency,
        category_id: initialData.category_id,
        product_condition: initialData.product_condition,
        location_id: initialData.location_id,
        specifications: initialData.specifications,
        images: initialData.images,
      }
    : {
        title: '',
        description: '',
        price: 0,
        currency: DEFAULT_CURRENCY,
        category_id: '',
        product_condition: DEFAULT_PRODUCT_CONDITION,
        location_id: '',
        specifications: defaultSpecifications,
        images: [],
      };

  return defaultValues;
};

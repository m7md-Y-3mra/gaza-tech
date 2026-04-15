export const isNew = (productCondition: string) => {
  const isNew = ['brand_new', 'used_excellent'].includes(
    productCondition.toLowerCase()
  );
  return isNew;
};

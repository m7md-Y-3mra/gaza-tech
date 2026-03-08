export const isNew = (productCondition: string) => {
  const isNew = ['new', 'like new', 'brand new', 'good'].includes(
    productCondition.toLowerCase()
  );
  return isNew;
};

export const formatPrice = (price: number, currency: string | null) => {
  const currencySymbol = currency === 'USD' ? '$' : '₪';
  const formattedPrice = `${currencySymbol}${price.toLocaleString()}`;
  return formattedPrice;
};

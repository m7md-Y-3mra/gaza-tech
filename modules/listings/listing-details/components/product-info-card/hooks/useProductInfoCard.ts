import { UseProductInfoCardProps } from "../types";

export const useProductInfoCard = ({
    price,
    currency,
    phoneNumber,
}: UseProductInfoCardProps) => {
    const currencySymbol = currency === 'USD' ? '$' : '₪';
    const formattedPrice = `${currencySymbol}${price.toLocaleString()}`;

    const handleCall = () => {
        window.location.href = `tel:${phoneNumber}`;
    };

    return {
        formattedPrice,
        handleCall,
    };
}
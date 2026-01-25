import { formatPrice } from "@/modules/listings/utils/format-price";
import { isNew } from "@/modules/listings/utils/is-new";
import { UseProductCardProps } from "../types";

export const useProductCard = ({ price, currency, productCondition }: UseProductCardProps) => {
    const formattedPrice = formatPrice(price, currency);
    const isNewProduct = isNew(productCondition);

    return {
        formattedPrice,
        isNewProduct,
    }
}
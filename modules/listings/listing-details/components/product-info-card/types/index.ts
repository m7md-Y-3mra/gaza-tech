import { string } from "zod";

export type ProductInfoCardProps = {
    price: number;
    currency: string;
    title: string;
    categoryName: string;
    phoneNumber: string;
}

export type UseProductInfoCardProps = Pick<ProductInfoCardProps, "price" | "phoneNumber" | "currency"> 
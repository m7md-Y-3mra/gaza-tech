import { Currency, ProductCondition } from "../../types";

export const productConditionOptions = Object.entries(ProductCondition).map(
    ([key, value]) => ({
        value: key,
        label: value,
    })
);

export const currencyOptions = Object.entries(Currency).map(([key, value]) => ({
    value: key,
    label: value,
}));

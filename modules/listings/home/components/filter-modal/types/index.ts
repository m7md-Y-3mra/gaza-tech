import { ListingsSearchParamsType } from "../../../search-params";

export type FilterModalClientProps = {
    locations: { id: string; name: string }[]
    searchParams: ListingsSearchParamsType;
}

export type FilterModalProps = {
    searchParams: ListingsSearchParamsType;
}

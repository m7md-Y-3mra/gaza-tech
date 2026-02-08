import { GroupedCategory } from "@/modules/listings/types";

export type LivePreviewProps = {
    groupedCategories?: GroupedCategory[];
    locations?: Array<{ value: string; label: string }>;
};

export type UseLivePreviewProps = LivePreviewProps;
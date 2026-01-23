export type Specification = {
    label: string;
    value: string;
    isCustom?: boolean;
};

export type SpecificationsProps = {
    specifications: Specification[];
};

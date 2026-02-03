export type SelectOption = {
    value: string;
    label: string;
};

export type SelectFieldProps = {
    name: string;
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    Icon?: React.ComponentType<{ className: string }>;
    isSuccess?: boolean;
    successMessage?: string;
    disabled?: boolean;
};

export const OCR_STATUS_CONFIG: Record<
    string,
    { bg: string; text: string; label: string; pulse?: boolean }
> = {
    pending: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-400',
        label: 'OCR Pending',
        pulse: true,
    },
    processing: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-400',
        label: 'OCR Processing…',
        pulse: true,
    },
    completed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        label: 'OCR Completed',
    },
    failed: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        label: 'OCR Failed',
    },
};

export const PULSE_COLOR: Record<string, string> = {
    pending: 'bg-amber-500',
    processing: 'bg-blue-500',
};

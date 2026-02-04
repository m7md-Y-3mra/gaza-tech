export type ImageFile = {
    id: string;
    file: File;
    preview: string;
    isThumbnail: boolean;
};

export type ImageUploadProps = {
    name: string;
    label?: string;
    maxImages?: number;
    maxSizeMB?: number;
    acceptedFormats?: string[];
    disabled?: boolean;
};

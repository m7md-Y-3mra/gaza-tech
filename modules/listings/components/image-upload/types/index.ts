export type ImageFile = {
    id: string;
    file: File;
    preview: string;
    isThumbnail: boolean;
};

export type ImageUploadProps = {
    name: string;
    disabled?: boolean;
};

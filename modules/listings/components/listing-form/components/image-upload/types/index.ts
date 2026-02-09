export type ImageFileBase = {
    id: string;
    preview: string;
    isThumbnail: boolean;
};

export type CreateImageFile = ImageFileBase & {
    isExisting: false,
    file: File;
}

export type UpdateImageFile = ImageFileBase & {
    isExisting: true,
}

export type ImageFile = CreateImageFile | UpdateImageFile;

type ImageUploadCreateProps = {
    mode: 'create'
}

type ImageUploadUpdateProps = {
    mode: 'update'
    initialImages: UpdateImageFile[]
}

export type ImageUploadProps = {
    name: string;
    disabled?: boolean;
} & (ImageUploadCreateProps | ImageUploadUpdateProps);

type UseImageUploadBase = {
    name: string
}

export type UseImageUploadCreate = UseImageUploadBase & {
    mode: 'create',
}

export type UseImageUploadUpdate = UseImageUploadBase & {
    mode: 'update',
    initialImages: ImageUploadUpdateProps['initialImages']
}

export type UseImageUploadProps = UseImageUploadCreate | UseImageUploadUpdate; 
import {
  CreateImageFile,
  ImageFileBase,
  UpdateImageFile,
} from '../../../types';

export type ImageFileBaseUploadImage = ImageFileBase & {
  id: string;
};

export type CreateImageFileUploadImage = ImageFileBaseUploadImage &
  CreateImageFile & {
    preview: string;
  };

export type UpdateImageFileUploadImage = ImageFileBaseUploadImage &
  UpdateImageFile;

export type ImageFileUploadImage =
  | CreateImageFileUploadImage
  | UpdateImageFileUploadImage;

type ImageUploadCreateProps = {
  mode: 'create';
};

type ImageUploadUpdateProps = {
  mode: 'update';
  initialImages: ImageFileUploadImage[];
};

export type ImageUploadProps = {
  name: string;
  disabled?: boolean;
} & (ImageUploadCreateProps | ImageUploadUpdateProps);

type UseImageUploadBase = {
  name: string;
};

export type UseImageUploadCreate = UseImageUploadBase & {
  mode: 'create';
};

export type UseImageUploadUpdate = UseImageUploadBase & {
  mode: 'update';
  initialImages: ImageUploadUpdateProps['initialImages'];
};

export type UseImageUploadProps = UseImageUploadCreate | UseImageUploadUpdate;

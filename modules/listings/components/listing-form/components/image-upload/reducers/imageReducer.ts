import type { ImageFileUploadImage } from '../types';

// ─── State ───────────────────────────────────────────────────────────
export type ImageState = {
  images: ImageFileUploadImage[];
};

// ─── Actions ─────────────────────────────────────────────────────────
type AddImagesAction = {
  type: 'ADD_IMAGES';
  payload: { files: File[]; remainingSlots: number };
};

type RemoveImageAction = {
  type: 'REMOVE_IMAGE';
  payload: { id: string };
};

type SetThumbnailAction = {
  type: 'SET_THUMBNAIL';
  payload: { id: string };
};

type ReorderImagesAction = {
  type: 'REORDER_IMAGES';
  payload: { startIndex: number; endIndex: number };
};

export type ImageAction =
  | AddImagesAction
  | RemoveImageAction
  | SetThumbnailAction
  | ReorderImagesAction;

// ─── Reducer ─────────────────────────────────────────────────────────
export const imageReducer = (
  state: ImageState,
  action: ImageAction
): ImageState => {
  switch (action.type) {
    case 'ADD_IMAGES': {
      const { files, remainingSlots } = action.payload;
      const newImageFiles: ImageFileUploadImage[] = files
        .slice(0, remainingSlots)
        .map((file, i) => ({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          isThumbnail: state.images.length === 0 ? i === 0 : false,
          isExisting: false as const,
        }));

      // Only the very first image overall should be thumbnail
      // if (state.images.length === 0 && newImageFiles.length > 0) {
      //     newImageFiles.forEach((img, i) => {
      //         img.isThumbnail = i === 0;
      //     });
      // } else {
      //     newImageFiles.forEach((img) => {
      //         img.isThumbnail = false;
      //     });
      // }

      return { images: [...state.images, ...newImageFiles] };
    }

    case 'REMOVE_IMAGE': {
      const { id } = action.payload;
      const removedImage = state.images.find((img) => img.id === id);

      // Revoke object URL to prevent memory leaks
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }

      const newImages = state.images.filter((img) => img.id !== id);

      // If removed image was thumbnail, promote the first remaining image
      if (removedImage?.isThumbnail && newImages.length > 0) {
        newImages[0] = { ...newImages[0], isThumbnail: true };
      }

      return { images: newImages };
    }

    case 'SET_THUMBNAIL': {
      const { id } = action.payload;
      return {
        images: state.images.map((img) => ({
          ...img,
          isThumbnail: img.id === id,
        })),
      };
    }

    case 'REORDER_IMAGES': {
      const { startIndex, endIndex } = action.payload;
      const newImages = Array.from(state.images);
      const [removed] = newImages.splice(startIndex, 1);
      newImages.splice(endIndex, 0, removed);
      return { images: newImages };
    }

    default:
      return state;
  }
};

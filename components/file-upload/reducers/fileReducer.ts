// components/file-upload/reducers/fileReducer.ts

import type { FileUploadItem, FileUploadDisplayMode } from '../types';

// ─── State ───────────────────────────────────────────────────────────
export type FileUploadState = {
  files: FileUploadItem[];
};

// ─── Actions ─────────────────────────────────────────────────────────
type AddFilesAction = {
  type: 'ADD_FILES';
  payload: {
    files: File[];
    remainingSlots: number;
    displayMode: FileUploadDisplayMode;
  };
};

type RemoveFileAction = {
  type: 'REMOVE_FILE';
  payload: { id: string };
};

type SetThumbnailAction = {
  type: 'SET_THUMBNAIL';
  payload: { id: string };
};

type ReorderFilesAction = {
  type: 'REORDER_FILES';
  payload: { startIndex: number; endIndex: number };
};

export type FileUploadAction =
  | AddFilesAction
  | RemoveFileAction
  | SetThumbnailAction
  | ReorderFilesAction;

// ─── Reducer ─────────────────────────────────────────────────────────
export const fileReducer = (
  state: FileUploadState,
  action: FileUploadAction
): FileUploadState => {
  switch (action.type) {
    case 'ADD_FILES': {
      const { files, remainingSlots, displayMode } = action.payload;
      const newFiles: FileUploadItem[] = files
        .slice(0, remainingSlots)
        .map((file, i) => ({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          isThumbnail:
            displayMode === 'image-grid' && state.files.length === 0 && i === 0,
          isExisting: false as const,
        }));

      return { files: [...state.files, ...newFiles] };
    }

    case 'REMOVE_FILE': {
      const { id } = action.payload;
      const removedFile = state.files.find((f) => f.id === id);

      if (removedFile) {
        URL.revokeObjectURL(removedFile.preview);
      }

      const newFiles = state.files.filter((f) => f.id !== id);

      if (removedFile?.isThumbnail && newFiles.length > 0) {
        newFiles[0] = { ...newFiles[0], isThumbnail: true };
      }

      return { files: newFiles };
    }

    case 'SET_THUMBNAIL': {
      const { id } = action.payload;
      return {
        files: state.files.map((f) => ({
          ...f,
          isThumbnail: f.id === id,
        })),
      };
    }

    case 'REORDER_FILES': {
      const { startIndex, endIndex } = action.payload;
      const newFiles = Array.from(state.files);
      const [removed] = newFiles.splice(startIndex, 1);
      newFiles.splice(endIndex, 0, removed);
      return { files: newFiles };
    }

    default:
      return state;
  }
};

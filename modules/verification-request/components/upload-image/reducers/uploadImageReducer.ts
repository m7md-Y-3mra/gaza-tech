// ─── State ───────────────────────────────────────────────────────────
export type UploadImageState = {
    preview: string | null;
    isDragging: boolean;
};

// ─── Actions ─────────────────────────────────────────────────────────
type SetPreviewAction = {
    type: 'SET_PREVIEW';
    payload: { preview: string };
};

type ClearPreviewAction = {
    type: 'CLEAR_PREVIEW';
};

type SetDraggingAction = {
    type: 'SET_DRAGGING';
    payload: { isDragging: boolean };
};

export type UploadImageAction =
    | SetPreviewAction
    | ClearPreviewAction
    | SetDraggingAction;

// ─── Reducer ─────────────────────────────────────────────────────────
export const uploadImageReducer = (
    state: UploadImageState,
    action: UploadImageAction,
): UploadImageState => {
    switch (action.type) {
        case 'SET_PREVIEW':
            return { ...state, preview: action.payload.preview };

        case 'CLEAR_PREVIEW':
            return { ...state, preview: null };

        case 'SET_DRAGGING':
            return { ...state, isDragging: action.payload.isDragging };

        default:
            return state;
    }
};

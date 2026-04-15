export type ContentType = 'listing' | 'post' | 'comment' | 'user';

export interface ReportModalProps {
  contentType: ContentType;
  contentId: string;
  contentOwnerId: string;
  isOpen: boolean;
  onClose: () => void;
}

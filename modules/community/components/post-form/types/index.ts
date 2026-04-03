import { FileUploadItem } from '@/components/file-upload/types';
import { PostCategory } from '@/modules/community/types';

export type PostFormInitialData = {
  title: string;
  content: string;
  post_category: PostCategory;
  attachments: FileUploadItem[];
};

export type PostFormClientProps =
  | {
      mode: 'create';
    }
  | {
      mode: 'update';
      postId: string;
      initialData: PostFormInitialData;
    };

export type PostFormProps = {
  mode?: 'create' | 'update';
  postId?: string;
};

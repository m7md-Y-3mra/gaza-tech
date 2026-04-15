import type { PostCategory } from '@/modules/community/types';

export type CategoryTab = {
  value: PostCategory | '';
  labelKey: string;
};

export const CATEGORY_TABS: CategoryTab[] = [
  { value: '', labelKey: 'filters.all' },
  { value: 'questions', labelKey: 'filters.questions' },
  { value: 'tips', labelKey: 'filters.tips' },
  { value: 'news', labelKey: 'filters.news' },
  { value: 'troubleshooting', labelKey: 'filters.troubleshooting' },
];

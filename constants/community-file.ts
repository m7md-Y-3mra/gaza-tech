export const MAX_COMMUNITY_UPLOAD_SIZE = 1024 * 1024 * 5; // 5MB
export const MAX_COMMUNITY_ATTACHMENTS = 5;
export const ACCEPTED_COMMUNITY_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

export const POST_CATEGORIES = {
  questions: 'questions',
  tips: 'tips',
  news: 'news',
  troubleshooting: 'troubleshooting',
} as const;

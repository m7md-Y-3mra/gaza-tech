import { FileSearch } from 'lucide-react';

export default function DisplayPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <FileSearch className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        No User Selected
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        Select a user from the queue to begin reviewing their verification
        request and submitted documents.
      </p>
    </div>
  );
}

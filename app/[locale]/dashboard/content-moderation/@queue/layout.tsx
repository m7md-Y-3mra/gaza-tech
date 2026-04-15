import ReportQueueSearch from '@/modules/content-moderation/components/report-queue-search/ReportQueueSearch';
import ReportQueueFilters from '@/modules/content-moderation/components/report-queue-filters/ReportQueueFilters';

export default function QueueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="bg-background/50 sticky top-0 z-10 space-y-3 border-b p-4 backdrop-blur-sm">
        <h2 className="text-lg font-bold">Report Queue</h2>
        <ReportQueueSearch />
        <ReportQueueFilters />
      </div>

      {children}
    </div>
  );
}

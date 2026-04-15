import { Suspense } from 'react';
import { Flag } from 'lucide-react';
import { reportQueueSearchParamsCache } from '@/modules/content-moderation/search-params';
import { getReportByIdQuery } from '@/modules/content-moderation/queries';
import ReportedContentDisplay from '@/modules/content-moderation/components/reported-content-display/ReportedContentDisplay';
import type { SearchParams } from 'nuqs';

async function ReportDetail({ reportId }: { reportId: string }) {
  const report = await getReportByIdQuery(reportId);
  return <ReportedContentDisplay report={report} />;
}

export default async function ReportDisplayPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { reportId } = await reportQueueSearchParamsCache.parse(searchParams);

  if (!reportId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-12 text-center">
        <div className="bg-muted mb-6 rounded-full p-6">
          <Flag className="text-muted-foreground/50 h-12 w-12" />
        </div>
        <h3 className="text-xl font-bold">Content Moderation</h3>
        <p className="text-muted-foreground mt-2">
          Select a report from the queue to review details.
        </p>
      </div>
    );
  }

  return (
    <Suspense key={reportId} fallback={<div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" /></div>}>
      <ReportDetail reportId={reportId} />
    </Suspense>
  );
}

import { Suspense } from 'react';
import { reportQueueSearchParamsCache } from '@/modules/content-moderation/search-params';
import { getReportByIdQuery } from '@/modules/content-moderation/queries';
import ActionButtons from '@/modules/content-moderation/components/action-buttons/ActionButtons';
import type { SearchParams } from 'nuqs';

async function ReportActions({ reportId }: { reportId: string }) {
  const report = await getReportByIdQuery(reportId);
  return <ActionButtons report={report} />;
}

export default async function ReportActionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { reportId } = await reportQueueSearchParamsCache.parse(searchParams);

  if (!reportId) return null;

  return (
    <Suspense key={reportId} fallback={null}>
      <ReportActions reportId={reportId} />
    </Suspense>
  );
}

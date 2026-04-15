import React from 'react';
import { getReportQueueQuery } from '@/modules/content-moderation/queries';
import { ReportQueueSearchParamsType } from '@/modules/content-moderation/search-params';
import ReportQueueList from '@/modules/content-moderation/components/report-queue-list/ReportQueueList';
import ReportQueuePagination from '@/modules/content-moderation/components/report-queue-pagination/ReportQueuePagination';

interface QueueContentProps {
  params: ReportQueueSearchParamsType;
}

const QueueContent: React.FC<QueueContentProps> = async ({ params }) => {
  const { items, totalCount } = await getReportQueueQuery(params);

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <ReportQueueList items={items} />
      </div>
      <ReportQueuePagination totalCount={totalCount} />
    </>
  );
};

export default QueueContent;

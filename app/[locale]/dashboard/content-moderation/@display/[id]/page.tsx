import React from 'react';
import { getReportByIdQuery } from '@/modules/content-moderation/queries';
import ReportedContentDisplay from '@/modules/content-moderation/components/reported-content-display/ReportedContentDisplay';

export default async function ReportDetailDisplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReportByIdQuery(id);

  return <ReportedContentDisplay report={report} />;
}

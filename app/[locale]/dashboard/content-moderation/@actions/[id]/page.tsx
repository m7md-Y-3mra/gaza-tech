import React from 'react';
import { getReportByIdQuery } from '@/modules/content-moderation/queries';
import ActionButtons from '@/modules/content-moderation/components/action-buttons/ActionButtons';

export default async function ReportDetailActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReportByIdQuery(id);

  return <ActionButtons report={report} />;
}

'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { AdminDashboardStatsResponse } from '../../types';
import { toast } from 'sonner';

interface ExportButtonProps {
  stats: AdminDashboardStatsResponse;
}

export function ExportButton({ stats }: ExportButtonProps) {
  const t = useTranslations('Dashboard.export');
  const tSummary = useTranslations('Dashboard.summary');

  const handleExport = () => {
    try {
      // 1. Prepare Summary Sheet
      const summaryData = [
        {
          Metric: tSummary('totalUsers'),
          Value: stats.summary.total_users.current,
        },
        {
          Metric: tSummary('newListings'),
          Value: stats.summary.new_listings.current,
        },
        {
          Metric: tSummary('newPosts'),
          Value: stats.summary.new_posts.current,
        },
        {
          Metric: tSummary('pendingReports'),
          Value: stats.summary.pending_reports.current,
        },
        {
          Metric: tSummary('pendingVerifications'),
          Value: stats.summary.pending_verifications.current,
        },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);

      // 2. Prepare Trend Sheet (Users)
      const usersSheet = XLSX.utils.json_to_sheet(stats.trends.daily_new_users);

      // 3. Prepare Trend Sheet (Listings)
      const listingsSheet = XLSX.utils.json_to_sheet(
        stats.trends.listing_growth
      );

      // 4. Create Workbook and Append Sheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
      XLSX.utils.book_append_sheet(wb, usersSheet, 'New Users');
      XLSX.utils.book_append_sheet(wb, listingsSheet, 'Listing Growth');

      // 5. Trigger Download
      const fileName = `dashboard-stats-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(t('success'));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('error'));
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {t('button')}
    </Button>
  );
}

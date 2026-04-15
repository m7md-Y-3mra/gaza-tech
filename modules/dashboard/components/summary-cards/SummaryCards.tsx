import {
  Users,
  ShoppingBag,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SummaryCard } from './SummaryCard';
import { AdminDashboardSummary, MetricComparison } from '../../types';

interface SummaryCardsProps {
  summary: AdminDashboardSummary;
}

/**
 * Calculates the percentage change between current and previous values.
 */
function calculateChange(metric: MetricComparison): number {
  if (metric.previous === 0) return metric.current > 0 ? 100 : 0;
  return ((metric.current - metric.previous) / metric.previous) * 100;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const t = useTranslations('Dashboard.summary');

  const cards = [
    {
      title: t('totalUsers'),
      metric: summary.total_users,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: t('newListings'),
      metric: summary.new_listings,
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      title: t('newPosts'),
      metric: summary.new_posts,
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      title: t('pendingReports'),
      metric: summary.pending_reports,
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      title: t('pendingVerifications'),
      metric: summary.pending_verifications,
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((card, index) => (
        <SummaryCard
          key={index}
          title={card.title}
          value={card.metric.current}
          percentageChange={calculateChange(card.metric)}
          icon={card.icon}
        />
      ))}
    </div>
  );
}

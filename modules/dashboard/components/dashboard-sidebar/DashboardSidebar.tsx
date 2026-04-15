import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

import {
  ArrowLeft,
  ShieldCheck,
  Flag,
  Users,
  BarChart3,
  Tags,
} from 'lucide-react';
import { getPendingReportCountQuery } from '@/modules/content-moderation/queries';
import { getPendingVerificationCountQuery } from '@/modules/verification-review/queries';
import { Badge } from '@/components/ui/badge';
import { getTranslations } from 'next-intl/server';

export default async function DashboardSidebar() {
  const t = await getTranslations();

  const [pendingReportsCount, pendingVerificationCount] = await Promise.all([
    getPendingReportCountQuery(),
    getPendingVerificationCountQuery(),
  ]);

  // Menu items.
  const items = [
    {
      title: t('DashboardSidebar.statistics'),
      url: '/dashboard',
      icon: BarChart3,
      badge: null,
    },
    {
      title: t('DashboardSidebar.verificationReview'),
      url: '/dashboard/verification-review',
      icon: ShieldCheck,
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : null,
    },
    {
      title: t('DashboardSidebar.contentModeration'),
      url: '/dashboard/content-moderation',
      icon: Flag,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
    },
    {
      title: t('DashboardSidebar.userManagement'),
      url: '/dashboard/users',
      icon: Users,
      badge: null,
    },
    {
      title: t('DashboardSidebar.management'),
      url: '/dashboard/management',
      icon: Tags,
      badge: null,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="text-sky-700 hover:text-sky-600">
                <ArrowLeft />
                <span>{t('DashboardSidebar.backToSite')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {t('DashboardSidebar.dashboard')}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex w-full items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant="destructive"
                          className="h-5 min-w-5 justify-center px-1"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

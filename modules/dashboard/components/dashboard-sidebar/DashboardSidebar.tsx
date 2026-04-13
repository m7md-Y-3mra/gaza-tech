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

import { ArrowLeft, ShieldCheck, Flag } from 'lucide-react';
import { getPendingReportCountQuery } from '@/modules/content-moderation/queries';
import { getPendingVerificationCountQuery } from '@/modules/verification-review/queries';
import { Badge } from '@/components/ui/badge';

export default async function DashboardSidebar() {
  const [pendingReportsCount, pendingVerificationCount] = await Promise.all([
    getPendingReportCountQuery(),
    getPendingVerificationCountQuery(),
  ]);

  // Menu items.
  const items = [
    {
      title: 'Verification Review',
      url: '/dashboard/verification-review',
      icon: ShieldCheck,
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : null,
    },
    {
      title: 'Content Moderation',
      url: '/dashboard/content-moderation',
      icon: Flag,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
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
                <span>Back to site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="destructive" className="h-5 min-w-5 px-1 justify-center">
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

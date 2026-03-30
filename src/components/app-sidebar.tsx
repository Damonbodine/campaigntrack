"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  ScrollText,
  Gift,
  CalendarCheck,
  BarChart3,
  Settings,
  UserCog,
  Thermometer,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Donors", href: "/donors", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { label: "Pledges", href: "/pledges", icon: ScrollText },
  { label: "Gifts", href: "/gifts", icon: Gift },
  { label: "Activities", href: "/activities", icon: CalendarCheck },
];

const SECONDARY_NAV = [
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Board View", href: "/board", icon: Thermometer },
  { label: "Users", href: "/users", icon: UserCog },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Thermometer className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">CampaignTrack</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
            Campaign
          </SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{label}</span>
                      {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
            Management
          </SidebarGroupLabel>
          <SidebarMenu>
            {SECONDARY_NAV.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/sign-in" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Account</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

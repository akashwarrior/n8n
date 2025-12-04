"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { WorkflowIcon } from "@/components/ui/workflow-icon";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { CreateOptionsDropdown } from "@/components/create-options-dropdown";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Templates",
      url: "/templates",
      icon: IconFileDescription,
    },
    {
      title: "Get Help",
      url: "https://x.com/skyGuptaCS",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full overflow-hidden p-2">
              <Link
                href="/"
                prefetch={false}
                className="flex items-center gap-2"
              >
                <WorkflowIcon />
                <span className="text-base font-semibold min-w-16">n8n</span>
              </Link>

              <CreateOptionsDropdown>
                <SidebarMenuButton
                  className={cn(
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground",
                    "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0! group-data-[collapsible=icon]:delay-0 w-8! opacity-100 transition-all duration-100 ease-in delay-75",
                  )}
                >
                  <IconPlus />
                </SidebarMenuButton>
              </CreateOptionsDropdown>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="w-auto!" />

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <Button
        variant="outline"
        size="icon"
        className="size-7 absolute bottom-0 top-0 -right-4 my-auto bg-sidebar! rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          toggleSidebar();
        }}
      >
        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
    </Sidebar>
  );
}

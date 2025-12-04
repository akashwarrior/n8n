"use client";

import { cn } from "@/lib/utils";
import { IconPlus, type Icon } from "@tabler/icons-react";
import { CreateOptionsDropdown } from "../create-options-dropdown";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu
          className={cn(
            "opacity-0 h-0 w-8 overflow-hidden -ml-px",
            "group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:size-8",
            "transition-all duration-75 ease-in",
          )}
        >
          <SidebarMenuItem className="flex items-center gap-2">
            <CreateOptionsDropdown>
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <IconPlus />
              </SidebarMenuButton>
            </CreateOptionsDropdown>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
